from sqlalchemy.orm import Session

from app.models.job import Job
from app.services.ai.embedding_service import generate_embedding


def generate_job_embedding(
    db: Session,
    job: Job,
) -> Job:
    """Generate and store an embedding for a job."""

    if not job.description.strip():
        raise ValueError("Job description cannot be empty.")

    embedding = generate_embedding(job.description)

    job.embedding = embedding

    db.flush()

    return job