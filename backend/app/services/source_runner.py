from datetime import datetime, timezone
import json
import logging
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.acquisition import AcquisitionRun
from app.services.source_ingestion import ingest_from_source
from app.services.sources.base import JobSource
from app.services.sources.registry import (
    get_all_sources,
    get_ashby_sources,
    get_greenhouse_sources,
    get_lever_sources,
)

logger = logging.getLogger(__name__)


def run_sources_ingestion(
    db: Session,
    sources: list[JobSource],
    source_type_label: str = "custom",
    limit_per_source: int | None = None,
) -> dict:
    """
    Run ingestion for an arbitrary list of JobSource instances.
    Failure in one source is strictly isolated and does not stop subsequent sources.
    Logs run outcome in database (AcquisitionRun).
    """
    start_time = datetime.now(timezone.utc)
    results = []
    total_created = 0
    total_skipped = 0
    failed_sources = 0

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
            failed_sources += 1
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

    # Determine overall status
    if failed_sources == 0:
        overall_status = "completed"
    elif failed_sources < len(sources):
        overall_status = "completed_with_errors"
    else:
        overall_status = "failed"

    summary = {
        "status": overall_status,
        "source_type": source_type_label,
        "started_at": start_time.isoformat(),
        "completed_at": end_time.isoformat(),
        "duration_seconds": duration_seconds,
        "sources_processed": len(results),
        "total_created": total_created,
        "total_skipped": total_skipped,
        "failed_sources": failed_sources,
        "results": results,
    }

    # Persist acquisition run record
    try:
        run_record = AcquisitionRun(
            source_type=source_type_label,
            status=overall_status,
            sources_count=len(sources),
            total_created=total_created,
            total_updated=0,
            total_skipped=total_skipped,
            duration_seconds=duration_seconds,
            error_message=f"{failed_sources} sources encountered errors" if failed_sources else None,
            summary_json=json.dumps(summary),
        )
        db.add(run_record)
        db.commit()
    except Exception as exc:
        logger.warning(f"Failed to record AcquisitionRun: {exc}")
        db.rollback()

    return summary


def run_greenhouse_ingestion(
    db: Session,
    limit_per_source: int | None = None,
) -> dict:
    """Run ingestion for all configured Greenhouse sources."""
    return run_sources_ingestion(
        db=db,
        sources=get_greenhouse_sources(),
        source_type_label="greenhouse",
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
        source_type_label="lever",
        limit_per_source=limit_per_source,
    )


def run_ashby_ingestion(
    db: Session,
    limit_per_source: int | None = None,
) -> dict:
    """Run ingestion for all configured Ashby sources."""
    return run_sources_ingestion(
        db=db,
        sources=get_ashby_sources(),
        source_type_label="ashby",
        limit_per_source=limit_per_source,
    )


def run_all_sources_ingestion(
    db: Session,
    limit_per_source: int | None = None,
) -> dict:
    """Run ingestion across all configured ATS platforms (Greenhouse, Lever, Ashby, etc.)."""
    return run_sources_ingestion(
        db=db,
        sources=get_all_sources(),
        source_type_label="all",
        limit_per_source=limit_per_source,
    )


def get_acquisition_status(db: Session) -> dict:
    """
    Get latest acquisition run status and summary.
    """
    stmt = select(AcquisitionRun).order_by(AcquisitionRun.created_at.desc()).limit(1)
    latest = db.scalar(stmt)
    if not latest:
        return {
            "status": "idle",
            "last_run": None,
            "message": "No acquisition runs have been logged yet.",
        }

    return {
        "status": latest.status,
        "last_run_at": latest.created_at.isoformat(),
        "source_type": latest.source_type,
        "sources_count": latest.sources_count,
        "total_created": latest.total_created,
        "total_skipped": latest.total_skipped,
        "duration_seconds": latest.duration_seconds,
        "error_message": latest.error_message,
        "summary": json.loads(latest.summary_json) if latest.summary_json else None,
    }