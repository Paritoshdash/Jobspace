import logging
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.job import Job
from app.services.ai.embedding_service import generate_embedding
from app.services.ai.skill_extractor import extract_query_skills
from app.services.ranking_service import (
    calculate_final_score,
    calculate_job_skill_match,
    calculate_metadata_match_score,
)

logger = logging.getLogger(__name__)


def semantic_job_search(
    db: Session,
    query: str,
    skip: int = 0,
    limit: int = 10,
    location: str | None = None,
    experience_level: str | None = None,
    employment_type: str | None = None,
    company: str | None = None,
    min_salary: int | None = None,
    max_salary: int | None = None,
) -> list[tuple[Job, float]]:
    """
    Search jobs using semantic similarity and structured filters,
    then rank candidates using semantic, skill, and metadata scores.
    Falls back gracefully to keyword/text search if vector search is unavailable.
    """

    if not query.strip():
        raise ValueError("Search query cannot be empty.")

    if limit < 1:
        raise ValueError("Limit must be at least 1.")

    if skip < 0:
        raise ValueError("Skip cannot be negative.")

    if min_salary is not None and max_salary is not None:
        if min_salary > max_salary:
            raise ValueError(
                "Minimum salary cannot be greater than maximum salary."
            )

    requested_skills = extract_query_skills(query)

    query_embedding = None
    try:
        query_embedding = generate_embedding(query)
    except Exception as exc:
        logger.warning(f"Failed to generate query embedding, using text fallback: {exc}")

    # 1. Base Query with filters
    if query_embedding is not None:
        distance = Job.embedding.cosine_distance(query_embedding)
        statement = (
            select(Job, distance)
            .where(Job.embedding.is_not(None))
        )
    else:
        # Fallback without embeddings
        statement = (
            select(Job, None)
            .where(
                or_(
                    Job.title.ilike(f"%{query.strip()}%"),
                    Job.company.ilike(f"%{query.strip()}%"),
                    Job.description.ilike(f"%{query.strip()}%"),
                )
            )
        )

    if location:
        statement = statement.where(
            Job.location.ilike(f"%{location.strip()}%")
        )

    if company:
        statement = statement.where(
            Job.company.ilike(f"%{company.strip()}%")
        )

    if experience_level:
        statement = statement.where(
            Job.experience_level.ilike(experience_level.strip())
        )

    if employment_type:
        statement = statement.where(
            Job.employment_type.ilike(employment_type.strip())
        )

    if min_salary is not None:
        statement = statement.where(
            Job.salary_max.is_not(None),
            Job.salary_max >= min_salary,
        )

    if max_salary is not None:
        statement = statement.where(
            Job.salary_min.is_not(None),
            Job.salary_min <= max_salary,
        )

    # Retrieve candidate pool for reranking
    candidate_limit = min(max((skip + limit) * 3, 30), 150)

    if query_embedding is not None:
        statement = statement.order_by(distance).limit(candidate_limit)
    else:
        statement = statement.order_by(Job.created_at.desc()).limit(candidate_limit)

    results = db.execute(statement).all()

    # If vector search returned nothing, try text fallback
    if not results and query_embedding is not None:
        fallback_stmt = (
            select(Job, None)
            .where(
                or_(
                    Job.title.ilike(f"%{query.strip()}%"),
                    Job.company.ilike(f"%{query.strip()}%"),
                    Job.description.ilike(f"%{query.strip()}%"),
                )
            )
        )
        if location:
            fallback_stmt = fallback_stmt.where(Job.location.ilike(f"%{location.strip()}%"))
        if company:
            fallback_stmt = fallback_stmt.where(Job.company.ilike(f"%{company.strip()}%"))
        if experience_level:
            fallback_stmt = fallback_stmt.where(Job.experience_level.ilike(experience_level.strip()))
        if employment_type:
            fallback_stmt = fallback_stmt.where(Job.employment_type.ilike(employment_type.strip()))
        if min_salary is not None:
            fallback_stmt = fallback_stmt.where(Job.salary_max.is_not(None), Job.salary_max >= min_salary)
        if max_salary is not None:
            fallback_stmt = fallback_stmt.where(Job.salary_min.is_not(None), Job.salary_min <= max_salary)

        results = db.execute(fallback_stmt.order_by(Job.created_at.desc()).limit(candidate_limit)).all()

    ranked_results: list[tuple[Job, float]] = []

    for job, distance_val in results:
        if distance_val is not None:
            semantic_score = max(0.0, min(1.0, 1.0 - float(distance_val)))
        else:
            # Approximate relevance for text match
            q_lower = query.lower()
            semantic_score = 0.5
            if q_lower in job.title.lower():
                semantic_score += 0.3
            if q_lower in job.company.lower():
                semantic_score += 0.1

        skill_match_score = calculate_job_skill_match(
            db=db,
            job=job,
            requested_skills=requested_skills,
        )

        metadata_match_score = calculate_metadata_match_score(
            job=job,
            location=location,
            experience_level=experience_level,
            employment_type=employment_type,
        )

        final_score = calculate_final_score(
            semantic_score=semantic_score,
            skill_match_score=skill_match_score,
            metadata_match_score=metadata_match_score,
        )

        ranked_results.append((job, final_score))

    ranked_results.sort(
        key=lambda item: item[1],
        reverse=True,
    )

    return ranked_results[skip : skip + limit]