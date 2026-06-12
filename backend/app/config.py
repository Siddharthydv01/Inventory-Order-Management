"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from .env file or environment variables."""

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/inventory_db"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    APP_NAME: str = "Inventory & Order Management API"
    DEBUG: bool = False

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
