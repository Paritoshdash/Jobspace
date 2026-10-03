from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.job import Job
from app.models.skill import JobSkill, Skill
from app.schemas.job import JobCreate
from app.schemas.job_skill import JobSkillsCreate


def create_job(db: Session, job_data: JobCreate) -> Job:
    job = Job(
        title=job_data.title,
        company=job_data.company,
        description=job_data.description,
        location=job_data.location,
        employment_type=job_data.employment_type,
        experience_level=job_data.experience_level,
        salary_min=job_data.salary_min,
        salary_max=job_data.salary_max,
        source=job_data.source,
        source_url=job_data.source_url,
        posted_at=job_data.posted_at,
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


def get_jobs(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    company: str | None = None,
    location: str | None = None,
    experience_level: str | None = None,
    employment_type: str | None = None,
) -> list[Job]:
    statement = select(Job).options(joinedload(Job.skills).joinedload(JobSkill.skill))

    if company:
        statement = statement.where(Job.company.ilike(f"%{company.strip()}%"))

    if location:
        statement = statement.where(Job.location.ilike(f"%{location.strip()}%"))

    if experience_level:
        statement = statement.where(Job.experience_level.ilike(experience_level.strip()))

    if employment_type:
        statement = statement.where(Job.employment_type.ilike(employment_type.strip()))

    statement = (
        statement
        .order_by(Job.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    return list(db.scalars(statement).unique().all())


def get_job_by_id(db: Session, job_id: int) -> Job | None:
    statement = (
        select(Job)
        .options(joinedload(Job.skills).joinedload(JobSkill.skill))
        .where(Job.id == job_id)
    )
    return db.scalar(statement)


def get_job_facets(db: Session) -> dict:
    """Returns available facet options for search/filtering in the UI."""
    locations = [
        loc for (loc,) in db.query(Job.location).distinct().all()
        if loc and loc.strip()
    ]
    companies = [
        comp for (comp,) in db.query(Job.company).distinct().all()
        if comp and comp.strip()
    ]
    experience_levels = [
        exp for (exp,) in db.query(Job.experience_level).distinct().all()
        if exp and exp.strip()
    ]
    employment_types = [
        emp for (emp,) in db.query(Job.employment_type).distinct().all()
        if emp and emp.strip()
    ]
    sources = [
        src for (src,) in db.query(Job.source).distinct().all()
        if src and src.strip()
    ]
    total_jobs = db.scalar(select(func.count(Job.id))) or 0

    return {
        "locations": sorted(locations),
        "companies": sorted(companies),
        "experience_levels": sorted(experience_levels),
        "employment_types": sorted(employment_types),
        "sources": sorted(sources),
        "total_jobs": total_jobs,
    }


def add_job_skills(
    db: Session,
    job_id: int,
    skills_data: JobSkillsCreate,
) -> list[JobSkill]:

    job = db.get(Job, job_id)

    if job is None:
        raise ValueError("Job not found.")

    created_job_skills = []

    for skill_data in skills_data.skills:
        normalized_name = skill_data.name.strip().lower()

        skill = db.scalar(
            select(Skill).where(
                Skill.normalized_name == normalized_name
            )
        )

        if skill is None:
            skill = Skill(
                name=skill_data.name.strip(),
                normalized_name=normalized_name,
            )
            db.add(skill)
            db.flush()

        existing_job_skill = db.scalar(
            select(JobSkill).where(
                JobSkill.job_id == job_id,
                JobSkill.skill_id == skill.id,
            )
        )

        if existing_job_skill is not None:
            created_job_skills.append(existing_job_skill)
            continue

        job_skill = JobSkill(
            job_id=job_id,
            skill_id=skill.id,
            skill_type=skill_data.skill_type.strip().lower(),
        )

        db.add(job_skill)
        created_job_skills.append(job_skill)

    db.commit()

    for job_skill in created_job_skills:
        db.refresh(job_skill)

    return created_job_skills


def get_job_skills(
    db: Session,
    job_id: int,
) -> list[JobSkill]:

    job = db.get(Job, job_id)

    if job is None:
        raise ValueError("Job not found.")

    statement = (
        select(JobSkill)
        .options(joinedload(JobSkill.skill))
        .where(JobSkill.job_id == job_id)
        .order_by(JobSkill.id)
    )

    return list(db.scalars(statement).all())