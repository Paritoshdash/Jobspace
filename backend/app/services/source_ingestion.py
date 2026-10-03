from sqlalchemy.orm import Session

from app.services.ingestion_service import ingest_jobs
from app.services.sources.base import JobSource


def ingest_from_source(
    db: Session,
    source: JobSource,
    limit: int | None = None,
) -> tuple[int, int]:
    """
    Fetch jobs from an external source and send them
    through the standard JobSpace ingestion pipeline.
    """

    jobs = source.fetch_jobs()

    if limit is not None:
        jobs = jobs[:limit]

    if not jobs:
        return 0, 0

    return ingest_jobs(
        db=db,
        jobs_data=jobs,
    )