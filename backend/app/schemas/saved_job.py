from datetime import datetime
from pydantic import BaseModel

from app.schemas.job import JobResponse


class SavedJobResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    created_at: datetime
    job: JobResponse

    model_config = {
        "from_attributes": True
    }


class SavedJobStatus(BaseModel):
    job_id: int
    is_saved: bool
