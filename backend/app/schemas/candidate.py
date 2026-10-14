from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.job import JobResponse


# Education schemas
class EducationCreate(BaseModel):
    institution: str = Field(min_length=1, max_length=255)
    degree: str = Field(min_length=1, max_length=255)
    field_of_study: str | None = Field(default=None, max_length=255)
    start_year: int | None = Field(default=None, ge=1950, le=2100)
    end_year: int | None = Field(default=None, ge=1950, le=2100)
    grade: str | None = Field(default=None, max_length=50)


class EducationResponse(EducationCreate):
    id: int
    candidate_id: int

    model_config = {"from_attributes": True}


# Experience schemas
class ExperienceCreate(BaseModel):
    company: str = Field(min_length=1, max_length=255)
    title: str = Field(min_length=1, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    start_date: str | None = Field(default=None, max_length=50)
    end_date: str | None = Field(default=None, max_length=50)
    is_current: bool = False
    description: str | None = None


class ExperienceResponse(ExperienceCreate):
    id: int
    candidate_id: int

    model_config = {"from_attributes": True}


# Candidate Skill schemas
class CandidateSkillCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    proficiency: str | None = Field(default="Intermediate", max_length=50)
    years_experience: float | None = Field(default=None, ge=0)


class CandidateSkillResponse(BaseModel):
    id: int
    skill_id: int
    name: str
    normalized_name: str
    proficiency: str | None = None
    years_experience: float | None = None

    model_config = {"from_attributes": True}


# Profile schemas
class CandidateProfileCreate(BaseModel):
    full_name: str | None = Field(default=None, max_length=150)
    headline: str | None = Field(default=None, max_length=255)
    summary: str | None = None
    phone: str | None = Field(default=None, max_length=50)
    location: str | None = Field(default=None, max_length=150)
    experience_level: str | None = Field(default=None, max_length=50)
    preferred_location: str | None = Field(default=None, max_length=150)
    preferred_role: str | None = Field(default=None, max_length=150)
    preferred_employment_type: str | None = Field(default=None, max_length=50)
    expected_salary_min: int | None = Field(default=None, ge=0)


class CandidateProfileUpdate(CandidateProfileCreate):
    pass


class CandidateProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str | None = None
    headline: str | None = None
    summary: str | None = None
    phone: str | None = None
    location: str | None = None
    experience_level: str | None = None
    preferred_location: str | None = None
    preferred_role: str | None = None
    preferred_employment_type: str | None = None
    expected_salary_min: int | None = None
    completion_percentage: int = 0
    created_at: datetime
    updated_at: datetime

    skills: list[CandidateSkillResponse] = Field(default_factory=list)
    educations: list[EducationResponse] = Field(default_factory=list)
    experiences: list[ExperienceResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


# Resume schemas
class ResumeResponse(BaseModel):
    id: int
    user_id: int
    version: int
    is_current: bool
    file_name: str
    file_size: int
    content_type: str
    has_parsed_text: bool
    extracted_summary: str | None = None
    extracted_skills: list[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# Recommendation / Matching schemas
class RecommendationItem(BaseModel):
    job: JobResponse
    compatibility_score: float  # 0.0 to 1.0 (e.g. 0.92 = 92% match)
    match_percentage: int  # 0 to 100
    match_reasons: list[str] = Field(default_factory=list)
    skill_match_percentage: int = 0
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)


class CandidateRecommendationsResponse(BaseModel):
    total_matches: int
    recommendations: list[RecommendationItem]
