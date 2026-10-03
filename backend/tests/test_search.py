from fastapi.testclient import TestClient

from app.services.ai.query_parser import parse_search_query
from app.services.ranking_service import (
    calculate_final_score,
    calculate_skill_match_score,
)


def test_query_parser():
    # 1. Experience level extraction
    q1 = parse_search_query("Senior Python developer in San Francisco")
    assert q1.experience_level == "senior"
    assert q1.location == "San Francisco"

    # 2. Employment type & salary
    q2 = parse_search_query("Full-time React developer in New York paying between 10 and 20 LPA")
    assert q2.employment_type == "Full-time"
    assert q2.min_salary == 1000000
    assert q2.max_salary == 2000000
    assert q2.location == "New York"

    # 3. Minimum salary single bound
    q3 = parse_search_query("Golang engineer above 25 LPA")
    assert q3.min_salary == 2500000
    assert q3.max_salary is None


def test_ranking_calculations():
    # Skill match score
    score = calculate_skill_match_score(
        requested_skills=["python", "fastapi", "docker"],
        job_skills=["python", "fastapi", "kubernetes"],
    )
    assert 0.66 <= score <= 0.67

    # Final score clamping and combination
    final = calculate_final_score(
        semantic_score=0.85,
        skill_match_score=0.75,
        metadata_match_score=1.0,
    )
    expected = 0.60 * 0.85 + 0.25 * 0.75 + 0.15 * 1.0
    assert abs(final - round(expected, 4)) < 0.001


def test_search_endpoint(client: TestClient):
    res = client.get("/api/v1/jobs/search?q=Python+developer&limit=5")
    assert res.status_code == 200
    results = res.json()
    assert isinstance(results, list)
    if results:
        first = results[0]
        assert "job" in first
        assert "relevance_score" in first
        assert 0.0 <= first["relevance_score"] <= 1.0
        # Check sort order
        scores = [item["relevance_score"] for item in results]
        assert scores == sorted(scores, reverse=True)
