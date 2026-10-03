"""
CLI script to trigger source acquisition independently of the web application.
Can be executed via Windows Task Scheduler or cron:
    python scripts/run_acquisition.py --source all --limit 20
"""

import argparse
import json
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.services.source_runner import (
    run_all_sources_ingestion,
    run_greenhouse_ingestion,
    run_lever_ingestion,
)


def main():
    parser = argparse.ArgumentParser(description="JobSpace Automated Source Acquisition Runner")
    parser.add_argument(
        "--source",
        choices=["all", "greenhouse", "lever"],
        default="all",
        help="Source adapter to run (default: all)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit of jobs to fetch per company source",
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        print(f"Starting acquisition for source: {args.source} (limit per source: {args.limit})")
        if args.source == "greenhouse":
            result = run_greenhouse_ingestion(db, limit_per_source=args.limit)
        elif args.source == "lever":
            result = run_lever_ingestion(db, limit_per_source=args.limit)
        else:
            result = run_all_sources_ingestion(db, limit_per_source=args.limit)

        print("\nAcquisition Results Summary:")
        print(json.dumps(result, indent=2))
        print(f"\nDone. Total created: {result['total_created']}, Total skipped: {result['total_skipped']}")
    except Exception as exc:
        print(f"Error running acquisition: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
