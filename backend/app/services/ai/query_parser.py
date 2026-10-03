import re

from app.schemas.search import JobSearchQuery


EXPERIENCE_LEVELS = {
    "intern": "intern",
    "internship": "intern",
    "junior": "junior",
    "entry level": "junior",
    "entry-level": "junior",
    "mid": "mid",
    "mid-level": "mid",
    "senior": "senior",
    "senior-level": "senior",
}

EMPLOYMENT_TYPES = {
    "full time": "Full-time",
    "full-time": "Full-time",
    "full--time": "Full-time",
    "part time": "Part-time",
    "part-time": "Part-time",
    "contract": "Contract",
    "internship": "Internship",
}


def _extract_experience_level(text: str) -> str | None:
    normalized = text.lower()

    for pattern, value in EXPERIENCE_LEVELS.items():
        if pattern in normalized:
            return value

    return None


def _extract_employment_type(text: str) -> str | None:
    normalized = text.lower()

    for pattern, value in EMPLOYMENT_TYPES.items():
        if pattern in normalized:
            return value

    return None


def _extract_salary(text: str) -> tuple[int | None, int | None]:
    normalized = text.lower()

# between X and Y LPA
    match = re.search(
        r"between\s+(\d+(?:\.\d+)?)\s*"
        r"(?:lpa|lakhs?)?\s+and\s+"
        r"(\d+(?:\.\d+)?)\s*"
        r"(?:lpa|lakhs?)",
        normalized,
    )

    if match:
        minimum = int(float(match.group(1)) * 100000)
        maximum = int(float(match.group(2)) * 100000)

        return minimum, maximum

    # at least / minimum / above / more than / over X LPA
    match = re.search(
        r"(?:at least|minimum|above|more than|over)"
        r"\s+(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?)",
        normalized,
    )

    if match:
        minimum = int(float(match.group(1)) * 100000)

        return minimum, None

    # up to / maximum / below / less than / under X LPA
    match = re.search(
        r"(?:up to|maximum|below|less than|under)"
        r"\s+(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?)",
        normalized,
    )

    if match:
        maximum = int(float(match.group(1)) * 100000)

        return None, maximum

    return None, None


def _extract_location(text: str) -> str | None:
    normalized = text.strip()

    match = re.search(
        r"\bin\s+([A-Za-z][A-Za-z\s-]*?)(?=\s+"
        r"(?:paying|above|below|between|with|"
        r"at least|full[- ]?time|part[- ]?time|"
        r"contract|internship)\b|[,.!?]|$)",
        normalized,
        re.IGNORECASE,
    )

    if not match:
        return None

    location = match.group(1).strip()

    if location.lower() in {
        "python",
        "machine learning",
        "ai",
        "backend",
        "data science",
        "data engineering",
    }:
        return None

    return location


def parse_search_query(user_query: str) -> JobSearchQuery:
    if not user_query.strip():
        raise ValueError("Search query cannot be empty.")

    experience_level = _extract_experience_level(user_query)

    employment_type = _extract_employment_type(user_query)

    min_salary, max_salary = _extract_salary(user_query)

    location = _extract_location(user_query)

    return JobSearchQuery(
        query=user_query.strip(),
        location=location,
        experience_level=experience_level,
        employment_type=employment_type,
        min_salary=min_salary,
        max_salary=max_salary,
    )