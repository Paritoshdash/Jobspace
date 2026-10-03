from pydantic import BaseModel, Field


class JobAnalysis(BaseModel):

    summary: str

    experience_level: str | None = None

    responsibilities: list[str] = Field(
        default_factory=list
    )

    required_skills: list[str] = Field(
        default_factory=list
    )

    preferred_skills: list[str] = Field(
        default_factory=list
    )