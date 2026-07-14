"""Embedding client. Works with any OpenAI-compatible endpoint (OpenAI, Ollama, vLLM...)."""

from functools import lru_cache

from openai import AsyncOpenAI

from app.config import get_settings


@lru_cache
def get_openai_client() -> AsyncOpenAI:
    settings = get_settings()
    # `or None` so an empty env var falls back to the provider default URL
    return AsyncOpenAI(
        api_key=settings.openai_api_key or "unused",
        base_url=settings.openai_base_url or None,
    )


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Batch-embed texts, respecting the configured batch size."""
    settings = get_settings()
    client = get_openai_client()
    vectors: list[list[float]] = []
    for start in range(0, len(texts), settings.embedding_batch_size):
        batch = texts[start : start + settings.embedding_batch_size]
        response = await client.embeddings.create(model=settings.embedding_model, input=batch)
        vectors.extend(item.embedding for item in response.data)
    return vectors


async def embed_query(text: str) -> list[float]:
    return (await embed_texts([text]))[0]
