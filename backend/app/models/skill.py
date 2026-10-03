from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.candidate import CandidateProfile
    from app.models.job import Job

class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    normalized_name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    candidate_skills: Mapped[list["CandidateSkill"]] = relationship(
        back_populates="skill",
        cascade="all, delete-orphan",
    )

    job_skills: Mapped[list["JobSkill"]] = relationship(
        back_populates="skill",
        cascade="all, delete-orphan",
    )


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id: Mapped[int] = mapped_column(primary_key=True)

    candidate_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )

    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
    )

    proficiency: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    years_experience: Mapped[float | None] = mapped_column(
        nullable=True,
    )

    candidate: Mapped["CandidateProfile"] = relationship(
        back_populates="skills",
    )

    skill: Mapped["Skill"] = relationship(
        back_populates="candidate_skills",
    )


class JobSkill(Base):
    __tablename__ = "job_skills"
    __table_args__ = (
        UniqueConstraint("job_id", "skill_id", name="uq_job_skills_job_skill"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
    )

    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
    )

    skill_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    job: Mapped["Job"] = relationship(
        back_populates="skills",
    )

    skill: Mapped["Skill"] = relationship(
        back_populates="job_skills",
    )