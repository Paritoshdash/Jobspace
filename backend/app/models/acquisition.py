from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AcquisitionRun(Base):
    __tablename__ = "acquisition_runs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    source_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    sources_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    total_created: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    total_updated: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    total_skipped: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    duration_seconds: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    summary_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
