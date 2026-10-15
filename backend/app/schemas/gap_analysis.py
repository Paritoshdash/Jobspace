from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, field_validator


class RequirementStatus(str, Enum):
    SUPPORTED = "supported"
    PARTIALLY_SUPPORTED = "partially_supported"
    NOT_EVIDENCED = "not_evidenced"
    CONFIRMED_GAP = "confirmed_gap"
    NOT_ASSESSABLE = "not_assessable"


class RequirementCategory(str, Enum):
    SKILLS = "skills"
    EXPERIENCE = "experience"
    QUALIFICATIONS = "qualifications"
    RESPONSIBILITIES = "responsibilities"


class GapAnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# --- Request Schemas ---

class GapAnalysisCreate(BaseModel):
    """Request schema to trigger a resume-job gap analysis."""

    resume_id: int | None = Field(
        default=None,
        description="Optional ID of a specific resume version to analyze. If omitted, the user's active/current resume will be used.",
        ge=1,
    )


# --- Structured Finding Schemas ---

class RequirementFinding(BaseModel):
    """Represents an atomic requirement, its classification, and grounded resume evidence."""

    requirement_text: str = Field(..., description="Extracted requirement from the job description")
    category: RequirementCategory = Field(..., description="Requirement category")
    is_mandatory: bool = Field(default=True, description="Whether this requirement is mandatory (vs preferred/optional)")
    status: RequirementStatus = Field(..., description="Grounded classification status")
    resume_evidence: str | None = Field(default=None, description="Verbatim or grounded quote extracted from resume")
    is_quote_verified: bool = Field(default=False, description="True if resume_evidence was verified against the stored resume text")
    explanation: str = Field(..., description="Grounded explanation of why requirement is met, partially met, or missing")
    recommended_action: str | None = Field(default=None, description="Actionable recommendation to address this gap or highlight experience")


class CategoryBreakdown(BaseModel):
    """Represents scoring and requirement metrics for a single category."""

    score: float | None = Field(default=None, ge=0.0, le=100.0, description="Category compatibility score (0-100)")
    weight: float = Field(..., ge=0.0, le=1.0, description="Weight of category in overall scoring (e.g. 0.40 for 40%)")
    total_requirements: int = Field(default=0, ge=0, description="Total requirements evaluated in category")
    met_requirements: int = Field(default=0, ge=0, description="Number of supported or partially supported requirements in category")
    unmet_requirements: int = Field(default=0, ge=0, description="Number of confirmed gap or not evidenced requirements")
    assessable_requirements: int = Field(default=0, ge=0, description="Number of assessable requirements (excluding not_assessable)")


class MandatoryWarning(BaseModel):
    """Explicit warning for unmet or unverified mandatory requirements."""

    requirement_text: str = Field(..., description="Mandatory requirement text")
    category: RequirementCategory = Field(..., description="Requirement category")
    status: RequirementStatus = Field(..., description="Status that triggered warning")
    warning_message: str = Field(..., description="Plain-language warning banner text")


# --- Response Schemas ---

class GapAnalysisResponse(BaseModel):
    """Complete Gap Analysis report response, supporting pending, processing, completed, and failed states."""

    id: int
    user_id: int
    job_id: int | None = None
    resume_id: int | None = None

    status: GapAnalysisStatus

    # Input Snapshot Metadata
    resume_version: int | None = None
    resume_file_name: str | None = None
    resume_content_hash: str | None = None
    job_title_snapshot: str | None = None
    job_company_snapshot: str | None = None
    job_content_hash: str | None = None

    # Engine Provenance Metadata
    analysis_version: str
    model_name: str
    scoring_weights: dict[str, float] | None = None

    # Overall Scores & Suppression
    overall_score: float | None = Field(default=None, description="Overall compatibility score (0-100), or None if score is suppressed")
    is_score_suppressed: bool = False
    suppression_reason: str | None = None
    assessable_ratio: float | None = None

    # Category Scores
    skills_score: float | None = None
    experience_score: float | None = None
    qualifications_score: float | None = None
    responsibilities_score: float | None = None

    # Structured Findings (flexible representation matching CategoryBreakdown, MandatoryWarning, RequirementFinding)
    category_breakdowns: dict[str, CategoryBreakdown] | None = None
    mandatory_warnings: list[MandatoryWarning] | None = None
    detailed_requirements: list[RequirementFinding] | None = None

    # Error Handling & Lifecycle
    error_message: str | None = None

    # Timestamps
    created_at: datetime
    updated_at: datetime

    @field_validator("is_score_suppressed", mode="before")
    @classmethod
    def default_suppressed(cls, v):
        return bool(v) if v is not None else False

    model_config = {"from_attributes": True}


class GapAnalysisSummaryItem(BaseModel):
    """Lightweight report summary for listing user's historical analyses."""

    id: int
    user_id: int
    job_id: int | None = None
    resume_id: int | None = None

    status: GapAnalysisStatus

    resume_version: int | None = None
    resume_file_name: str | None = None
    job_title_snapshot: str | None = None
    job_company_snapshot: str | None = None

    overall_score: float | None = None
    is_score_suppressed: bool = False
    warnings_count: int = 0

    created_at: datetime

    @field_validator("is_score_suppressed", mode="before")
    @classmethod
    def default_suppressed(cls, v):
        return bool(v) if v is not None else False

    model_config = {"from_attributes": True}

