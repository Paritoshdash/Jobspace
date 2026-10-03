from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session

from app.schemas.ingestion import JobIngestionItem
from app.services.source_runner import run_sources_ingestion
from app.services.sources.base import JobSource
from app.services.sources.greenhouse import GreenhouseAdapter
from app.services.sources.lever import LeverAdapter


class MockFailingSource(JobSource):
    company_name = "FailingSourceCorp"

    def fetch_jobs(self) -> list[JobIngestionItem]:
        raise ConnectionError("External ATS API unreachable")


class MockSuccessfulSource(JobSource):
    company_name = "SuccessSourceCorp"

    def fetch_jobs(self) -> list[JobIngestionItem]:
        return [
            JobIngestionItem(
                title="Cloud Engineer",
                company="SuccessSourceCorp",
                description="Managing AWS infrastructure and Docker containers.",
                source="mock",
                source_url="https://mock.com/job/1",
            )
        ]


def test_source_isolation_runner(db_session: Session):
    """Verify that a failing source does not crash other sources."""
    sources = [MockFailingSource(), MockSuccessfulSource()]

    with patch("app.services.source_runner.ingest_from_source") as mock_ingest:
        def side_effect(db, source, limit=None):
            if isinstance(source, MockFailingSource):
                source.fetch_jobs()
            return 1, 0
        mock_ingest.side_effect = side_effect
        report = run_sources_ingestion(db=db_session, sources=sources)

    assert report["sources_processed"] == 2
    results = report["results"]

    # First source failed with error captured
    assert results[0]["source"] == "FailingSourceCorp"
    assert results[0]["status"] == "failed"
    assert "External ATS API unreachable" in results[0]["error"]

    # Second source succeeded
    assert results[1]["source"] == "SuccessSourceCorp"
    assert results[1]["status"] == "success"


def test_greenhouse_adapter_normalization():
    adapter = GreenhouseAdapter("testcompany", "Test Company")
    mock_raw = {
        "title": "Software Engineer",
        "content": "<p>We are hiring a <strong>Python</strong> engineer.<br/>Requirements: SQL</p>",
        "location": {"name": "San Francisco, CA"},
        "absolute_url": "https://boards.greenhouse.io/test/jobs/12345",
        "updated_at": "2026-09-01T12:00:00Z",
    }
    normalized = adapter._normalize_job(mock_raw)
    assert normalized is not None
    assert normalized.title == "Software Engineer"
    assert normalized.company == "Test Company"
    assert "Python" in normalized.description
    assert "<p>" not in normalized.description
    assert normalized.location == "San Francisco, CA"
    assert normalized.source == "greenhouse"


def test_lever_adapter_normalization():
    adapter = LeverAdapter("testsite", "Lever Test")
    mock_raw = {
        "text": "Fullstack Engineer",
        "descriptionPlain": "Build great apps.",
        "additionalPlain": "Must know TypeScript and React.",
        "categories": {
            "location": "New York, NY",
            "commitment": "Full-time",
        },
        "workplaceType": "remote",
        "hostedUrl": "https://jobs.lever.co/testsite/abcd-1234",
        "createdAt": 1725148800000,
        "salaryRange": {
            "min": 120000,
            "max": 160000,
            "interval": "per-year-salary",
        },
    }
    normalized = adapter._normalize_job(mock_raw)
    assert normalized is not None
    assert normalized.title == "Fullstack Engineer"
    assert normalized.company == "Lever Test"
    assert "TypeScript" in normalized.description
    assert "Remote" in normalized.location
    assert normalized.employment_type == "Full-time"
    assert normalized.salary_min == 120000
    assert normalized.salary_max == 160000
    assert normalized.source == "lever"
