from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.candidate import CandidateRecommendationsResponse
from app.services.matching_service import get_candidate_recommendations

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


@router.get("", response_model=CandidateRecommendationsResponse)
def get_jobs_for_me(
    limit: int = Query(default=20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    'Find Jobs For Me': Personalized candidate job intelligence.
    Matches candidate profile, skills, experience, and resume against real active jobs.
    """
    recommendations = get_candidate_recommendations(
        db=db,
        user_id=current_user.id,
        limit=limit,
    )

    return CandidateRecommendationsResponse(
        total_matches=len(recommendations),
        recommendations=recommendations,
    )
