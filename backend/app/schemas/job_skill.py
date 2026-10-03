from pydantic import BaseModel, Field


class JobSkillCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    skill_type: str = Field(min_length=1, max_length=20)


class JobSkillsCreate(BaseModel):
    skills: list[JobSkillCreate] = Field(min_length=1)


class JobSkillResponse(BaseModel):
    id: int
    name: str
    normalized_name: str
    skill_type: str