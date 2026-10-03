from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.application import SavedJob
from app.models.job import Job


def save_job(db: Session, user_id: int, job_id: int) -> SavedJob:
    """Save a job for a user. If already saved, returns existing record."""
    job = db.get(Job, job_id)
    if job is None:
        raise ValueError("Job not found.")

    existing = db.scalar(
        select(SavedJob)
        .options(joinedload(SavedJob.job))
        .where(
            SavedJob.user_id == user_id,
            SavedJob.job_id == job_id,
        )
    )
    if existing:
        return existing

    saved = SavedJob(user_id=user_id, job_id=job_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


def unsave_job(db: Session, user_id: int, job_id: int) -> bool:
    """Unsave a job for a user. Returns True if removed, False if not saved."""
    saved = db.scalar(
        select(SavedJob).where(
            SavedJob.user_id == user_id,
            SavedJob.job_id == job_id,
        )
    )
    if not saved:
        return False

    db.delete(saved)
    db.commit()
    return True


def get_saved_jobs(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
) -> list[SavedJob]:
    """List saved jobs for a user, ordered by saved timestamp descending."""
    statement = (
        select(SavedJob)
        .options(joinedload(SavedJob.job))
        .where(SavedJob.user_id == user_id)
        .order_by(SavedJob.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def is_job_saved(db: Session, user_id: int, job_id: int) -> bool:
    """Check if a specific job is saved by the user."""
    result = db.scalar(
        select(SavedJob.id).where(
            SavedJob.user_id == user_id,
            SavedJob.job_id == job_id,
        )
    )
    return result is not None
