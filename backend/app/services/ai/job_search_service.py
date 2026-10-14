import logging
<<<<<<< HEAD
import re
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.job import Job
from app.services.ai.embedding_service import generate_embedding
<<<<<<< HEAD
from app.services.ai.relevance_gate import (
    classify_query_intent,
    evaluate_job_relevance_gate,
    location_matches,
)
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
from app.services.ai.skill_extractor import extract_query_skills
from app.services.ranking_service import (
    calculate_final_score,
    calculate_job_skill_match,
    calculate_metadata_match_score,
)

logger = logging.getLogger(__name__)

<<<<<<< HEAD
# Minimum combined relevance threshold to be presented to user
MIN_RELEVANCE_THRESHOLD = 0.38


def _build_match_reasons(
    job: Job,
    query_text: str,
    requested_skills: list[str],
    matched_skills: list[str],
    location: str | None = None,
    experience_level: str | None = None,
    min_salary: int | None = None,
) -> list[str]:
    """
    Generate human-understandable explanation badges for the match.
    """
    reasons: list[str] = []

    # 1. Role match
    q_words = [w for w in re.findall(r"\w+", query_text.lower()) if len(w) > 2 and w not in {"jobs", "job", "developer", "engineer"}]
    title_lower = job.title.lower()
    matching_title_words = [w for w in q_words if w in title_lower]
    if matching_title_words:
        reasons.append(f"Role match: {job.title}")
    elif any(term in title_lower for term in ["software", "developer", "engineer", "lead"]):
        reasons.append("Relevant role title")

    # 2. Skill match
    if matched_skills:
        top_skills = matched_skills[:3]
        reasons.append(f"Matched skills: {', '.join(top_skills)}")

    # 3. Location match
    if location and job.location and location_matches(location, job.location):
        reasons.append(f"Location: {job.location}")

    # 4. Experience match
    if experience_level and job.experience_level:
        if job.experience_level.lower() == experience_level.lower():
            reasons.append(f"Experience: {job.experience_level.capitalize()}")

    # 5. Salary match
    if min_salary and job.salary_min and job.salary_min >= min_salary:
        lpa = job.salary_min / 100000
        reasons.append(f"Salary meets preference: \u20b9{lpa:g}+ LPA")

    if not reasons:
        reasons.append("Semantic profile alignment")

    return reasons

=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5

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
<<<<<<< HEAD
    sort_by: str = "relevance",  # "relevance", "newest", "salary"
) -> list[tuple[Job, float, list[str]]]:
    """
    Search jobs with strict relevance gating, intent classification, and multi-factor ranking.
    Rejects irrelevant cross-domain results (e.g., 'plumber' will NEVER match 'AI Engineer').
    Zero results returned if no genuinely relevant postings exist.
=======
) -> list[tuple[Job, float]]:
    """
    Search jobs using semantic similarity and structured filters,
    then rank candidates using semantic, skill, and metadata scores.
    Falls back gracefully to keyword/text search if vector search is unavailable.
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
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

<<<<<<< HEAD
    # 1. Query intent understanding & skill extraction
    query_intent = classify_query_intent(query)
    requested_skills = extract_query_skills(query)

    # If the user is specifically looking for a NON_TECH role (e.g. plumber, broker, nurse)
    # do NOT query vector embeddings of tech jobs. Directly query for text matches on that role!
    if query_intent.domain == "NON_TECH":
        role_term = query_intent.matched_role_term or query.strip()
        non_tech_stmt = (
            select(Job)
            .where(
                or_(
                    Job.title.ilike(f"%{role_term}%"),
                    Job.description.ilike(f"%{role_term}%"),
                )
            )
        )
        if location:
            non_tech_stmt = non_tech_stmt.where(Job.location.ilike(f"%{location.strip()}%"))
        results = db.execute(non_tech_stmt.limit(limit)).scalars().all()

        if not results:
            # Genuinely zero relevant jobs in database for this non-tech role
            return []

        # Filter strictly
        gated_results = []
        for job in results:
            is_relevant, _ = evaluate_job_relevance_gate(
                query_intent=query_intent,
                query_text=query,
                job_title=job.title,
                job_description=job.description,
                job_skills=[s.skill.name for s in job.skills if s.skill],
                semantic_score=0.8,
            )
            if is_relevant:
                reasons = [f"Matches requested role: {role_term.title()}"]
                gated_results.append((job, 0.85, reasons))

        return gated_results[skip : skip + limit]

    # 2. General / Tech Search: Vector Search with Candidate Retrieval
=======
    requested_skills = extract_query_skills(query)

>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
    query_embedding = None
    try:
        query_embedding = generate_embedding(query)
    except Exception as exc:
        logger.warning(f"Failed to generate query embedding, using text fallback: {exc}")

