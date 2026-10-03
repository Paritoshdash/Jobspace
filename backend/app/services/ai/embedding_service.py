import requests


OLLAMA_EMBED_URL = "http://localhost:11434/api/embed"
EMBEDDING_MODEL = "nomic-embed-text"


def generate_embedding(text: str) -> list[float]:
    """Generate a vector embedding using the local Ollama model."""

    if not text.strip():
        raise ValueError("Text cannot be empty.")

    payload = {
        "model": EMBEDDING_MODEL,
        "input": text,
    }

    response = requests.post(
        OLLAMA_EMBED_URL,
        json=payload,
        timeout=120,
    )

    response.raise_for_status()

    data = response.json()

    embeddings = data.get("embeddings")

    if not embeddings:
        raise ValueError("Ollama returned no embeddings.")

    embedding = embeddings[0]

    if len(embedding) != 768:
        raise ValueError(
            f"Expected 768 dimensions, got {len(embedding)}."
        )

    return embedding