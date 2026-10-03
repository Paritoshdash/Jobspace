import html
import re

import requests

from app.schemas.ingestion import JobIngestionItem
from app.services.sources.base import JobSource


class GreenhouseAdapter(JobSource):
    """
    Fetch jobs from a public Greenhouse job board.
    """

    BASE_URL = "https://boards-api.greenhouse.io/v1/boards"

    def __init__(
        self,
        board_token: str,
        company_name: str,
    ):
        if not board_token.strip():
            raise ValueError(
                "Greenhouse board token cannot be empty."
            )

        if not company_name.strip():
            raise ValueError(
                "Company name cannot be empty."
            )

        self.board_token = board_token.strip()
        self.company_name = company_name.strip()

    def fetch_jobs(self) -> list[JobIngestionItem]:
        url = (
            f"{self.BASE_URL}/"
            f"{self.board_token}/jobs"
        )

        response = requests.get(
            url,
            params={"content": "true"},
            timeout=30,
        )

        response.raise_for_status()

        data = response.json()

        jobs = []

        for job in data.get("jobs", []):
            normalized = self._normalize_job(job)

            if normalized is not None:
                jobs.append(normalized)

        return jobs

    def _normalize_job(
        self,
        job: dict,
    ) -> JobIngestionItem | None:

        title = self._clean_text(
            job.get("title")
        )

        description = self._clean_html(
            job.get("content")
        )

        if not title or not description:
            return None

        location_data = job.get("location") or {}

        location = self._clean_text(
            location_data.get("name")
        )

        source_url = self._clean_text(
            job.get("absolute_url")
        )

        posted_at = self._parse_datetime(
            job.get("first_published")
            or job.get("updated_at")
        )

        return JobIngestionItem(
            title=title,
            company=self.company_name,
            description=description,
            location=location,
            employment_type=None,
            experience_level=None,
            salary_min=None,
            salary_max=None,
            source="greenhouse",
            source_url=source_url,
            posted_at=posted_at,
        )

    

    @staticmethod
    def _clean_html(value: str | None) -> str:
        if not value:
            return ""

        text = html.unescape(value)
        text = html.unescape(text)

        text = re.sub(
            r"<br\s*/?>",
            "\n",
            text,
            flags=re.IGNORECASE,
        )

        text = re.sub(
            r"</p\s*>",
            "\n",
            text,
            flags=re.IGNORECASE,
        )

        text = re.sub(
            r"<[^>]+>",
            " ",
            text,
        )

        text = html.unescape(text)

        text = re.sub(
            r"[ \t]+",
            " ",
            text,
        )

        text = re.sub(
            r"\n\s*\n+",
            "\n\n",
            text,
        )

        return text.strip()

    @staticmethod
    def _clean_text(value: str | None) -> str:
        if not value:
            return ""

        return " ".join(
            str(value).split()
        )

    @staticmethod
    def _parse_datetime(
        value: str | None,
    ):
        if not value:
            return None

        from datetime import datetime

        try:
            return datetime.fromisoformat(
                value.replace("Z", "+00:00")
            )
        except ValueError:
            return None