import logging
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.candidate import (
    CandidateEducation,
    CandidateExperience,
    CandidateProfile,
)
from app.models.skill import CandidateSkill, Skill
from app.schemas.candidate import (
    CandidateProfileUpdate,
    CandidateSkillCreate,
    EducationCreate,
    ExperienceCreate,
)

logger = logging.getLogger(__name__)


def calculate_completion_percentage(profile: CandidateProfile) -> int:
    """Calculate profile completion percentage based on filled sections."""
    score = 0
    total = 6

    # 1. Basic Info (name + headline)
    if profile.full_name and profile.headline:
        score += 1

    # 2. Summary
    if profile.summary and len(profile.summary.strip()) > 10:
        score += 1

    # 3. Location / Experience Level
    if profile.experience_level or profile.location:
        score += 1

    # 4. Career Preferences
    if profile.preferred_role or profile.preferred_location:
        score += 1

    # 5. Skills
    if profile.skills and len(profile.skills) > 0:
        score += 1

    # 6. Education or Experience
    if (profile.educations and len(profile.educations) > 0) or (profile.experiences and len(profile.experiences) > 0):
        score += 1

    return int((score / total) * 100)


def get_or_create_candidate_profile(db: Session, user_id: int) -> CandidateProfile:
    """Retrieve candidate profile for a user, or initialize an empty one."""
    stmt = select(CandidateProfile).where(CandidateProfile.user_id == user_id)
    profile = db.scalar(stmt)
    if not profile:
        profile = CandidateProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


def update_candidate_profile(
    db: Session, user_id: int, profile_data: CandidateProfileUpdate
) -> CandidateProfile:
    profile = get_or_create_candidate_profile(db, user_id)

    update_dict = profile_data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return profile


def add_candidate_skill(
    db: Session, user_id: int, skill_data: CandidateSkillCreate
) -> CandidateSkill:
    profile = get_or_create_candidate_profile(db, user_id)

    raw_name = skill_data.name.strip()
    normalized = raw_name.lower()

    # Find or create canonical Skill
    skill = db.scalar(select(Skill).where(Skill.normalized_name == normalized))
    if not skill:
        skill = Skill(name=raw_name, normalized_name=normalized)
        db.add(skill)
        db.flush()

    # Check if candidate already has this skill
    existing = db.scalar(
        select(CandidateSkill).where(
            CandidateSkill.candidate_id == profile.id,
            CandidateSkill.skill_id == skill.id,
        )
    )
    if existing:
        if skill_data.proficiency:
            existing.proficiency = skill_data.proficiency
        if skill_data.years_experience is not None:
            existing.years_experience = skill_data.years_experience
        db.commit()
        db.refresh(existing)
        return existing

    cand_skill = CandidateSkill(
        candidate_id=profile.id,
        skill_id=skill.id,
        proficiency=skill_data.proficiency,
        years_experience=skill_data.years_experience,
    )
    db.add(cand_skill)
    db.commit()
    db.refresh(cand_skill)
    return cand_skill


def remove_candidate_skill(db: Session, user_id: int, candidate_skill_id: int) -> bool:
    profile = get_or_create_candidate_profile(db, user_id)
    cand_skill = db.scalar(
        select(CandidateSkill).where(
            CandidateSkill.id == candidate_skill_id,
            CandidateSkill.candidate_id == profile.id,
        )
    )
    if not cand_skill:
        return False

    db.delete(cand_skill)
    db.commit()
    return True


def add_education(
    db: Session, user_id: int, edu_data: EducationCreate
) -> CandidateEducation:
    profile = get_or_create_candidate_profile(db, user_id)
    edu = CandidateEducation(
        candidate_id=profile.id,
        institution=edu_data.institution.strip(),
        degree=edu_data.degree.strip(),
        field_of_study=edu_data.field_of_study.strip() if edu_data.field_of_study else None,
        start_year=edu_data.start_year,
        end_year=edu_data.end_year,
        grade=edu_data.grade.strip() if edu_data.grade else None,
    )
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu


def delete_education(db: Session, user_id: int, education_id: int) -> bool:
    profile = get_or_create_candidate_profile(db, user_id)
    edu = db.scalar(
        select(CandidateEducation).where(
            CandidateEducation.id == education_id,
            CandidateEducation.candidate_id == profile.id,
        )
    )
    if not edu:
        return False

    db.delete(edu)
    db.commit()
    return True


def add_experience(
    db: Session, user_id: int, exp_data: ExperienceCreate
) -> CandidateExperience:
    profile = get_or_create_candidate_profile(db, user_id)
    exp = CandidateExperience(
        candidate_id=profile.id,
        company=exp_data.company.strip(),
        title=exp_data.title.strip(),
        location=exp_data.location.strip() if exp_data.location else None,
        start_date=exp_data.start_date.strip() if exp_data.start_date else None,
        end_date=exp_data.end_date.strip() if exp_data.end_date else None,
        is_current=exp_data.is_current,
        description=exp_data.description.strip() if exp_data.description else None,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


def delete_experience(db: Session, user_id: int, experience_id: int) -> bool:
    profile = get_or_create_candidate_profile(db, user_id)
    exp = db.scalar(
        select(CandidateExperience).where(
            CandidateExperience.id == experience_id,
            CandidateExperience.candidate_id == profile.id,
        )
    )
    if not exp:
        return False

    db.delete(exp)
    db.commit()
    return True
