import json
import logging
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.candidate import CandidateProfile
from app.models.job import Job
from app.models.resume import Resume
from app.schemas.candidate import RecommendationItem
from app.schemas.job import JobResponse
from app.services.ai.embedding_service import generate_embedding
from app.services.ai.relevance_gate import (
    classify_job_domain,
    classify_query_intent,
    location_matches,
)
from app.services.candidate_service import get_or_create_candidate_profile
from app.services.saved_job_service import is_job_saved

logger = logging.getLogger(__name__)


def _serialize_job_for_rec(job: Job, user_id: int | None, db: Session) -> JobResponse:
    skills = [
        js.skill.name
        for js in (job.skills or [])
        if getattr(js, "skill", None) is not None
    ]
    is_saved = False
    if user_id:
        is_saved = is_job_saved(db, user_id=user_id, job_id=job.id)

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
        is_saved=is_saved,
        skills=skills,
    )


def get_candidate_recommendations(
    db: Session,
    user_id: int,
    limit: int = 20,
) -> list[RecommendationItem]:
    """
    Personalized job intelligence matching:
    Matches candidates to real jobs in the database using their profile,
    skills, preferences, and resume.
    """
    profile = get_or_create_candidate_profile(db, user_id)

    # 1. Gather candidate attributes
    cand_skills = {
        cs.skill.normalized_name: cs.skill.name
        for cs in profile.skills
        if cs.skill is not None
    }

    # Also check if candidate has a current resume with extracted skills
    current_resume = db.scalar(
        select(Resume).where(Resume.user_id == user_id, Resume.is_current.is_(True))
    )
    if current_resume and current_resume.extracted_data:
        try:
            data = json.loads(current_resume.extracted_data)
            for s in data.get("skills", []):
                cand_skills[s.lower()] = s
        except Exception:
            pass

    target_role = (profile.preferred_role or profile.headline or "").strip()
    preferred_loc = (profile.preferred_location or profile.location or "").strip()
    target_exp = (profile.experience_level or "").strip().lower()
    target_employment = (profile.preferred_employment_type or "").strip()
    min_salary = profile.expected_salary_min

    # Candidate profile query representation for vector comparison
    profile_text_parts = []
    if target_role:
        profile_text_parts.append(target_role)
    if cand_skills:
        profile_text_parts.append(" ".join(list(cand_skills.values())[:10]))
    if profile.summary:
        profile_text_parts.append(profile.summary[:200])

    profile_text = " ".join(profile_text_parts).strip()
    cand_embedding = None
    if profile_text:
        try:
            cand_embedding = generate_embedding(profile_text)
        except Exception as exc:
            logger.warning(f"Could not generate candidate embedding: {exc}")

    # 2. Fetch candidate jobs from DB
    stmt = select(Job).where(Job.is_active.is_(True))
    jobs = list(db.scalars(stmt).all())

    recommendations: list[RecommendationItem] = []

    for job in jobs:
        # Extract job skills
        job_skills_map = {
            js.skill.normalized_name: js.skill.name
            for js in job.skills
            if js.skill is not None
        }

        # --- A. Skill compatibility ---
        matched_keys = set(cand_skills.keys()).intersection(set(job_skills_map.keys()))
        missing_keys = set(job_skills_map.keys()) - set(cand_skills.keys())

        matched_skills_names = [job_skills_map[k] for k in matched_keys]
        missing_skills_names = [job_skills_map[k] for k in missing_keys]

        if job_skills_map:
            skill_score = len(matched_keys) / len(job_skills_map)
        elif cand_skills:
            skill_score = 0.40  # Neutral if job lists no structured skills
        else:
            skill_score = 0.50

        # --- B. Role compatibility ---
        role_score = 0.50
        if target_role:
            title_lower = job.title.lower()
            target_words = [w for w in target_role.lower().split() if len(w) > 2]
            matching_role_words = [w for w in target_words if w in title_lower]
            if matching_role_words:
                role_score = min(1.0, 0.60 + 0.20 * len(matching_role_words))
            else:
                role_score = 0.20

        # --- C. Semantic similarity ---
        semantic_score = 0.50
        if cand_embedding is not None and job.embedding is not None:
            import math
            dot = sum(a * b for a, b in zip(cand_embedding, job.embedding))
            norm_a = math.sqrt(sum(a * a for a in cand_embedding))
            norm_b = math.sqrt(sum(b * b for b in job.embedding))
            if norm_a > 0 and norm_b > 0:
                sim = dot / (norm_a * norm_b)
                semantic_score = max(0.0, min(1.0, float(sim)))

        # --- D. Location compatibility ---
        location_score = 1.0 if not preferred_loc else 0.2
        if preferred_loc and job.location:
            if location_matches(preferred_loc, job.location):
                location_score = 1.0

        # --- E. Experience compatibility ---
        exp_score = 1.0 if not target_exp else 0.5
        if target_exp and job.experience_level:
            if target_exp in job.experience_level.lower():
                exp_score = 1.0
            elif target_exp == "junior" and "entry" in job.experience_level.lower():
                exp_score = 1.0

        # --- F. Salary compatibility ---
        salary_score = 1.0 if not min_salary else 0.5
        if min_salary and job.salary_max:
            if job.salary_max >= min_salary:
                salary_score = 1.0
            else:
                salary_score = 0.2

        # Combined compatibility score (Skill 35%, Role 25%, Semantic 20%, Location 10%, Exp 10%)
        final_score = (
            0.35 * skill_score
            + 0.25 * role_score
            + 0.20 * semantic_score
            + 0.10 * location_score
            + 0.10 * exp_score
        )

        # Minimum compatibility threshold (35%)
        if final_score < 0.35:
            continue

        # Build transparent explanation reasons
        reasons: list[str] = []
        if matched_skills_names:
            reasons.append(f"\u2713 {len(matched_skills_names)} matching skills: {', '.join(matched_skills_names[:3])}")
        if target_role and role_score >= 0.6:
            reasons.append(f"\u2713 Matches target role: {job.title}")
        if preferred_loc and location_score == 1.0 and job.location:
            reasons.append(f"\u2713 Preferred location: {job.location}")
        if target_exp and exp_score == 1.0 and job.experience_level:
            reasons.append(f"\u2713 Experience level match: {job.experience_level.capitalize()}")
        if min_salary and salary_score == 1.0 and job.salary_min:
            lpa = job.salary_min / 100000
            reasons.append(f"\u2713 Meets salary expectation: \u20b9{lpa:g}+ LPA")

        if not reasons:
            reasons.append("\u2713 Overall profile and background alignment")

        skill_pct = int(skill_score * 100)
        overall_pct = int(final_score * 100)

        job_resp = _serialize_job_for_rec(job, user_id=user_id, db=db)
        recommendations.append(
            RecommendationItem(
                job=job_resp,
                compatibility_score=round(final_score, 4),
                match_percentage=overall_pct,
                match_reasons=reasons,
                skill_match_percentage=skill_pct,
                matched_skills=matched_skills_names,
                missing_skills=missing_skills_names,
            )
        )

    # Sort by compatibility percentage descending
    recommendations.sort(key=lambda r: r.compatibility_score, reverse=True)

    return recommendations[:limit]
