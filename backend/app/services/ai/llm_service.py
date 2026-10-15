import re
import requests


OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen3:14b"


def generate_text(
    prompt: str,
    temperature: float = 0.2,
    num_predict: int = 512,
    json_mode: bool = False,
    think: bool = False,
) -> str:
    """
    Generate text using a local Ollama model.
    Disables thinking mode by default to prevent long CPU latency and token exhaustion.
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
        "think": think,
    }

    if json_mode:
        payload["format"] = "json"

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=180,
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

    # Strip thinking tags if returned by reasoning models
    text = re.sub(r"<think>[\s\S]*?</think>", "", text).strip()

    return text