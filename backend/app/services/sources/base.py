from abc import ABC, abstractmethod

from app.schemas.ingestion import JobIngestionItem


class JobSource(ABC):
    """Base interface for external job sources."""

    @abstractmethod
    def fetch_jobs(self) -> list[JobIngestionItem]:
        """Fetch and normalize jobs from the source."""
        raise NotImplementedError