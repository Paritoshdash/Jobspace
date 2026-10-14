import io
import json
import logging
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import BinaryIO

from pypdf import PdfReader
from docx import Document
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.candidate import CandidateProfile
from app.models.resume import Resume
from app.services.ai.skill_dictionary import KNOWN_SKILLS
from app.services.candidate_service import (
    add_candidate_skill,
    get_or_create_candidate_profile,
)
from app.schemas.candidate import CandidateSkillCreate

logger = logging.getLogger(__name__)

# Base storage directory for resumes (protected from direct public web access)
STORAGE_DIR = Path(__file__).resolve().parent.parent.parent / "storage" / "resumes"


def extract_text_from_pdf(stream: BinaryIO) -> str:
    """Extract clean text content from PDF file stream."""
    try:
        reader = PdfReader(stream)
        text_parts = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
        return "\n\n".join(text_parts).strip()
    except Exception as exc:
        logger.error(f"Failed to extract text from PDF: {exc}")
        raise ValueError(f"Could not read PDF resume: {exc}") from exc


def extract_text_from_docx(stream: BinaryIO) -> str:
    """Extract clean text content from DOCX file stream."""
    try:
        doc = Document(stream)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs).strip()
    except Exception as exc:
        logger.error(f"Failed to extract text from DOCX: {exc}")
        raise ValueError(f"Could not read DOCX resume: {exc}") from exc


def extract_structured_resume_data(text: str) -> dict:
    """
    Parse unstructured resume text into structured fields:
    - skills
    - contact info (email, phone, name)
    - education summary
    - experience keywords
    - executive summary
    """
    extracted = {
        "full_name": None,
        "email": None,
        "phone": None,
        "skills": [],
        "education": [],
        "experience": [],
        "summary": None,
    }

    if not text:
        return extracted

    # 1. Contact info extraction
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    if email_match:
        extracted["email"] = email_match.group(0)

    phone_match = re.search(
        r"(?:\+91[- ]?)?[6-9]\d{9}|\b\d{3}[-.\s]??\d{3}[-.\s]??\d{4}\b",
        text,
    )
    if phone_match:
        extracted["phone"] = phone_match.group(0)

    # Simple name extraction heuristic: First non-empty line with 2-4 capitalized words
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    for line in lines[:5]:
        words = line.split()
        if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w.isalpha()):
            if not any(token in line.lower() for token in ["resume", "curriculum", "page", "email", "phone"]):
                extracted["full_name"] = line
                break

    # 2. Skill Extraction from dictionary
    normalized_text = text.lower()
    found_skills = set()
    for norm_name, display_name in KNOWN_SKILLS.items():
        pattern = r"\b" + re.escape(norm_name) + r"\b"
        if re.search(pattern, normalized_text):
            found_skills.add(display_name)

    extracted["skills"] = sorted(list(found_skills))

    # 3. Education keywords
    edu_patterns = [
        r"\b(?:b\.?tech|m\.?tech|b\.?e\.?|b\.?sc|m\.?sc|bca|mca|mba|bachelor|master|phd)\b[^\n,.]*",
        r"\b(?:computer science|information technology|electronics|mechanical|civil)\b",
    ]
    for pattern in edu_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for m in matches:
            clean_m = m.strip()
            if clean_m and clean_m not in extracted["education"]:
                extracted["education"].append(clean_m)

    # 4. Experience summary (lines under 'experience', 'work history', 'employment')
    exp_sections = re.findall(
        r"(?:experience|work history|employment history|projects)[\s:]*\n([\s\S]{50,400}?)(?:\n\n|\n[A-Z]{3,})",
        text,
        re.IGNORECASE,
    )
    if exp_sections:
        extracted["experience"] = [s.strip() for s in exp_sections[:3]]

    # 5. Summary / Objective
    summary_match = re.search(
        r"(?:summary|profile|about me|objective)[\s:]*\n([\s\S]{40,300}?)(?:\n\n|\n[A-Z]{3,})",
        text,
        re.IGNORECASE,
    )
    if summary_match:
        extracted["summary"] = summary_match.group(1).strip()
    elif lines:
        # Fallback to initial descriptive paragraph
        for p in lines[1:6]:
            if len(p) > 60:
                extracted["summary"] = p
                break

    return extracted


def save_and_parse_resume(
    db: Session,
    user_id: int,
    filename: str,
    file_bytes: bytes,
    content_type: str,
    sync_to_profile: bool = True,
) -> Resume:
    """
    Handle resume upload, file storage, versioning, text extraction,
    and automatic candidate profile synchronization.
    """
    ext = Path(filename).suffix.lower()
    if ext not in [".pdf", ".docx"]:
        raise ValueError("Only PDF (.pdf) and Microsoft Word (.docx) files are supported.")

    # 1. Extract text content
    stream = io.BytesIO(file_bytes)
    if ext == ".pdf":
        raw_text = extract_text_from_pdf(stream)
    else:
        raw_text = extract_text_from_docx(stream)

    extracted_data = extract_structured_resume_data(raw_text)

    # 2. Versioning logic
    # Find current version number
    existing_resumes = db.scalars(
        select(Resume).where(Resume.user_id == user_id).order_by(Resume.version.desc())
    ).all()

    next_version = (existing_resumes[0].version + 1) if existing_resumes else 1

    # Demote previous resumes
    db.execute(
        update(Resume)
        .where(Resume.user_id == user_id)
        .values(is_current=False)
    )

    # 3. Store file securely
    user_storage = STORAGE_DIR / str(user_id)
    user_storage.mkdir(parents=True, exist_ok=True)
    safe_filename = f"v{next_version}_{re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)}"
    save_path = user_storage / safe_filename
    save_path.write_bytes(file_bytes)

    # 4. Associate with candidate profile
    profile = get_or_create_candidate_profile(db, user_id)

    resume = Resume(
        user_id=user_id,
        candidate_id=profile.id,
        version=next_version,
        is_current=True,
        file_name=filename,
        file_path=str(save_path),
        file_size=len(file_bytes),
        content_type=content_type,
        parsed_text=raw_text,
        extracted_data=json.dumps(extracted_data),
    )
    db.add(resume)
    db.flush()

    # 5. Sync to Candidate Profile if requested
    if sync_to_profile:
        if extracted_data.get("full_name") and not profile.full_name:
            profile.full_name = extracted_data["full_name"]
        if extracted_data.get("phone") and not profile.phone:
            profile.phone = extracted_data["phone"]
        if extracted_data.get("summary") and not profile.summary:
            profile.summary = extracted_data["summary"]

        # Sync extracted skills
        existing_skills = {
            cs.skill.normalized_name
            for cs in profile.skills
            if cs.skill
        }
        for skill_name in extracted_data.get("skills", []):
            if skill_name.lower() not in existing_skills:
                add_candidate_skill(
                    db=db,
                    user_id=user_id,
                    skill_data=CandidateSkillCreate(name=skill_name, proficiency="Intermediate"),
                )

    db.commit()
    db.refresh(resume)
    return resume


def get_user_resumes(db: Session, user_id: int) -> list[Resume]:
    """Retrieve all resumes for a user ordered by version descending."""
    stmt = select(Resume).where(Resume.user_id == user_id).order_by(Resume.version.desc())
    return list(db.scalars(stmt).all())


def get_current_resume(db: Session, user_id: int) -> Resume | None:
    """Retrieve user's active/current resume."""
    stmt = select(Resume).where(Resume.user_id == user_id, Resume.is_current.is_(True))
    return db.scalar(stmt)
