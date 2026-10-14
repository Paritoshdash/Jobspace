import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.services.ai.job_search_service import semantic_job_search
from app.services.ai.query_parser import parse_search_query
from app.services.ai.relevance_gate import (
    classify_query_intent,
    evaluate_job_relevance_gate,
)


def test_intent_classification():
    # Non-tech queries
    intent_plumber = classify_query_intent("plumber")
    assert intent_plumber.domain == "NON_TECH"
    assert intent_plumber.matched_role_term == "plumber"

    intent_broker = classify_query_intent("real estate broker")
    assert intent_broker.domain == "NON_TECH"

    intent_nurse = classify_query_intent("Registered nurse in Mumbai")
    assert intent_nurse.domain == "NON_TECH"

    # Tech queries
    intent_python = classify_query_intent("Python developer in Bangalore")
    assert intent_python.domain == "TECH"

    intent_ai = classify_query_intent("AI Engineer in Hyderabad")
    assert intent_ai.domain == "TECH"


def test_relevance_gate_rejects_cross_domain():
    # Plumber should reject software job
    intent = classify_query_intent("plumber")
    is_rel, reason = evaluate_job_relevance_gate(
        query_intent=intent,
        query_text="plumber",
        job_title="AI Backend Engineer",
        job_description="Building scalable backend AI pipelines in Python and FastAPI",
        job_skills=["Python", "FastAPI"],
        semantic_score=0.45,
    )
    assert is_rel is False

    # AI Engineer should reject sales role
    ai_intent = classify_query_intent("AI Engineer")
    is_rel2, reason2 = evaluate_job_relevance_gate(
        query_intent=ai_intent,
        query_text="AI Engineer",
        job_title="Account Executive, AI Sales",
        job_description="Selling AI software solutions to enterprise clients",
        job_skills=[],
        semantic_score=0.55,
    )
    assert is_rel2 is False


def test_zero_results_for_unrelated_search(db_session: Session):
    # Searching for plumber must return 0 results
    results = semantic_job_search(db_session, "plumber")
    assert len(results) == 0

    # Searching for real estate broker must return 0 results
    results_broker = semantic_job_search(db_session, "real estate broker")
    assert len(results_broker) == 0


def test_positive_match_for_tech_search(db_session: Session):
    results = semantic_job_search(db_session, "Python developer", limit=5)
    assert len(results) > 0
    # Every result should be software/tech
    for job, score, reasons in results:
        assert score >= 0.38
        assert any(term in job.title.lower() for term in ["python", "backend", "engineer", "developer"])


def test_indian_localization_parsing():
    # 1. 8 LPA and Bangalore
    q1 = parse_search_query("Java developer in Bangalore above 8 LPA")
    assert q1.location.lower() == "bangalore"
    assert q1.min_salary == 800000

    # 2. Fresher and Hyderabad
    q2 = parse_search_query("Data Scientist fresher in Hyderabad")
    assert q2.location.lower() == "hyderabad"
    assert q2.experience_level == "junior"

    # 3. Monthly salary: ₹50,000/month -> 6 LPA
    q3 = parse_search_query("Python developer paying 50000/month")
    assert q3.min_salary == 600000
