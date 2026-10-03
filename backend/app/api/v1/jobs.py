from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_optional_current_user
from app.db.session import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.ingestion import (
    JobIngestionRequest,
    JobIngestionResponse,
)
from app.schemas.job import (
    JobCreate,
    JobFacetsResponse,
    JobResponse,
    JobSearchResult,
)
from app.schemas.job_skill import JobSkillResponse, JobSkillsCreate
from app.services.ai.job_analyzer import (
    analyze_job,
    summarize_job,
)
from app.services.ai.job_search_service import semantic_job_search
from app.services.ai.query_parser import parse_search_query
from app.services.ingestion_service import ingest_jobs
from app.services.job_service import (
    add_job_skills,
    create_job,
    get_job_by_id,
    get_job_facets,
    get_job_skills,
    get_jobs,
)
from app.services.saved_job_service import is_job_saved

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"],
)


def _serialize_job(job: Job, current_user: User | None = None, db: Session | None = None) -> JobResponse:
    skills = [
        js.skill.name
        for js in (job.skills or [])
        if getattr(js, "skill", None) is not None
    ]
    is_saved = False
    if current_user and db:
        is_saved = is_job_saved(db, user_id=current_user.id, job_id=job.id)

    return JobResponse(
        id=job.id,
        title=job.title,
        company=job.company,
        description=job.description,
        summary=job.summary,
        analysis_status=job.analysis_status,
        location=job.location,
        employment_type=job.employment_type,
        experience_level=job.experience_level,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        source=job.source,
        source_url=job.source_url,
        posted_at=job.posted_at,
        created_at=job.created_at,
        updated_at=job.updated_at,
        is_saved=is_saved if current_user else None,
        skills=skills,
    )


@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job_endpoint(
    job_data: JobCreate,
    db: Session = Depends(get_db),
):
    job = create_job(db, job_data)
    return _serialize_job(job)


@router.get(
    "/facets",
    response_model=JobFacetsResponse,
)
def get_facets_endpoint(
    db: Session = Depends(get_db),
):
    """Retrieve distinct facet options for frontend filters."""
    return get_job_facets(db)


@router.get(
    "",
    response_model=list[JobResponse],
)
def list_jobs(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    company: str | None = Query(default=None),
    location: str | None = Query(default=None),
    experience_level: str | None = Query(default=None),
    employment_type: str | None = Query(default=None),
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    jobs = get_jobs(
        db=db,
        skip=skip,
        limit=limit,
        company=company,
        location=location,
        experience_level=experience_level,
        employment_type=employment_type,
    )
    return [_serialize_job(j, current_user=current_user, db=db) for j in jobs]


@router.get(
    "/search",
    response_model=list[JobSearchResult],
)
def search_jobs(
    q: str = Query(
        ...,
        min_length=1,
        description="Natural language job search query",
    ),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=50),
    company: str | None = Query(default=None),
    location: str | None = Query(default=None),
    experience_level: str | None = Query(default=None),
    employment_type: str | None = Query(default=None),
    min_salary: int | None = Query(default=None, ge=0),
    max_salary: int | None = Query(default=None, ge=0),
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    try:
        parsed_query = parse_search_query(q)

        # Allow explicit query params to override or supplement natural language parsed values
        final_location = location or parsed_query.location
        final_experience = experience_level or parsed_query.experience_level
        final_employment = employment_type or parsed_query.employment_type
        final_min_salary = min_salary if min_salary is not None else parsed_query.min_salary
        final_max_salary = max_salary if max_salary is not None else parsed_query.max_salary

        results = semantic_job_search(
            db=db,
            query=parsed_query.query,
            skip=skip,
            limit=limit,
            company=company,
            location=final_location,
            experience_level=final_experience,
            employment_type=final_employment,
            min_salary=final_min_salary,
            max_salary=final_max_salary,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return [
        {
            "job": _serialize_job(job, current_user=current_user, db=db),
            "relevance_score": score,
        }
        for job, score in results
    ]


@router.get(
    "/{job_id}",
    response_model=JobResponse,
)
def get_job(
    job_id: int,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    job = get_job_by_id(
        db=db,
        job_id=job_id,
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    return _serialize_job(job, current_user=current_user, db=db)


@router.post(
    "/{job_id}/summarize",
)
def summarize_job_endpoint(
    job_id: int,
    db: Session = Depends(get_db),
):
    job = get_job_by_id(
        db=db,
        job_id=job_id,
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    if not job.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is empty.",
        )

    summary = summarize_job(job.description)

    return {
        "job_id": job.id,
        "summary": summary,
    }


@router.post(
    "/{job_id}/analyze",
)
def analyze_job_endpoint(
    job_id: int,
    db: Session = Depends(get_db),
):
    job = get_job_by_id(
        db=db,
        job_id=job_id,
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found.",
        )

    if not job.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is empty.",
        )

    job.analysis_status = "pending"
    db.commit()

    try:
        analysis = analyze_job(job.description)
    except ValueError as exc:
        job.analysis_status = "failed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        )

    job.summary = analysis.summary
    job.experience_level = analysis.experience_level
    job.analysis_status = "completed"

    db.commit()
    db.refresh(job)

    return {
        "job_id": job.id,
        "analysis": analysis.model_dump(),
        "analysis_status": job.analysis_status,
    }


@router.post(
    "/{job_id}/skills",
    response_model=list[JobSkillResponse],
    status_code=status.HTTP_201_CREATED,
)
def add_skills_to_job(
    job_id: int,
    skills_data: JobSkillsCreate,
    db: Session = Depends(get_db),
):
    try:
        job_skills = add_job_skills(
            db=db,
            job_id=job_id,
            skills_data=skills_data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    return [
        {
            "id": job_skill.id,
            "name": job_skill.skill.name,
            "normalized_name": job_skill.skill.normalized_name,
            "skill_type": job_skill.skill_type,
        }
        for job_skill in job_skills
    ]


@router.get(
    "/{job_id}/skills",
    response_model=list[JobSkillResponse],
)
def get_skills_for_job(
    job_id: int,
    db: Session = Depends(get_db),
):
    try:
        job_skills = get_job_skills(
            db=db,
            job_id=job_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )

    return [
        {
            "id": job_skill.id,
            "name": job_skill.skill.name,
            "normalized_name": job_skill.skill.normalized_name,
            "skill_type": job_skill.skill_type,
        }
        for job_skill in job_skills
    ]


@router.post(
    "/ingest",
    response_model=JobIngestionResponse,
    status_code=status.HTTP_201_CREATED,
)
def ingest_jobs_endpoint(
    ingestion_data: JobIngestionRequest,
    skip_ai: bool = Query(default=False),
    skip_embedding: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    created, skipped = ingest_jobs(
        db=db,
        jobs_data=ingestion_data.jobs,
        skip_ai=skip_ai,
        skip_embedding=skip_embedding,
    )

    return JobIngestionResponse(
        created=created,
        skipped=skipped,
    )