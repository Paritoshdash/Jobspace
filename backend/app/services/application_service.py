from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.application import Application
from app.models.job import Job


def create_application(
    db: Session,
    user_id: int,
    job_id: int,
    status: str = "applied",
) -> Application:
    """Create a new application for a job. If one exists, returns existing application."""
    job = db.get(Job, job_id)
    if job is None:
        raise ValueError("Job not found.")

    existing = db.scalar(
        select(Application)
        .options(joinedload(Application.job))
        .where(
            Application.user_id == user_id,
            Application.job_id == job_id,
        )
    )
    if existing:
        return existing

    app = Application(
        user_id=user_id,
        job_id=job_id,
        status=status.strip().lower(),
        applied_at=datetime.now(timezone.utc),
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def get_user_applications(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
) -> list[Application]:
    """List applications submitted by a user, ordered by updated timestamp descending."""
    statement = (
        select(Application)
        .options(joinedload(Application.job))
        .where(Application.user_id == user_id)
        .order_by(Application.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def get_application_by_id(
    db: Session,
    application_id: int,
    user_id: int,
) -> Application | None:
    """Get a specific application belonging to the user."""
    statement = (
        select(Application)
        .options(joinedload(Application.job))
        .where(
            Application.id == application_id,
            Application.user_id == user_id,
        )
    )
    return db.scalar(statement)


def update_application_status(
    db: Session,
    application_id: int,
    user_id: int,
    status: str,
) -> Application:
    """Update the status of an application."""
    app = get_application_by_id(db, application_id, user_id)
    if app is None:
        raise ValueError("Application not found.")

    app.status = status.strip().lower()
    db.commit()
    db.refresh(app)
    return app


def delete_application(
    db: Session,
    application_id: int,
    user_id: int,
) -> bool:
    """Delete/withdraw an application."""
    app = get_application_by_id(db, application_id, user_id)
    if app is None:
        return False

    db.delete(app)
    db.commit()
    return True
