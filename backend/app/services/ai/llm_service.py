import requests


OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen3:14b"


def generate_text(
    prompt: str,
    temperature: float = 0.2,
    num_predict: int = 512,
    json_mode: bool = False,
) -> str:
    """
    Generate text using a local Ollama model.
    """

    options = {
        "temperature": temperature,
        "num_predict": num_predict,
    }

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": options,
    }

    # Qwen3 thinking is unnecessary for structured extraction
    # and can consume the output token budget.
    if json_mode:
        payload["format"] = "json"
        payload["think"] = False

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=300,
        )

        response.raise_for_status()

    except requests.RequestException as e:
        raise RuntimeError(
            f"Failed to connect to Ollama: {e}"
        ) from e

    data = response.json()

    text = data.get("response")

    if not text:
        raise ValueError(
            "Ollama returned an empty response."
        )

    return text.strip()