from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class JobCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    company: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    location: str | None = Field(default=None, max_length=255)
    employment_type: str | None = Field(default=None, max_length=50)
    experience_level: str | None = Field(default=None, max_length=50)
    salary_min: int | None = Field(default=None, ge=0)
    salary_max: int | None = Field(default=None, ge=0)
    source: str = Field(min_length=1, max_length=100)
    source_url: str | None = None
    posted_at: datetime | None = None


class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    description: str
    summary: str | None = None
    analysis_status: str
    location: str | None = None
    employment_type: str | None = None
    experience_level: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    source: str
    source_url: str | None = None
    posted_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    is_saved: bool | None = None
    skills: list[str] = Field(default_factory=list)

    @field_validator("skills", mode="before")
    @classmethod
    def extract_skills_list(cls, value):
        if value is None:
            return []
        if isinstance(value, list):
            result = []
            for item in value:
                if isinstance(item, str):
                    result.append(item)
                elif hasattr(item, "skill") and item.skill is not None:
                    result.append(item.skill.name)
                elif hasattr(item, "name"):
                    result.append(item.name)
            return result
        return []

    model_config = {
        "from_attributes": True
    }


class JobSearchResult(BaseModel):
    job: JobResponse
    relevance_score: float


class JobFacetsResponse(BaseModel):
    locations: list[str]
    companies: list[str]
    experience_levels: list[str]
    employment_types: list[str]
    sources: list[str]
    total_jobs: int