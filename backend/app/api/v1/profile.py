from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.candidate import (
    CandidateProfileResponse,
    CandidateProfileUpdate,
    CandidateSkillCreate,
    CandidateSkillResponse,
    EducationCreate,
    EducationResponse,
    ExperienceCreate,
    ExperienceResponse,
)
from app.services.candidate_service import (
    add_candidate_skill,
    add_education,
    add_experience,
    calculate_completion_percentage,
    delete_education,
    delete_experience,
    get_or_create_candidate_profile,
    remove_candidate_skill,
    update_candidate_profile,
)

router = APIRouter(
    prefix="/profile",
    tags=["Candidate Profile"],
)


def _serialize_profile(profile, db: Session) -> CandidateProfileResponse:
    skills = [
        CandidateSkillResponse(
            id=cs.id,
            skill_id=cs.skill.id,
            name=cs.skill.name,
            normalized_name=cs.skill.normalized_name,
            proficiency=cs.proficiency,
            years_experience=cs.years_experience,
        )
        for cs in profile.skills
        if cs.skill is not None
    ]

    educations = [
        EducationResponse(
            id=e.id,
            candidate_id=e.candidate_id,
            institution=e.institution,
            degree=e.degree,
            field_of_study=e.field_of_study,
            start_year=e.start_year,
            end_year=e.end_year,
            grade=e.grade,
        )
        for e in profile.educations
    ]

    experiences = [
        ExperienceResponse(
            id=exp.id,
            candidate_id=exp.candidate_id,
            company=exp.company,
            title=exp.title,
            location=exp.location,
            start_date=exp.start_date,
            end_date=exp.end_date,
            is_current=exp.is_current,
            description=exp.description,
        )
        for exp in profile.experiences
    ]

    completion = calculate_completion_percentage(profile)

    return CandidateProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        full_name=profile.full_name,
        headline=profile.headline,
        summary=profile.summary,
        phone=profile.phone,
        location=profile.location,
        experience_level=profile.experience_level,
        preferred_location=profile.preferred_location,
        preferred_role=profile.preferred_role,
        preferred_employment_type=profile.preferred_employment_type,
        expected_salary_min=profile.expected_salary_min,
        completion_percentage=completion,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
        skills=skills,
        educations=educations,
        experiences=experiences,
    )


@router.get("/me", response_model=CandidateProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_or_create_candidate_profile(db, current_user.id)
    return _serialize_profile(profile, db)


@router.put("/me", response_model=CandidateProfileResponse)
def update_my_profile(
    profile_data: CandidateProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = update_candidate_profile(db, current_user.id, profile_data)
    return _serialize_profile(profile, db)


@router.post("/skills", response_model=CandidateSkillResponse, status_code=status.HTTP_201_CREATED)
def add_skill_endpoint(
    skill_data: CandidateSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cand_skill = add_candidate_skill(db, current_user.id, skill_data)
    return CandidateSkillResponse(
        id=cand_skill.id,
        skill_id=cand_skill.skill.id,
        name=cand_skill.skill.name,
        normalized_name=cand_skill.skill.normalized_name,
        proficiency=cand_skill.proficiency,
        years_experience=cand_skill.years_experience,
    )


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill_endpoint(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = remove_candidate_skill(db, current_user.id, skill_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found on profile.")
    return None


@router.post("/education", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
def add_education_endpoint(
    edu_data: EducationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    edu = add_education(db, current_user.id, edu_data)
    return EducationResponse(
        id=edu.id,
        candidate_id=edu.candidate_id,
        institution=edu.institution,
        degree=edu.degree,
        field_of_study=edu.field_of_study,
        start_year=edu.start_year,
        end_year=edu.end_year,
        grade=edu.grade,
    )


@router.delete("/education/{education_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_education_endpoint(
    education_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = delete_education(db, current_user.id, education_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education record not found.")
    return None


@router.post("/experience", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def add_experience_endpoint(
    exp_data: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exp = add_experience(db, current_user.id, exp_data)
    return ExperienceResponse(
        id=exp.id,
        candidate_id=exp.candidate_id,
        company=exp.company,
        title=exp.title,
        location=exp.location,
        start_date=exp.start_date,
        end_date=exp.end_date,
        is_current=exp.is_current,
        description=exp.description,
    )


@router.delete("/experience/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience_endpoint(
    experience_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deleted = delete_experience(db, current_user.id, experience_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experience record not found.")
    return None