<<<<<<< HEAD
    # Base query with filters
    if query_embedding is not None:
        distance = Job.embedding.cosine_distance(query_embedding)
        statement = select(Job, distance).where(Job.embedding.is_not(None))
    else:
        statement = select(Job, None).where(
            or_(
                Job.title.ilike(f"%{query.strip()}%"),
                Job.company.ilike(f"%{query.strip()}%"),
                Job.description.ilike(f"%{query.strip()}%"),
            )
        )

    # Structured metadata filters
    if location:
        statement = statement.where(Job.location.ilike(f"%{location.strip()}%"))

    if company:
        statement = statement.where(Job.company.ilike(f"%{company.strip()}%"))

    if experience_level:
        statement = statement.where(Job.experience_level.ilike(experience_level.strip()))

    if employment_type:
        statement = statement.where(Job.employment_type.ilike(employment_type.strip()))
=======
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
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5

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

<<<<<<< HEAD
    # Candidate pool for reranking and gating
    candidate_limit = min(max((skip + limit) * 4, 40), 200)
=======
    # Retrieve candidate pool for reranking
    candidate_limit = min(max((skip + limit) * 3, 30), 150)
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5

    if query_embedding is not None:
        statement = statement.order_by(distance).limit(candidate_limit)
    else:
        statement = statement.order_by(Job.created_at.desc()).limit(candidate_limit)

<<<<<<< HEAD
    raw_candidates = db.execute(statement).all()

    # Fallback to lexical search if vector search returned nothing
    if not raw_candidates and query_embedding is not None:
        fallback_stmt = select(Job, None).where(
            or_(
                Job.title.ilike(f"%{query.strip()}%"),
                Job.company.ilike(f"%{query.strip()}%"),
                Job.description.ilike(f"%{query.strip()}%"),
=======
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
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
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

<<<<<<< HEAD
        raw_candidates = db.execute(fallback_stmt.order_by(Job.created_at.desc()).limit(candidate_limit)).all()

    # 3. Apply Hard Relevance Gate and Multi-Factor Scoring
    passed_results: list[tuple[Job, float, list[str]]] = []

    for job, distance_val in raw_candidates:
        if distance_val is not None:
            semantic_score = max(0.0, min(1.0, 1.0 - float(distance_val)))
        else:
            q_lower = query.lower()
            semantic_score = 0.50
            if q_lower in job.title.lower():
                semantic_score += 0.35
            if q_lower in job.company.lower():
                semantic_score += 0.10

        job_skills = [
            js.skill.name
            for js in job.skills
            if getattr(js, "skill", None) is not None
        ]

        # RELEVANCE GATE: Discard if rejected by hard compatibility gate
        is_relevant, rejection_reason = evaluate_job_relevance_gate(
            query_intent=query_intent,
            query_text=query,
            job_title=job.title,
            job_description=job.description,
            job_skills=job_skills,
            semantic_score=semantic_score,
        )
        if not is_relevant:
            continue

        # Location alias check if specified
        if location and not location_matches(location, job.location):
            continue
=======
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
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5

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

<<<<<<< HEAD
        # Minimum relevance threshold check
        title_lower = job.title.lower()
        query_words = [
            w for w in re.findall(r"\w+", query.lower())
            if w not in {"in", "and", "or", "for", "with", "a", "an", "the", "jobs", "job", "to", "at", "by", "of", "lpa"}
        ]
        has_direct_keyword_in_title = any(
            re.search(r"\b" + re.escape(w) + r"\b", title_lower)
            for w in query_words
            if len(w) >= 2
        )

        if final_score < 0.28 and not has_direct_keyword_in_title:
            continue

        # Find which skills matched
        req_set = {s.lower() for s in requested_skills}
        matched_skill_names = [s for s in job_skills if s.lower() in req_set]

        reasons = _build_match_reasons(
            job=job,
            query_text=query,
            requested_skills=requested_skills,
            matched_skills=matched_skill_names,
            location=location,
            experience_level=experience_level,
            min_salary=min_salary,
        )

        passed_results.append((job, final_score, reasons))

    # 4. Sorting
    if sort_by == "newest":
        passed_results.sort(
            key=lambda item: item[0].posted_at or item[0].created_at,
            reverse=True,
        )
    elif sort_by == "salary":
        passed_results.sort(
            key=lambda item: item[0].salary_max or item[0].salary_min or 0,
            reverse=True,
        )
    else:
        # Default: relevance
        passed_results.sort(
            key=lambda item: item[1],
            reverse=True,
        )

    return passed_results[skip : skip + limit]
=======
        ranked_results.append((job, final_score))

    ranked_results.sort(
        key=lambda item: item[1],
        reverse=True,
    )

    return ranked_results[skip : skip + limit]
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
