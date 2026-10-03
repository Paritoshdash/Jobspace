import json

from app.schemas.ai import JobAnalysis
from app.services.ai.llm_service import generate_text


def summarize_job(description: str) -> str:
    prompt = f"""
Summarize the following job description in 2-3 concise sentences.

Focus on:
- What the candidate will do
- The main technical requirements
- The overall role

Do not invent information.
Do not use bullet points.
Return only the summary.

Job description:
{description}
"""

    return generate_text(
        prompt,
        temperature=0.1,
    )


def analyze_job(description: str) -> JobAnalysis:
    """
    Analyze a job description and generate a summary
    and experience level.
    """

    if not description.strip():
        raise ValueError("Job description cannot be empty.")

    prompt = f"""
Analyze this job description.

JOB DESCRIPTION:
{description}

Return ONLY a JSON object with exactly these fields:

{{
  "summary": "concise actual summary",
  "experience_level": null
}}

Rules:

SUMMARY:
- Summarize the actual job in less than 30 words.
- Describe what the candidate will do.
- Use only information from the job description.
- Do not invent information.

EXPERIENCE LEVEL:
- Return one of exactly:
  "intern"
  "junior"
  "mid"
  "senior"
  null
- Only return an experience level if the job description provides evidence.
- If the description does not explicitly or clearly indicate an experience level, return null.
- Do NOT guess.

IMPORTANT:
- Never return placeholder text.
- Never explain your answer.
- Return ONLY valid JSON.
"""

    response = generate_text(
        prompt,
        temperature=0.0,
        num_predict=150,
        json_mode=True,
    )

    cleaned_response = response.strip()

    if cleaned_response.startswith("```"):
        lines = cleaned_response.splitlines()

        if lines and lines[0].strip().startswith("```"):
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        cleaned_response = "\n".join(lines).strip()

    try:
        data = json.loads(cleaned_response)

        result = JobAnalysis.model_validate(data)

        allowed_levels = {
            "intern",
            "junior",
            "mid",
            "senior",
            None,
        }

        if result.experience_level not in allowed_levels:
            raise ValueError(
                f"Invalid experience level: {result.experience_level}"
            )

        return result

    except (json.JSONDecodeError, ValueError) as exc:
        print("\n--- RAW AI RESPONSE ---")
        print(response)
        print("--- END RAW AI RESPONSE ---\n")

        raise ValueError(
            f"Invalid AI job analysis response: {exc}"
        ) from exc