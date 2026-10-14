
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.ingestion_service import (
    backfill_missing_embeddings,
    mark_stale_jobs,
    reprocess_failed_analyses,
)
from app.services.source_runner import (
    get_acquisition_status,
    run_all_sources_ingestion,
    run_ashby_ingestion,
    run_greenhouse_ingestion,
    run_lever_ingestion,
)
from app.services.sources.registry import (
    ASHBY_COMPANIES,
    GREENHOUSE_COMPANIES,
    LEVER_COMPANIES,
)

router = APIRouter(
    prefix="/acquisition",
    tags=["Acquisition"],
)


@router.get("/sources")
def list_registered_sources():
    """List all registered ATS sources and target companies."""
    return {
        "greenhouse": GREENHOUSE_COMPANIES,
        "lever": LEVER_COMPANIES,
        "ashby": ASHBY_COMPANIES,
        "total_sources": (
            len(GREENHOUSE_COMPANIES)
            + len(LEVER_COMPANIES)
            + len(ASHBY_COMPANIES)
        ),
    }


@router.get("/status")
def get_status_endpoint(db: Session = Depends(get_db)):
    """Retrieve the latest source acquisition execution status and metrics."""
    return get_acquisition_status(db)


@router.post("/trigger", status_code=status.HTTP_200_OK)
def trigger_acquisition(
    source_type: str = Query(
        default="all",
        description="Source type to run: 'all', 'greenhouse', 'lever', or 'ashby'",
    ),
    limit_per_source: int | None = Query(
        default=None,
        ge=1,
        description="Optional limit on jobs fetched per source company",
    ),
    db: Session = Depends(get_db),
):
    """Trigger source acquisition independently of search."""
    normalized_type = source_type.lower().strip()

    if normalized_type == "greenhouse":
        return run_greenhouse_ingestion(
            db=db, limit_per_source=limit_per_source
        )

    if normalized_type == "lever":
        return run_lever_ingestion(
            db=db, limit_per_source=limit_per_source
        )

    if normalized_type == "ashby":
        return run_ashby_ingestion(
            db=db, limit_per_source=limit_per_source
        )

    if normalized_type == "all":
        return run_all_sources_ingestion(
            db=db, limit_per_source=limit_per_source
        )

    from fastapi import HTTPException

    raise HTTPException(
        status_code=400,
        detail="Invalid source_type. Use all, greenhouse, lever, or ashby.",
    )


@router.post("/mark-stale")
def mark_stale_endpoint(
    days: int = Query(default=30, ge=1, le=180),
    db: Session = Depends(get_db),
):
    """Mark jobs not seen in recent acquisition cycles as stale."""
    count = mark_stale_jobs(db=db, days=days)
    return {
        "status": "completed",
        "stale_jobs_marked": count,
    }


@router.post("/backfill-embeddings")
def backfill_embeddings_endpoint(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Backfill missing vector embeddings for jobs that lack them."""
    processed = backfill_missing_embeddings(db=db, limit=limit)
    return {
        "status": "completed",
        "jobs_embedded": processed,
    }


@router.post("/reprocess-failed")
def reprocess_failed_endpoint(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retry AI analysis for jobs that previously failed."""
    processed = reprocess_failed_analyses(db=db, limit=limit)
    return {
        "status": "completed",
        "jobs_reprocessed": processed,
    }
