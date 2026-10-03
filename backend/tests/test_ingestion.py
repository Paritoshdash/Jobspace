import uuid
from sqlalchemy.orm import Session

from app.models.job import Job
from app.schemas.ingestion import JobIngestionItem
from app.services.ingestion_service import ingest_jobs


def test_ingestion_and_duplicate_prevention(db_session: Session):
    unique_url = f"https://boards.greenhouse.io/test/jobs/{uuid.uuid4().hex[:10]}"
    job_item = JobIngestionItem(
        title="Senior Python Architect",
        company="PyCorp",
        description="We need an expert in Python, FastAPI, and PostgreSQL with Docker experience.",
        location="Remote",
        employment_type="Full-time",
        experience_level="senior",
        source="greenhouse",
        source_url=unique_url,
    )

    # First ingestion -> created = 1, skipped = 0
    created, skipped = ingest_jobs(db_session, [job_item], skip_ai=True, skip_embedding=True)
    assert created == 1
    assert skipped == 0

    # Second ingestion with same URL -> created = 0, skipped = 1
    created_dup, skipped_dup = ingest_jobs(db_session, [job_item], skip_ai=True, skip_embedding=True)
    assert created_dup == 0
    assert skipped_dup == 1


def test_intra_batch_duplicate_prevention(db_session: Session):
    unique_url = f"https://boards.greenhouse.io/test/jobs/{uuid.uuid4().hex[:10]}"
    batch = [
        JobIngestionItem(
            title="Backend Engineer",
            company="BatchCorp",
            description="Working with Go, Kubernetes and Docker.",
            source="greenhouse",
            source_url=unique_url,
        ),
        JobIngestionItem(
            title="Backend Engineer",
            company="BatchCorp",
            description="Working with Go, Kubernetes and Docker.",
            source="greenhouse",
            source_url=unique_url,
        ),
    ]

    created, skipped = ingest_jobs(db_session, batch, skip_ai=True, skip_embedding=True)
    assert created == 1
    assert skipped == 1


def test_skills_extracted_and_deduplicated_during_ingestion(db_session: Session):
    unique_url = f"https://boards.greenhouse.io/test/jobs/{uuid.uuid4().hex[:10]}"
    job_item = JobIngestionItem(
        title="Fullstack Developer",
        company="StackCo",
        description="Must know React, TypeScript and Python. Python is required. Nice to have: Docker.",
        source="greenhouse",
        source_url=unique_url,
    )

    created, skipped = ingest_jobs(db_session, [job_item], skip_ai=True, skip_embedding=True)
    assert created == 1

    job = db_session.query(Job).filter(Job.source_url == unique_url).first()
    assert job is not None
    skill_names = [js.skill.name.lower() for js in job.skills]

    # Verify skills were extracted
    assert "python" in skill_names
    assert "react" in skill_names
    assert "typescript" in skill_names
    assert "docker" in skill_names

    # Verify no duplicates for the same skill in this job
    assert len(skill_names) == len(set(skill_names))
