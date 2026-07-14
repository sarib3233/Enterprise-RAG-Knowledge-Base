"""Background ingestion pipeline: parse -> chunk -> embed -> store."""

import logging
from pathlib import Path

from sqlalchemy import select, update

from app.db import SessionLocal
from app.models import Chunk, Document, DocumentStatus
from app.rag.chunker import chunk_pages, parse_pdf
from app.rag.embeddings import embed_texts

logger = logging.getLogger(__name__)


async def ingest_document(document_id: str, file_path: str) -> None:
    """Run the full ingestion pipeline for an uploaded PDF.

    Designed to run as a FastAPI BackgroundTask; opens its own DB session and
    records failures on the document row instead of raising.
    """
    async with SessionLocal() as session:
        await session.execute(
            update(Document)
            .where(Document.id == document_id)
            .values(status=DocumentStatus.processing)
        )
        await session.commit()

        try:
            pages, page_count = parse_pdf(file_path)
            if not pages:
                raise ValueError("No extractable text found in PDF (it may be scanned images).")

            chunks = chunk_pages(pages)
            vectors = await embed_texts([c.text for c in chunks])

            document = (
                await session.execute(select(Document).where(Document.id == document_id))
            ).scalar_one()
            for chunk, vector in zip(chunks, vectors):
                session.add(
                    Chunk(
                        document_id=document.id,
                        chunk_index=chunk.chunk_index,
                        page_number=chunk.page_number,
                        text=chunk.text,
                        embedding=vector,
                    )
                )
            document.page_count = page_count
            document.chunk_count = len(chunks)
            document.status = DocumentStatus.ready
            await session.commit()
            logger.info("Ingested document %s: %d pages, %d chunks", document_id, page_count, len(chunks))
        except Exception as exc:
            logger.exception("Ingestion failed for document %s", document_id)
            await session.rollback()
            await session.execute(
                update(Document)
                .where(Document.id == document_id)
                .values(status=DocumentStatus.failed, error=str(exc)[:2000])
            )
            await session.commit()
            Path(file_path).unlink(missing_ok=True)
