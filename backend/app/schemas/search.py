from pydantic import BaseModel


class JobSearchQuery(BaseModel):
    query: str
    location: str | None = None
    experience_level: str | None = None
    employment_type: str | None = None
    min_salary: int | None = None
    max_salary: int | None = None