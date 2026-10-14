"""
CLI script to trigger source acquisition independently of the web application.
<<<<<<< HEAD
Can be executed manually or as a background periodic scheduler:
    python scripts/run_acquisition.py --source all --limit 10
    python scripts/run_acquisition.py --scheduler --interval 30
=======
Can be executed via Windows Task Scheduler or cron:
    python scripts/run_acquisition.py --source all --limit 20
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
"""

import argparse
import json
import os
import sys
<<<<<<< HEAD
import time
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.services.source_runner import (
    run_all_sources_ingestion,
<<<<<<< HEAD
    run_ashby_ingestion,
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
    run_greenhouse_ingestion,
    run_lever_ingestion,
)


<<<<<<< HEAD
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


=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
def main():
    parser = argparse.ArgumentParser(description="JobSpace Automated Source Acquisition Runner")
    parser.add_argument(
        "--source",
<<<<<<< HEAD
        choices=["all", "greenhouse", "lever", "ashby"],
=======
        choices=["all", "greenhouse", "lever"],
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
        default="all",
        help="Source adapter to run (default: all)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit of jobs to fetch per company source",
    )
<<<<<<< HEAD
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
=======
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
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5


if __name__ == "__main__":
    main()
