"""
CLI script to trigger source acquisition independently of the web application.
Can be executed manually or as a background periodic scheduler:
    python scripts/run_acquisition.py --source all --limit 10
    python scripts/run_acquisition.py --scheduler --interval 30
"""

import argparse
import json
import os
import sys
import time

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.services.source_runner import (
    run_all_sources_ingestion,
    run_ashby_ingestion,
    run_greenhouse_ingestion,
    run_lever_ingestion,
)


def run_cycle(source: str, limit: int | None):
    db = SessionLocal()
    try:
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Starting acquisition for source: {source} (limit per source: {limit})")
        if source == "greenhouse":
            result = run_greenhouse_ingestion(db, limit_per_source=limit)
        elif source == "lever":
            result = run_lever_ingestion(db, limit_per_source=limit)
        elif source == "ashby":
            result = run_ashby_ingestion(db, limit_per_source=limit)
        else:
            result = run_all_sources_ingestion(db, limit_per_source=limit)

        print("\nAcquisition Results Summary:")
        print(json.dumps(result, indent=2))
        print(f"\nDone. Status: {result['status']}, Created: {result['total_created']}, Skipped: {result['total_skipped']}")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="JobSpace Automated Source Acquisition Runner")
    parser.add_argument(
        "--source",
        choices=["all", "greenhouse", "lever", "ashby"],
        default="all",
        help="Source adapter to run (default: all)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit of jobs to fetch per company source",
    )
    parser.add_argument(
        "--scheduler",
        action="store_true",
        help="Run continuously as a periodic acquisition scheduler",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=30,
        help="Interval in minutes between acquisition cycles in scheduler mode (default: 30)",
    )
    args = parser.parse_args()

    if args.scheduler:
        print(f"Starting JobSpace acquisition scheduler (interval: {args.interval} minutes)...")
        while True:
            try:
                run_cycle(args.source, args.limit)
            except Exception as exc:
                print(f"Error during scheduled acquisition: {exc}", file=sys.stderr)
            print(f"Waiting {args.interval} minutes until next cycle...")
            time.sleep(args.interval * 60)
    else:
        run_cycle(args.source, args.limit)


if __name__ == "__main__":
    main()
