from datetime import datetime, timezone
import logging
from sqlalchemy.orm import Session

from app.services.source_ingestion import ingest_from_source
from app.services.sources.base import JobSource
from app.services.sources.registry import (
    get_all_sources,
    get_greenhouse_sources,
    get_lever_sources,
)

logger = logging.getLogger(__name__)


def run_sources_ingestion(
    db: Session,
    sources: list[JobSource],
    limit_per_source: int | None = None,
) -> dict:
    """
    Run ingestion for an arbitrary list of JobSource instances.
    Failure in one source is strictly isolated and does not stop subsequent sources.
    """
    start_time = datetime.now(timezone.utc)
    results = []
    total_created = 0
    total_skipped = 0

    for source in sources:
        source_name = getattr(source, "company_name", type(source).__name__)
        source_type = type(source).__name__

        try:
            created, skipped = ingest_from_source(
                db=db,
                source=source,
                limit=limit_per_source,
            )

            total_created += created
            total_skipped += skipped

            results.append(
                {
                    "source": source_name,
                    "type": source_type,
                    "status": "success",
                    "created": created,
                    "skipped": skipped,
                }
            )

        except Exception as exc:
            logger.error(f"Source ingestion failed for {source_name}: {exc}")
            results.append(
                {
                    "source": source_name,
                    "type": source_type,
                    "status": "failed",
                    "created": 0,
                    "skipped": 0,
                    "error": str(exc),
                }
            )

    end_time = datetime.now(timezone.utc)
    duration_seconds = round((end_time - start_time).total_seconds(), 2)

    return {
        "status": "completed",
        "started_at": start_time.isoformat(),
        "completed_at": end_time.isoformat(),
        "duration_seconds": duration_seconds,
        "sources_processed": len(results),
        "total_created": total_created,
        "total_skipped": total_skipped,
        "results": results,
    }


def run_greenhouse_ingestion(
    db: Session,
    limit_per_source: int | None = None,
) -> dict:
    """Run ingestion for all configured Greenhouse sources."""
    return run_sources_ingestion(
        db=db,
        sources=get_greenhouse_sources(),
        limit_per_source=limit_per_source,
    )


def run_lever_ingestion(
    db: Session,
    limit_per_source: int | None = None,
) -> dict:
    """Run ingestion for all configured Lever sources."""
    return run_sources_ingestion(
        db=db,
        sources=get_lever_sources(),
        limit_per_source=limit_per_source,
    )


def run_all_sources_ingestion(
    db: Session,
    limit_per_source: int | None = None,
) -> dict:
    """Run ingestion across all configured ATS platforms (Greenhouse, Lever, etc.)."""
    return run_sources_ingestion(
        db=db,
        sources=get_all_sources(),
        limit_per_source=limit_per_source,
    )