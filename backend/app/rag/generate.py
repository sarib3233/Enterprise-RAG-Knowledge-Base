"""Grounded answer generation with token streaming."""

from collections.abc import AsyncGenerator

from app.config import get_settings
from app.rag.embeddings import get_openai_client
from app.rag.prompts import SYSTEM_PROMPT, format_context
from app.rag.retriever import RetrievedChunk


async def stream_answer(
    question: str,
    chunks: list[RetrievedChunk],
    history: list[dict],
) -> AsyncGenerator[str, None]:
    """Stream the LLM answer grounded in the retrieved chunks.

    `history` is a list of {"role", "content"} dicts for prior turns
    (most recent turns only; the current question is passed separately).
    """
    settings = get_settings()
    client = get_openai_client()

    messages = [{"role": "system", "content": SYSTEM_PROMPT.format(context=format_context(chunks))}]
    messages.extend(history)
    messages.append({"role": "user", "content": question})

    stream = await client.chat.completions.create(
        model=settings.chat_model,
        messages=messages,
        temperature=0,
        stream=True,
    )
    async for event in stream:
        if event.choices and event.choices[0].delta.content:
            yield event.choices[0].delta.content
