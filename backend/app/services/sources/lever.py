import html
import logging
import re
from datetime import datetime, timezone
import requests

from app.schemas.ingestion import JobIngestionItem
from app.services.sources.base import JobSource

logger = logging.getLogger(__name__)


class LeverAdapter(JobSource):
    """
    Fetch jobs from a public Lever job board.
    Conforms to the JobSource interface and normalizes each job into JobIngestionItem.
    """

    BASE_URL = "https://api.lever.co/v0/postings"

    def __init__(
        self,
        site_token: str,
        company_name: str,
    ):
        if not site_token.strip():
            raise ValueError("Lever site token cannot be empty.")
        if not company_name.strip():
            raise ValueError("Company name cannot be empty.")

        self.site_token = site_token.strip()
        self.company_name = company_name.strip()

    def fetch_jobs(self) -> list[JobIngestionItem]:
        url = f"{self.BASE_URL}/{self.site_token}"
        params = {"mode": "json"}

        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as exc:
            logger.error(f"Failed to fetch Lever jobs for {self.company_name} ({self.site_token}): {exc}")
            raise

        if not isinstance(data, list):
            logger.warning(f"Unexpected response format from Lever for {self.site_token}: {type(data)}")
            return []

        jobs: list[JobIngestionItem] = []
        for raw_job in data:
            try:
                normalized = self._normalize_job(raw_job)
                if normalized is not None:
                    jobs.append(normalized)
            except Exception as exc:
                logger.debug(f"Skipping malformed Lever posting for {self.company_name}: {exc}")

        return jobs

    def _normalize_job(self, job: dict) -> JobIngestionItem | None:
        title = self._clean_text(job.get("text"))
        if not title:
            return None

        # Build full description from plain text or HTML
        description_parts = []
        if job.get("descriptionPlain"):
            description_parts.append(job.get("descriptionPlain"))
        elif job.get("description"):
            description_parts.append(self._clean_html(job.get("description")))

        # Append additional sections if present (lists, requirements, additionalPlain)
        if job.get("additionalPlain"):
            description_parts.append(job.get("additionalPlain"))
        elif job.get("additional"):
            description_parts.append(self._clean_html(job.get("additional")))

        # Check for list items (e.g. Responsibilities, Qualifications)
        for section in job.get("lists", []):
            section_text = section.get("text", "")
            section_content = section.get("content", "")
            if section_text:
                description_parts.append(f"\n{section_text}:")
            if section_content:
                description_parts.append(self._clean_html(section_content))

        full_description = "\n\n".join(part.strip() for part in description_parts if part.strip())
        if not full_description:
            return None

        categories = job.get("categories") or {}
        location = self._clean_text(categories.get("location"))

        # Workplace type fallback (e.g. remote)
        workplace_type = job.get("workplaceType")
        if workplace_type and workplace_type.lower() == "remote":
            location = f"{location} (Remote)".strip() if location else "Remote"

        employment_type = self._clean_text(categories.get("commitment"))

        source_url = self._clean_text(job.get("hostedUrl") or job.get("applyUrl"))

        posted_at = self._parse_created_at(job.get("createdAt"))

        salary_min, salary_max = self._extract_salary(job.get("salaryRange"))

        return JobIngestionItem(
            title=title,
            company=self.company_name,
            description=full_description,
            location=location,
            employment_type=employment_type,
            experience_level=None,
            salary_min=salary_min,
            salary_max=salary_max,
            source="lever",
            source_url=source_url,
            posted_at=posted_at,
        )

    @staticmethod
    def _extract_salary(salary_range: dict | None) -> tuple[int | None, int | None]:
        if not salary_range or not isinstance(salary_range, dict):
            return None, None

        min_val = salary_range.get("min")
        max_val = salary_range.get("max")
        currency = salary_range.get("currency", "USD")
        interval = salary_range.get("interval", "per-year-salary")

        # Normalize annual salaries
        def _to_annual(val):
            if val is None or not isinstance(val, (int, float)):
                return None
            val = int(val)
            if interval == "per-hour-salary":
                return val * 2080
            if interval == "per-month-salary":
                return val * 12
            return val

        return _to_annual(min_val), _to_annual(max_val)

    @staticmethod
    def _parse_created_at(created_at: int | float | None) -> datetime | None:
        if not created_at:
            return None
        try:
            # Lever returns timestamps in milliseconds
            return datetime.fromtimestamp(created_at / 1000.0, tz=timezone.utc)
        except (ValueError, TypeError, OverflowError):
            return None

    @staticmethod
    def _clean_html(value: str | None) -> str:
        if not value:
            return ""

        text = html.unescape(value)
        text = html.unescape(text)

        text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
        text = re.sub(r"</p\s*>", "\n", text, flags=re.IGNORECASE)
        text = re.sub(r"<li\s*>", "\n• ", text, flags=re.IGNORECASE)
        text = re.sub(r"<[^>]+>", " ", text)
        text = html.unescape(text)
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n\s*\n+", "\n\n", text)

        return text.strip()

    @staticmethod
    def _clean_text(value: str | None) -> str | None:
        if not value:
            return None
        cleaned = " ".join(str(value).split())
        return cleaned if cleaned else None
