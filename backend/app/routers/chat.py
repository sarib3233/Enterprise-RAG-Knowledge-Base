import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.config import get_settings
from app.db import SessionLocal, get_session
from app.models import Conversation, Message
from app.rag.generate import stream_answer
from app.rag.prompts import NOT_FOUND_ANSWER
from app.rag.retriever import retrieve
from app.schemas import ChatRequest

router = APIRouter(prefix="/api/chat", tags=["chat"])

MAX_HISTORY_MESSAGES = 10


@router.post("")
async def chat(request: ChatRequest, session: AsyncSession = Depends(get_session)):
    """RAG chat endpoint. Streams SSE events:

    - `conversation`: {"conversation_id"} (always first)
    - `sources`: list of retrieved chunks with page numbers and scores
    - `token`: incremental answer text
    - `done`: {"message_id"} once the full answer is persisted
    - `error`: {"detail"} on failure
    """
    question = request.message.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Message must not be empty.")

    if request.conversation_id:
        conversation = await session.get(Conversation, request.conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found.")
    else:
        conversation = Conversation(
            document_id=request.document_id,
            title=question[:80],
        )
        session.add(conversation)
        await session.commit()
        await session.refresh(conversation)

    # Prior turns for conversational context (already ordered by created_at).
    await session.refresh(conversation, ["messages"])
    history = [
        {"role": m.role, "content": m.content}
        for m in conversation.messages[-MAX_HISTORY_MESSAGES:]
    ]
    conversation_id = conversation.id
    document_id = request.document_id or conversation.document_id

    async def event_stream():
        settings = get_settings()
        # The request-scoped session closes when the handler returns, so the
        # generator (which outlives it) uses its own session.
        async with SessionLocal() as stream_session:
            try:
                yield {"event": "conversation", "data": json.dumps({"conversation_id": conversation_id})}

                chunks = await retrieve(stream_session, question, document_id)
                yield {
                    "event": "sources",
                    "data": json.dumps([c.to_source() for c in chunks]),
                }

                grounded = any(c.score >= settings.score_threshold for c in chunks)
                if not grounded:
                    answer = NOT_FOUND_ANSWER
                    yield {"event": "token", "data": json.dumps({"text": answer})}
                    sources: list[dict] = []
                else:
                    parts: list[str] = []
                    async for token in stream_answer(question, chunks, history):
                        parts.append(token)
                        yield {"event": "token", "data": json.dumps({"text": token})}
                    answer = "".join(parts)
                    sources = [c.to_source() for c in chunks]

                stream_session.add(
                    Message(conversation_id=conversation_id, role="user", content=question)
                )
                assistant_message = Message(
                    conversation_id=conversation_id,
                    role="assistant",
                    content=answer,
                    sources=sources,
                )
                stream_session.add(assistant_message)
                await stream_session.commit()
                yield {"event": "done", "data": json.dumps({"message_id": assistant_message.id})}
            except Exception as exc:  # surface the failure to the client
                yield {"event": "error", "data": json.dumps({"detail": str(exc)})}

    return EventSourceResponse(event_stream())
