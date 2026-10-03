from sqlalchemy.orm import Session

from app.models.job import Job

def calculate_final_score(
    semantic_score: float,
    skill_match_score: float = 0.0,
    metadata_match_score: float = 0.0,
) -> float:
    """
    Calculate the final relevance score for a job.
    Weights: 60% semantic, 25% skills, 15% metadata.
    """
    semantic_score = max(0.0, min(1.0, float(semantic_score)))
    skill_match_score = max(0.0, min(1.0, float(skill_match_score)))
    metadata_match_score = max(0.0, min(1.0, float(metadata_match_score)))

    final_score = (
        0.60 * semantic_score
        + 0.25 * skill_match_score
        + 0.15 * metadata_match_score
    )

    return round(final_score, 4)

def calculate_skill_match_score(
    requested_skills: list[str],
    job_skills: list[str],
) -> float:
    """
    Calculate how well a job's skills match the requested skills.

    Returns a score between 0 and 1.
    """

    if not requested_skills:
        return 0.0

    requested = {
        skill.strip().lower()
        for skill in requested_skills
        if skill.strip()
    }

    available = {
        skill.strip().lower()
        for skill in job_skills
        if skill.strip()
    }

    if not requested:
        return 0.0

    matched_skills = requested.intersection(available)

    return round(
        len(matched_skills) / len(requested),
        4,
    )
    
def calculate_job_skill_match(
    db: Session,
    job: Job,
    requested_skills: list[str],
) -> float:
    """
    Calculate the skill match score between a job and requested skills.
    """

    if not requested_skills:
        return 0.0

    job_skills = [
        job_skill.skill.normalized_name
        for job_skill in job.skills
        if job_skill.skill is not None
    ]

    return calculate_skill_match_score(
        requested_skills=requested_skills,
        job_skills=job_skills,
    )
    
def calculate_metadata_match_score(
    job: Job,
    location: str | None = None,
    experience_level: str | None = None,
    employment_type: str | None = None,
) -> float:
    """
    Calculate a simple metadata match score.

    Only explicitly requested metadata fields are considered.
    """

    requested_fields = 0
    matched_fields = 0

    if location:
        requested_fields += 1

        if (
            job.location
            and location.strip().lower()
            in job.location.lower()
        ):
            matched_fields += 1

    if experience_level:
        requested_fields += 1

        if (
            job.experience_level
            and job.experience_level.strip().lower()
            == experience_level.strip().lower()
        ):
            matched_fields += 1

    if employment_type:
        requested_fields += 1

        if (
            job.employment_type
            and job.employment_type.strip().lower()
            == employment_type.strip().lower()
        ):
            matched_fields += 1

    if requested_fields == 0:
        return 0.0

    return round(
        matched_fields / requested_fields,
        4,
    )