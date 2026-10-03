from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.job import JobResponse


class ApplicationCreate(BaseModel):
    job_id: int
    status: str = Field(default="applied", max_length=30)


class ApplicationUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=30)


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    applied_at: datetime | None
    updated_at: datetime
    job: JobResponse

    model_config = {
        "from_attributes": True
    }
