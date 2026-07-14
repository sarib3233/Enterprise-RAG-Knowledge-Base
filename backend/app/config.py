from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://rag:rag@localhost:5432/rag"

    # LLM provider (any OpenAI-compatible endpoint works, e.g. Ollama)
    openai_api_key: str = ""
    openai_base_url: str | None = None
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    chat_model: str = "gpt-4o-mini"

    # Ingestion
    upload_dir: str = "data/uploads"
    chunk_size: int = 1000
    chunk_overlap: int = 150
    embedding_batch_size: int = 64
    max_upload_mb: int = 50

    # Retrieval
    top_k: int = 6
    # Cosine similarity below this on every retrieved chunk => "not found" answer
    score_threshold: float = 0.15

    # API
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def sync_database_url(self) -> str:
        return self.database_url.replace("+asyncpg", "+psycopg")


@lru_cache
def get_settings() -> Settings:
    return Settings()
