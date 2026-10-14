import re

from app.schemas.search import JobSearchQuery


EXPERIENCE_LEVELS = {
    "fresher": "junior",
    "freshers": "junior",
    "fresher jobs": "junior",
    "0-2 years": "junior",
    "0-2 yrs": "junior",
    "0 to 2 years": "junior",
    "0 to 2 yrs": "junior",
    "intern": "intern",
    "internship": "intern",
    "trainee": "intern",
    "junior": "junior",
    "entry level": "junior",
    "entry-level": "junior",
    "graduate": "junior",
    "new grad": "junior",
    "mid": "mid",
    "mid-level": "mid",
    "3-5 years": "mid",
    "senior": "senior",
    "senior-level": "senior",
    "lead": "senior",
    "principal": "senior",
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

    # Search in order of pattern specificity (longer first)
    sorted_patterns = sorted(EXPERIENCE_LEVELS.keys(), key=lambda p: -len(p))
    for pattern in sorted_patterns:
        if re.search(r"\b" + re.escape(pattern) + r"\b", normalized):
            return EXPERIENCE_LEVELS[pattern]

    return None


def _extract_employment_type(text: str) -> str | None:
    normalized = text.lower()

    for pattern, value in EMPLOYMENT_TYPES.items():
        if pattern in normalized:
            return value

    return None


def _extract_salary(text: str) -> tuple[int | None, int | None]:
    normalized = text.lower().replace("₹", "").replace(",", "")

    # 1. monthly salary: e.g. 50000/month or 50000 per month
    month_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(?:/month|per\s*month|pm)\b",
        normalized,
    )
    if month_match:
        monthly = float(month_match.group(1))
        annual = int(monthly * 12)
        return annual, None

    # 2. between X and Y LPA or X-Y LPA or X to Y LPA
    match = re.search(
        r"(?:between\s+)?(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?)?\s*(?:-|to|and)\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?)",
        normalized,
    )
    if match:
        minimum = int(float(match.group(1)) * 100000)
        maximum = int(float(match.group(2)) * 100000)
        return minimum, maximum

    # 3. at least / minimum / above / more than / over / > X LPA or X+ LPA
    match = re.search(
        r"(?:(?:at least|minimum|above|more than|over|>)\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?)|(\d+(?:\.\d+)?)\s*\+\s*(?:lpa|lakhs?))",
        normalized,
    )
    if match:
        val = match.group(1) or match.group(2)
        minimum = int(float(val) * 100000)
        return minimum, None

    # 4. up to / maximum / below / less than / under / < X LPA
    match = re.search(
        r"(?:up to|maximum|below|less than|under|<)\s*(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?)",
        normalized,
    )
    if match:
        maximum = int(float(match.group(1)) * 100000)
        return None, maximum

    return None, None


def _extract_location(text: str) -> str | None:
    normalized = text.strip()

    # Match "in <location>"
    match = re.search(
        r"\bin\s+([A-Za-z][A-Za-z\s-]*?)(?=\s+"
        r"(?:paying|above|below|between|with|"
        r"at least|full[- ]?time|part[- ]?time|"
        r"contract|internship|fresher|for\b|\d+\s*lpa)\b|[,.!?]|$)",
        normalized,
        re.IGNORECASE,
    )

    if not match:
        # Check direct mentions of remote
        if re.search(r"\bremote\b", normalized, re.IGNORECASE):
            return "Remote"
        return None

    location = match.group(1).strip()

    if location.lower() in {
        "python",
        "machine learning",
        "ai",
        "backend",
        "data science",
        "data engineering",
        "java",
        "fullstack",
        "frontend",
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