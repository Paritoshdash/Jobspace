import re
from typing import NamedTuple

# Domain definitions
TECH_ROLE_KEYWORDS = {
    "developer", "engineer", "software", "programmer", "architect",
    "devops", "cloud", "backend", "frontend", "fullstack", "full-stack",
    "ai", "ml", "machine learning", "deep learning", "nlp", "computer vision",
    "data scientist", "data engineer", "data analyst", "database",
    "qa", "sdet", "tester", "testing", "security", "sysadmin", "infrastructure",
    "mobile", "android", "ios", "react", "angular", "vue", "python", "java",
    "golang", "c++", "c#", ".net", "rust", "php", "ruby", "typescript",
    "javascript", "node", "django", "fastapi", "spring", "docker", "kubernetes",
}

NON_TECH_OCCUPATIONS = {
    # Trades & Maintenance
    "plumber": "trades",
    "electrician": "trades",
    "carpenter": "trades",
    "mechanic": "trades",
    "welder": "trades",
    "painter": "trades",
    "mason": "trades",
    "handyman": "trades",
    "roofer": "trades",
    "blacksmith": "trades",
    # Healthcare
    "nurse": "healthcare",
    "doctor": "healthcare",
    "physician": "healthcare",
    "surgeon": "healthcare",
    "dentist": "healthcare",
    "pharmacist": "healthcare",
    "therapist": "healthcare",
    "paramedic": "healthcare",
    "caregiver": "healthcare",
    # Hospitality, Transport & Services
    "chef": "hospitality",
    "cook": "hospitality",
    "waiter": "hospitality",
    "waitress": "hospitality",
    "bartender": "hospitality",
    "barista": "hospitality",
    "driver": "transport",
    "chauffeur": "transport",
    "pilot": "transport",
    "delivery": "transport",
    "security guard": "services",
    "janitor": "services",
    "housekeeper": "hospitality",
    # Business, Real Estate & Trades
    "broker": "real_estate",
    "real estate broker": "real_estate",
    "real estate agent": "real_estate",
    "realtor": "real_estate",
    "accountant": "finance",
    "bookkeeper": "finance",
    "cashier": "retail",
    "teller": "finance",
    "teacher": "education",
    "professor": "education",
    "tutor": "education",
    "lawyer": "legal",
    "paralegal": "legal",
    "attorney": "legal",
    "receptionist": "admin",
}

CITY_ALIASES = {
    "bangalore": "bengaluru",
    "bengaluru": "bangalore",
    "gurgaon": "gurugram",
    "gurugram": "gurgaon",
    "mumbai": "bombay",
    "bombay": "mumbai",
    "calcutta": "kolkata",
    "kolkata": "calcutta",
    "madras": "chennai",
    "chennai": "madras",
}


class QueryIntent(NamedTuple):
    domain: str  # "TECH", "NON_TECH", "GENERAL"
    category: str | None  # e.g. "trades", "healthcare", "real_estate", "software", etc.
    matched_role_term: str | None
    is_specific_role: bool


def classify_query_intent(query: str) -> QueryIntent:
    """
    Classify the search query to identify if it is looking for a Tech or Non-Tech occupation,
    or general employment.
    """
    q_lower = query.lower().strip()

    # 1. Check for specific non-tech occupations (longest phrases first)
    sorted_non_tech = sorted(NON_TECH_OCCUPATIONS.keys(), key=lambda x: -len(x))
    for occupation in sorted_non_tech:
        pattern = r"\b" + re.escape(occupation) + r"s?\b"
        if re.search(pattern, q_lower):
            return QueryIntent(
                domain="NON_TECH",
                category=NON_TECH_OCCUPATIONS[occupation],
                matched_role_term=occupation,
                is_specific_role=True,
            )

    # 2. Check for tech role keywords
    matched_tech = []
    for kw in TECH_ROLE_KEYWORDS:
        pattern = r"\b" + re.escape(kw) + r"s?\b"
        if re.search(pattern, q_lower):
            matched_tech.append(kw)

    if matched_tech:
        # Longest match as primary role term
        primary_tech = max(matched_tech, key=len)
        return QueryIntent(
            domain="TECH",
            category="software",
            matched_role_term=primary_tech,
            is_specific_role=True,
        )

    # 3. Fallback: GENERAL intent
    return QueryIntent(
        domain="GENERAL",
        category=None,
        matched_role_term=None,
        is_specific_role=False,
    )


def classify_job_domain(title: str, description: str, skills: list[str]) -> str:
    """
    Classify a job as TECH or NON_TECH based on title and metadata.
    """
    combined_title = title.lower()
    combined_skills = [s.lower() for s in skills]

    # Check title for tech keywords
    for kw in TECH_ROLE_KEYWORDS:
        if re.search(r"\b" + re.escape(kw) + r"s?\b", combined_title):
            return "TECH"

    # Check skills
    for s in combined_skills:
        for kw in TECH_ROLE_KEYWORDS:
            if kw in s:
                return "TECH"

    # Check title for non-tech occupations
    for occ in NON_TECH_OCCUPATIONS:
        if re.search(r"\b" + re.escape(occ) + r"s?\b", combined_title):
            return "NON_TECH"

    # Fallback to tech if it contains tech skills in description
    desc_sample = description[:1000].lower()
    tech_count = sum(1 for kw in ["software", "python", "code", "programming", "api", "database"] if kw in desc_sample)
    if tech_count >= 2:
        return "TECH"

    return "GENERAL"


