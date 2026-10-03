import re

from app.services.ai.skill_dictionary import KNOWN_SKILLS


def extract_query_skills(query: str) -> list[str]:
    """
    Extract known technical skills directly from a search query.

    This is intentionally deterministic and does not call the LLM.
    Uses the canonical KNOWN_SKILLS dictionary.
    """

    if not query.strip():
        return []

    normalized_query = query.lower()

    found_skills: list[str] = []
    seen: set[str] = set()

    # Longer keywords first to avoid partial sub-matches (e.g., 'spring boot' before 'spring')
    sorted_keywords = sorted(
        KNOWN_SKILLS.keys(),
        key=len,
        reverse=True,
    )

    for keyword in sorted_keywords:
        pattern = rf"(?<!\w){re.escape(keyword)}(?!\w)"

        if re.search(pattern, normalized_query):
            normalized_name = KNOWN_SKILLS[keyword].lower()
            if normalized_name not in seen:
                found_skills.append(normalized_name)
                seen.add(normalized_name)

    return found_skills