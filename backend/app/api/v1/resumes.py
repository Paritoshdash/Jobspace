import json
import os
from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.resume import Resume
from app.models.user import User
from app.schemas.candidate import ResumeResponse
from app.services.resume_service import (
    get_current_resume,
    get_user_resumes,
    save_and_parse_resume,
)

router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


def _serialize_resume(resume: Resume) -> ResumeResponse:
    skills = []
    summary = None
    if resume.extracted_data:
        try:
            data = json.loads(resume.extracted_data)
            skills = data.get("skills", [])
            summary = data.get("summary")
        except Exception:
            pass

    return ResumeResponse(
        id=resume.id,
        user_id=resume.user_id,
        version=resume.version,
        is_current=resume.is_current,
        file_name=resume.file_name,
        file_size=resume.file_size,
        content_type=resume.content_type,
        has_parsed_text=bool(resume.parsed_text),
        extracted_summary=summary,
        extracted_skills=skills,
        created_at=resume.created_at,
        updated_at=resume.updated_at,
    )


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    sync_to_profile: bool = Query(default=True, description="Sync extracted skills and details into profile"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload and parse candidate resume (PDF or DOCX).
    Automatically versions the resume and extracts skills, education, and experience.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file uploaded.")

    ext = Path(file.filename).suffix.lower()
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).",
        )

    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowable limit of 10MB.",
        )

    try:
        resume = save_and_parse_resume(
            db=db,
            user_id=current_user.id,
            filename=file.filename,
            file_bytes=file_bytes,
            content_type=file.content_type or "application/octet-stream",
            sync_to_profile=sync_to_profile,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process and parse resume: {exc}",
        )

    return _serialize_resume(resume)


@router.get("", response_model=list[ResumeResponse])
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all resume versions uploaded by the authenticated user."""
    resumes = get_user_resumes(db, current_user.id)
    return [_serialize_resume(r) for r in resumes]


@router.get("/current", response_model=ResumeResponse)
def get_active_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get candidate's active/current resume."""
    resume = get_current_resume(db, current_user.id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active resume found.")
    return _serialize_resume(resume)


@router.get("/{resume_id}/download")
def download_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Securely download candidate's resume file without exposing internal filesystem paths."""
    resume = db.scalar(
        select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id)
    )
    if not resume or not os.path.exists(resume.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume file not found.")

    return FileResponse(
        path=resume.file_path,
        filename=resume.file_name,
        media_type=resume.content_type,
    )
