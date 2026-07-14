from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models import DocumentStatus


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    title: str
    status: DocumentStatus
    page_count: int | None
    chunk_count: int | None
    error: str | None
    created_at: datetime


class SourceOut(BaseModel):
    chunk_id: str
    document_id: str
    document_title: str
    page_number: int
    chunk_index: int
    score: float
    text: str


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None
    document_id: str | None = None


class ConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    document_id: str | None
    title: str
    created_at: datetime


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: str
    content: str
    sources: list | None
    created_at: datetime
