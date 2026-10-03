import re

from app.services.ai.skill_dictionary import KNOWN_SKILLS

PREFERRED_PATTERNS = [
    r"\bpreferred\b",
    r"\bpreferably\b",
    r"\bnice to have\b",
    r"\bnice-to-have\b",
    r"\bplus\b",
    r"\bbonus\b",
    r"\boptional\b",
    r"\bwould be a plus\b",
]


def _is_preferred(sentence: str) -> bool:
    return any(
        re.search(pattern, sentence, re.IGNORECASE)
        for pattern in PREFERRED_PATTERNS
    )


def extract_skills_from_text(description: str) -> list[dict]:
    """
    Extract technical skills from job description text.
    Categorizes skills as 'preferred' or 'required' based on sentence context.
    Ensures deduplication and prevents false partial matches.
    """
    if not description:
        return []

    # Split description into sentences
    sentences = re.split(r"[.!?\n]+", description)

    found_skills: list[dict] = []
    seen_skills: set[str] = set()

    # Sort keywords by length descending to match composite skills first (e.g. "spring boot" before "spring")
    sorted_keywords = sorted(
        KNOWN_SKILLS.keys(),
        key=len,
        reverse=True,
    )

    for sentence in sentences:
        sentence_lower = sentence.lower().strip()
        if not sentence_lower:
            continue

        sentence_is_preferred = _is_preferred(sentence_lower)

        for keyword in sorted_keywords:
            pattern = rf"(?<!\w){re.escape(keyword)}(?!\w)"

            if not re.search(pattern, sentence_lower):
                continue

            display_name = KNOWN_SKILLS[keyword]
            normalized_name = display_name.lower()

            if normalized_name in seen_skills:
                continue

            skill_type = "preferred" if sentence_is_preferred else "required"

            found_skills.append(
                {
                    "name": display_name,
                    "skill_type": skill_type,
                }
            )
            seen_skills.add(normalized_name)

    return found_skills