def evaluate_job_relevance_gate(
    query_intent: QueryIntent,
    query_text: str,
    job_title: str,
    job_description: str,
    job_skills: list[str],
    semantic_score: float,
) -> tuple[bool, str | None]:
    """
    Hard relevance gate. Determines whether a candidate job is actually relevant
    to the user's intent.

    Returns:
        (is_relevant, rejection_reason)
    """
    title_lower = job_title.lower()
    desc_lower = job_description[:2000].lower()
    skills_lower = [s.lower() for s in job_skills]

    # --- Rule 1: NON_TECH queries must NEVER return TECH jobs ---
    if query_intent.domain == "NON_TECH":
        # The query is for a non-tech occupation (e.g. plumber, electrician, nurse, broker)
        role_term = query_intent.matched_role_term or ""

        # The job title or description MUST contain the requested non-tech occupation
        role_in_title = bool(re.search(r"\b" + re.escape(role_term) + r"s?\b", title_lower))
        role_in_desc = bool(re.search(r"\b" + re.escape(role_term) + r"s?\b", desc_lower))

        if not (role_in_title or role_in_desc):
            return False, f"Job does not match non-tech occupation '{role_term}'"

        # Even if mentioned in passing, ensure job is not a software/tech job
        job_dom = classify_job_domain(job_title, job_description, job_skills)
        if job_dom == "TECH" and not role_in_title:
            return False, f"Candidate is a tech job unrelated to '{role_term}'"

        return True, None

    # --- Rule 2: Specific TECH queries require topical alignment ---
    if query_intent.domain == "TECH" and query_intent.matched_role_term:
        role_term = query_intent.matched_role_term

        # Check for role track mismatch (e.g., Engineer vs Sales/Legal/Recruiter)
        is_tech_engineering_query = any(
            t in query_text.lower() for t in ["engineer", "developer", "architect", "scientist", "programmer"]
        )
        is_sales_or_legal_job = any(
            t in title_lower for t in ["account executive", "account manager", "sales", "legal counsel", "recruiter", "partnerships"]
        )
        if is_tech_engineering_query and is_sales_or_legal_job:
            return False, f"Engineering query '{query_text}' does not match sales/business role '{job_title}'"

        # Check required programming languages / core frameworks specified in query
        distinct_techs = [
            "java", "python", "golang", "rust", "ruby", "php", "c++", "c#", 
            "scala", "flutter", "react", "angular", "vue", "swift", "kotlin"
        ]
        for tech in distinct_techs:
            if re.search(r"\b" + re.escape(tech) + r"\b", query_text.lower()):
                tech_in_title = bool(re.search(r"\b" + re.escape(tech) + r"\b", title_lower))
                tech_in_skills = any(re.search(r"\b" + re.escape(tech) + r"\b", s) for s in skills_lower)
                tech_in_desc = bool(re.search(r"\b" + re.escape(tech) + r"\b", desc_lower))
                if not (tech_in_title or tech_in_skills or tech_in_desc):
                    return False, f"Query specifies '{tech}' but candidate job does not mention or require it"

        # Check if the role term or related tech appears in title, skills, or description
        role_in_title = bool(re.search(r"\b" + re.escape(role_term) + r"\b", title_lower))
        role_in_skills = any(role_term in s for s in skills_lower)
        role_in_desc = bool(re.search(r"\b" + re.escape(role_term) + r"\b", desc_lower))

        # Check semantic score threshold
        # Weak semantic similarity (< 0.40) without title or skill match must be rejected
        if not (role_in_title or role_in_skills):
            if semantic_score < 0.42:
                return False, f"Low semantic similarity ({semantic_score:.2f}) and no match on '{role_term}'"

            # Check if query words overlap with title
            query_words = set(re.findall(r"\w+", query_text.lower())) - {"in", "and", "or", "for", "with", "a", "an", "the", "jobs", "job", "lpa"}
            title_words = set(re.findall(r"\w+", title_lower))
            if not query_words.intersection(title_words) and not role_in_desc:
                if semantic_score < 0.50:
                    return False, f"No lexical or skill match on '{role_term}' and insufficient semantic score"

        return True, None

    # --- Rule 3: General queries ---
    # For general queries, require a reasonable semantic similarity threshold
    if semantic_score < 0.35:
        # Check if any non-trivial word in query is in the title
        query_words = set(re.findall(r"\w+", query_text.lower())) - {"in", "and", "or", "for", "with", "a", "an", "the", "jobs", "job", "lpa"}
        title_words = set(re.findall(r"\w+", title_lower))
        if not query_words.intersection(title_words):
            return False, f"Semantic score {semantic_score:.2f} below general threshold and no word overlap"

    return True, None


def location_matches(query_location: str | None, job_location: str | None) -> bool:
    """
    Check if job location matches query location, supporting Indian city aliases and remote work.
    """
    if not query_location:
        return True
    if not job_location:
        return False

    q_loc = query_location.lower().strip()
    j_loc = job_location.lower().strip()

    if q_loc in j_loc:
        return True

    # Check aliases
    alias = CITY_ALIASES.get(q_loc)
    if alias and alias in j_loc:
        return True

    # Remote checks
    if "remote" in q_loc and "remote" in j_loc:
        return True

    return False
