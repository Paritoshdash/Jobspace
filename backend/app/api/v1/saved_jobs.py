from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.saved_job import SavedJobResponse, SavedJobStatus
from app.services.saved_job_service import (
    get_saved_jobs,
    is_job_saved,
    save_job,
    unsave_job,
)

router = APIRouter(
    prefix="/saved-jobs",
    tags=["Saved Jobs"],
)


@router.post(
    "/{job_id}",
    response_model=SavedJobResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_job_endpoint(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return save_job(
            db=db,
            user_id=current_user.id,
            job_id=job_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.delete(
    "/{job_id}",
    status_code=status.HTTP_200_OK,
)
def unsave_job_endpoint(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    success = unsave_job(
        db=db,
        user_id=current_user.id,
        job_id=job_id,
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job was not saved.",
        )
    return {"message": "Job removed from saved list."}


@router.get(
    "",
    response_model=list[SavedJobResponse],
)
def list_saved_jobs_endpoint(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_saved_jobs(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )


@router.get(
    "/{job_id}/status",
    response_model=SavedJobStatus,
)
def check_job_saved_endpoint(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    saved = is_job_saved(
        db=db,
        user_id=current_user.id,
        job_id=job_id,
    )
    return SavedJobStatus(
        job_id=job_id,
        is_saved=saved,
    )
