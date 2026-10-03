from datetime import datetime

from pydantic import BaseModel


class JobIngestionItem(BaseModel):
    title: str
    company: str
    description: str
    location: str | None = None
    employment_type: str | None = None
    experience_level: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    source: str
    source_url: str | None = None
    posted_at: datetime | None = None


class JobIngestionRequest(BaseModel):
    jobs: list[JobIngestionItem]


class JobIngestionResponse(BaseModel):
    created: int
    skipped: int