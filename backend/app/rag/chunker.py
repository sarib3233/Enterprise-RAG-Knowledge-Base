"""Page-aware PDF parsing and chunking."""

from dataclasses import dataclass
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from app.config import get_settings


@dataclass
class TextChunk:
    text: str
    page_number: int  # 1-based
    chunk_index: int


def parse_pdf(path: str | Path) -> tuple[list[tuple[int, str]], int]:
    """Return [(page_number, page_text), ...] and the total page count."""
    reader = PdfReader(str(path))
    pages: list[tuple[int, str]] = []
    for i, page in enumerate(reader.pages, start=1):
        text = (page.extract_text() or "").strip()
        if text:
            pages.append((i, text))
    return pages, len(reader.pages)


def chunk_pages(pages: list[tuple[int, str]]) -> list[TextChunk]:
    """Split page texts into overlapping chunks, keeping page provenance.

    Each page is split independently so every chunk maps to exactly one page,
    which keeps citations precise.
    """
    settings = get_settings()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks: list[TextChunk] = []
    index = 0
    for page_number, page_text in pages:
        for piece in splitter.split_text(page_text):
            piece = piece.strip()
            if not piece:
                continue
            chunks.append(TextChunk(text=piece, page_number=page_number, chunk_index=index))
            index += 1
    return chunks
