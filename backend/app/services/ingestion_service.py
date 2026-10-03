import logging
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.job import Job
from app.models.skill import JobSkill, Skill
from app.schemas.ingestion import JobIngestionItem
from app.services.ai.job_analyzer import analyze_job
from app.services.ai.job_embedding_service import generate_job_embedding
from app.services.skill_extraction import extract_skills_from_text

logger = logging.getLogger(__name__)


def ingest_jobs(
    db: Session,
    jobs_data: list[JobIngestionItem],
    skip_ai: bool = False,
    skip_embedding: bool = False,
) -> tuple[int, int]:
    """
    Common ingestion pipeline for all job sources.

    Performs:
    1. Intra-batch and database duplicate detection
    2. Updates to existing jobs where appropriate
    3. Job record persistence
    4. Resilient AI job analysis (failure does not corrupt ingestion)
    5. Deduplicated skill extraction and association
    6. Resilient embedding generation (failure does not abort ingestion)
    """

    created = 0
    skipped = 0
    seen_in_batch: set[tuple[str, str]] = set()

    for job_data in jobs_data:
        title_clean = job_data.title.strip() if job_data.title else ""
        company_clean = job_data.company.strip() if job_data.company else ""
        source_clean = job_data.source.strip() if job_data.source else "external"
        source_url_clean = job_data.source_url.strip() if job_data.source_url else None
        description_clean = job_data.description.strip() if job_data.description else ""

        if not title_clean or not company_clean or not description_clean:
            logger.warning("Skipping job with empty required fields (title, company, or description).")
            skipped += 1
            continue

        # --------------------------------------------------
        # 1. Intra-batch duplicate check
        # --------------------------------------------------
        batch_key = (
            (source_clean, source_url_clean)
            if source_url_clean
            else (company_clean.lower(), title_clean.lower())
        )
        if batch_key in seen_in_batch:
            skipped += 1
            continue
        seen_in_batch.add(batch_key)

        # --------------------------------------------------
        # 2. Database duplicate check
        # --------------------------------------------------
        existing_job = None
        if source_url_clean:
            existing_job = db.scalar(
                select(Job).where(
                    Job.source == source_clean,
                    Job.source_url == source_url_clean,
                )
            )
        else:
            # Fallback duplicate check for sources without unique source_url
            existing_job = db.scalar(
                select(Job).where(
                    func.lower(Job.company) == company_clean.lower(),
                    func.lower(Job.title) == title_clean.lower(),
                    func.lower(func.coalesce(Job.location, ""))
                    == (job_data.location.strip().lower() if job_data.location else ""),
                )
            )

        if existing_job is not None:
            # Update existing job with refreshed metadata if present
            updated = False
            if job_data.posted_at and existing_job.posted_at != job_data.posted_at:
                existing_job.posted_at = job_data.posted_at
                updated = True
            if job_data.salary_min is not None and existing_job.salary_min != job_data.salary_min:
                existing_job.salary_min = job_data.salary_min
                updated = True
            if job_data.salary_max is not None and existing_job.salary_max != job_data.salary_max:
                existing_job.salary_max = job_data.salary_max
                updated = True
            if job_data.employment_type and not existing_job.employment_type:
                existing_job.employment_type = job_data.employment_type
                updated = True
            if job_data.location and not existing_job.location:
                existing_job.location = job_data.location
                updated = True

            if updated:
                db.flush()

            skipped += 1
            continue

        # --------------------------------------------------
        # 3. Create job
        # --------------------------------------------------
        job = Job(
            title=title_clean,
            company=company_clean,
            description=description_clean,
            location=job_data.location.strip() if job_data.location else None,
            employment_type=job_data.employment_type.strip() if job_data.employment_type else None,
            experience_level=job_data.experience_level.strip().lower() if job_data.experience_level else None,
            salary_min=job_data.salary_min,
            salary_max=job_data.salary_max,
            source=source_clean,
            source_url=source_url_clean,
            posted_at=job_data.posted_at,
            analysis_status="pending",
        )

        db.add(job)
        db.flush()

        # --------------------------------------------------
        # 4. AI job analysis (Failure Isolated)
        # --------------------------------------------------
        if not skip_ai:
            try:
                analysis = analyze_job(job.description)
                job.summary = analysis.summary
                if analysis.experience_level is not None:
                    job.experience_level = analysis.experience_level
                job.analysis_status = "completed"
            except Exception as exc:
                logger.warning(f"AI analysis failed for job {job.id} ({job.title}): {exc}")
                job.analysis_status = "failed"
        else:
            job.analysis_status = "pending"

        # --------------------------------------------------
        # 5. Skill extraction and deduplicated persistence
        # --------------------------------------------------
        try:
            extracted_skills = extract_skills_from_text(job.description)
            assigned_skill_ids: set[int] = set()

            for skill_data in extracted_skills:
                raw_name = skill_data["name"].strip()
                normalized_name = raw_name.lower()

                skill = db.scalar(
                    select(Skill).where(Skill.normalized_name == normalized_name)
                )

                if skill is None:
                    skill = Skill(
                        name=raw_name,
                        normalized_name=normalized_name,
                    )
                    db.add(skill)
                    db.flush()

                if skill.id not in assigned_skill_ids:
                    job_skill = JobSkill(
                        job_id=job.id,
                        skill_id=skill.id,
                        skill_type=skill_data["skill_type"],
                    )
                    db.add(job_skill)
                    assigned_skill_ids.add(skill.id)

            db.flush()
        except Exception as exc:
            logger.error(f"Skill extraction/association failed for job {job.id}: {exc}")

        # --------------------------------------------------
        # 6. Generate embedding (Failure Isolated)
        # --------------------------------------------------
        if not skip_embedding:
            try:
                generate_job_embedding(db=db, job=job)
            except Exception as exc:
                logger.warning(f"Embedding generation failed for job {job.id}: {exc}")
                job.embedding = None

        created += 1

    # Persist all changes for this batch
    db.commit()

    return created, skipped


def backfill_missing_embeddings(db: Session, limit: int = 50) -> int:
    """
    Find jobs that lack embeddings and generate them.
    """
    statement = (
        select(Job)
        .where(Job.embedding.is_(None))
        .limit(limit)
    )
    jobs = list(db.scalars(statement).all())
    processed = 0

    for job in jobs:
        try:
            generate_job_embedding(db=db, job=job)
            processed += 1
        except Exception as exc:
            logger.warning(f"Failed to generate embedding for job {job.id}: {exc}")

    if processed > 0:
        db.commit()

    return processed


def reprocess_failed_analyses(db: Session, limit: int = 20) -> int:
    """
    Find jobs where AI analysis previously failed and retry.
    """
    statement = (
        select(Job)
        .where(Job.analysis_status == "failed")
        .limit(limit)
    )
    jobs = list(db.scalars(statement).all())
    processed = 0

    for job in jobs:
        try:
            analysis = analyze_job(job.description)
            job.summary = analysis.summary
            if analysis.experience_level:
                job.experience_level = analysis.experience_level
            job.analysis_status = "completed"
            processed += 1
        except Exception as exc:
            logger.warning(f"Reprocessing AI analysis failed for job {job.id}: {exc}")

    if processed > 0:
        db.commit()

    return processed