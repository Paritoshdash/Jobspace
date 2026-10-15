from datetime import datetime, timezone
import pytest
from sqlalchemy.orm import Session

from app.models.gap_analysis import GapAnalysis
from app.models.user import User
from app.schemas.gap_analysis import (
    GapAnalysisCreate,
    GapAnalysisResponse,
    GapAnalysisStatus,
    GapAnalysisSummaryItem,
    RequirementCategory,
    RequirementStatus,
)


def test_gap_analysis_schema_validation():
    # 1. Test GapAnalysisCreate request schema
    req_default = GapAnalysisCreate()
    assert req_default.resume_id is None

    req_specific = GapAnalysisCreate(resume_id=3)
    assert req_specific.resume_id == 3

    with pytest.raises(Exception):
        GapAnalysisCreate(resume_id=-1)

    # 2. Test GapAnalysisResponse pending state (all score fields None)
    now = datetime.now(timezone.utc)
    ga = GapAnalysis(
        id=1,
        user_id=10,
        job_id=20,
        resume_id=30,
        status="pending",
        analysis_version="1.0.0",
        model_name="qwen3:14b",
        created_at=now,
        updated_at=now,
    )
    resp = GapAnalysisResponse.model_validate(ga)
    assert resp.status == GapAnalysisStatus.PENDING
    assert resp.overall_score is None
    assert resp.is_score_suppressed is False
    assert resp.category_breakdowns is None
    assert resp.mandatory_warnings is None
    assert resp.detailed_requirements is None

    # 3. Test GapAnalysisSummaryItem serialization
    summary = GapAnalysisSummaryItem.model_validate(ga)
    assert summary.id == 1
    assert summary.status == GapAnalysisStatus.PENDING
    assert summary.overall_score is None


def test_gap_analysis_db_persistence_and_snapshots(db_session: Session, test_user: User):
    """Verify persisting a GapAnalysis record in the real database."""
    analysis = GapAnalysis(
        user_id=test_user.id,
        job_id=None,
        resume_id=None,
        resume_version=1,
        resume_file_name="test_cv.pdf",
        resume_text_snapshot="Experienced Python developer with PostgreSQL skills",
        resume_content_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        job_title_snapshot="Senior Backend Engineer",
        job_company_snapshot="Tech Innovations",
        job_description_snapshot="Must have strong Python and PostgreSQL skills",
        job_content_hash="ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
        analysis_version="1.0.0",
        model_name="qwen3:14b",
        scoring_weights={"skills": 0.40, "experience": 0.25, "qualifications": 0.15, "responsibilities": 0.20},
        overall_score=88.5,
        skills_score=90.0,
        experience_score=85.0,
        qualifications_score=90.0,
        responsibilities_score=85.0,
        is_score_suppressed=False,
        suppression_reason=None,
        assessable_ratio=1.0,
        category_breakdowns={
            "skills": {
                "score": 90.0,
                "weight": 0.40,
                "total_requirements": 3,
                "met_requirements": 3,
                "unmet_requirements": 0,
                "assessable_requirements": 3,
            }
        },
        mandatory_warnings=[],
        detailed_requirements=[
            {
                "requirement_text": "Python 3 and PostgreSQL",
                "category": "skills",
                "is_mandatory": True,
                "status": "supported",
                "resume_evidence": "Experienced Python developer with PostgreSQL skills",
                "is_quote_verified": True,
                "explanation": "Verbatim match in resume text",
                "recommended_action": None,
            }
        ],
        status="completed",
    )
    db_session.add(analysis)
    db_session.commit()
    db_session.refresh(analysis)

    assert analysis.id is not None
    assert analysis.user_id == test_user.id
    assert analysis.status == "completed"
    assert analysis.overall_score == 88.5
    assert analysis.resume_content_hash == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

    # Test Pydantic serialization from the database row
    response_dto = GapAnalysisResponse.model_validate(analysis)
    assert response_dto.id == analysis.id
    assert response_dto.status == GapAnalysisStatus.COMPLETED
    assert response_dto.overall_score == 88.5
    assert len(response_dto.detailed_requirements) == 1
    assert response_dto.detailed_requirements[0].status == RequirementStatus.SUPPORTED
    assert response_dto.detailed_requirements[0].category == RequirementCategory.SKILLS

    # Clean up test row
    db_session.delete(analysis)
    db_session.commit()
