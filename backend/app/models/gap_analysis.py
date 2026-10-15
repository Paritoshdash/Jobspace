from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.job import Job
    from app.models.resume import Resume
    from app.models.user import User


class GapAnalysis(Base):
    __tablename__ = "gap_analyses"
    __table_args__ = (
        Index("ix_gap_analyses_user_id_job_id", "user_id", "job_id"),
        Index("ix_gap_analyses_user_id_created_at", "user_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # Ownership and References
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    job_id: Mapped[int | None] = mapped_column(
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    resume_id: Mapped[int | None] = mapped_column(
        ForeignKey("resumes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Immutable Analysis Inputs & Snapshots
    resume_version: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )
    resume_file_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    resume_text_snapshot: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    resume_content_hash: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    job_title_snapshot: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    job_company_snapshot: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    job_description_snapshot: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    job_content_hash: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
    )

    # Analysis Metadata
    analysis_version: Mapped[str] = mapped_column(
        String(50),
        default="1.0.0",
        nullable=False,
    )
    model_name: Mapped[str] = mapped_column(
        String(100),
        default="qwen3:14b",
        nullable=False,
    )
    scoring_weights: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    # Scores and Suppression
    overall_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )
    skills_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )
    experience_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )
    qualifications_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )
    responsibilities_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    is_score_suppressed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    suppression_reason: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    assessable_ratio: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    # Structured Results
    category_breakdowns: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )
    mandatory_warnings: Mapped[list[dict] | None] = mapped_column(
        JSON,
        nullable=True,
    )
    detailed_requirements: Mapped[list[dict] | None] = mapped_column(
        JSON,
        nullable=True,
    )

    # Lifecycle and Errors
    status: Mapped[str] = mapped_column(
        String(30),
        default="pending",
        nullable=False,
    )
    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship()
    job: Mapped["Job | None"] = relationship()
    resume: Mapped["Resume | None"] = relationship()
