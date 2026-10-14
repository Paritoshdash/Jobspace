import html
import re
from datetime import datetime
import requests

from app.schemas.ingestion import JobIngestionItem
from app.services.sources.base import JobSource


class AshbyAdapter(JobSource):
    """
    Fetch jobs from a public Ashby job board API.
    Endpoint: https://api.ashbyhq.com/posting-api/job-board/{company_token}
    """

    BASE_URL = "https://api.ashbyhq.com/posting-api/job-board"

    def __init__(self, company_token: str, company_name: str):
        if not company_token.strip():
            raise ValueError("Ashby company token cannot be empty.")
        if not company_name.strip():
            raise ValueError("Company name cannot be empty.")

        self.company_token = company_token.strip()
        self.company_name = company_name.strip()

    def fetch_jobs(self) -> list[JobIngestionItem]:
        url = f"{self.BASE_URL}/{self.company_token}"
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()
        except Exception as exc:
            # Fallback / graceful error logging
            raise RuntimeError(f"Failed to fetch Ashby jobs for {self.company_name}: {exc}") from exc

        jobs = []
        for item in data.get("jobs", []):
            normalized = self._normalize_job(item)
            if normalized is not None:
                jobs.append(normalized)

        return jobs

    def _normalize_job(self, job: dict) -> JobIngestionItem | None:
        title = self._clean_text(job.get("title"))

        # Ashby can supply descriptionPlain or descriptionHtml
        raw_desc = job.get("descriptionPlain") or job.get("descriptionHtml") or ""
        description = self._clean_html(raw_desc) if "<" in raw_desc else self._clean_text(raw_desc)

        if not title or not description:
            return None

        # Location
        location = self._clean_text(job.get("location") or job.get("address", {}).get("addressLocality"))
        if not location and job.get("isRemote"):
            location = "Remote"

        source_url = self._clean_text(job.get("jobUrl") or job.get("applyUrl"))
        posted_at = self._parse_datetime(job.get("publishedAt") or job.get("createdAt"))

        employment_type = self._clean_text(job.get("employmentType"))

        return JobIngestionItem(
            title=title,
            company=self.company_name,
            description=description,
            location=location or None,
            employment_type=employment_type or None,
            experience_level=None,
            salary_min=None,
            salary_max=None,
            source="ashby",
            source_url=source_url or None,
            posted_at=posted_at,
        )

    @staticmethod
    def _clean_html(value: str | None) -> str:
        if not value:
            return ""

        text = html.unescape(value)
        text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
        text = re.sub(r"</p\s*>", "\n", text, flags=re.IGNORECASE)
        text = re.sub(r"<[^>]+>", " ", text)
        text = html.unescape(text)
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n\s*\n+", "\n\n", text)
        return text.strip()

    @staticmethod
    def _clean_text(value: str | None) -> str:
        if not value:
            return ""
        return " ".join(str(value).split())

    @staticmethod
    def _parse_datetime(value: str | None) -> datetime | None:
        if not value:
            return None
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return None
