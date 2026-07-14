"""pgvector similarity search."""

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models import Chunk, Document, DocumentStatus
from app.rag.embeddings import embed_query


@dataclass
class RetrievedChunk:
    chunk_id: str
    document_id: str
    document_title: str
    page_number: int
    chunk_index: int
    text: str
    score: float  # cosine similarity in [-1, 1]

    def to_source(self) -> dict:
        return {
            "chunk_id": self.chunk_id,
            "document_id": self.document_id,
            "document_title": self.document_title,
            "page_number": self.page_number,
            "chunk_index": self.chunk_index,
            "score": round(self.score, 4),
            "text": self.text,
        }


async def retrieve(
    session: AsyncSession, question: str, document_id: str | None = None
) -> list[RetrievedChunk]:
    """Embed the question and return the top-k most similar chunks.

    Restricted to a single document when document_id is given, otherwise all
    ready documents are searched.
    """
    settings = get_settings()
    query_vector = await embed_query(question)

    distance = Chunk.embedding.cosine_distance(query_vector)
    stmt = (
        select(Chunk, Document.title, distance.label("distance"))
        .join(Document, Chunk.document_id == Document.id)
        .where(Document.status == DocumentStatus.ready)
    )
    if document_id:
        stmt = stmt.where(Chunk.document_id == document_id)
    stmt = stmt.order_by(distance).limit(settings.top_k)

    rows = (await session.execute(stmt)).all()
    return [
        RetrievedChunk(
            chunk_id=chunk.id,
            document_id=chunk.document_id,
            document_title=title,
            page_number=chunk.page_number,
            chunk_index=chunk.chunk_index,
            text=chunk.text,
            score=1.0 - dist,
        )
        for chunk, title, dist in rows
    ]
