import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Based Intelligent Food Packaging Decision-Support System"
    VERSION: str = "1.1.0"
    API_V1_STR: str = "/api"
    
    # Database: Defaults to SQLite for local development; supports PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR.as_posix()}/packaging.db")
    
    # External APIs
    OPEN_FOOD_FACTS_V3_URL: str = "https://world.openfoodfacts.org/api/v3"
    OPEN_FOOD_FACTS_V2_FALLBACK_URL: str = "https://world.openfoodfacts.org/api/v2"
    OPEN_FOOD_FACTS_TIMEOUT: float = 3.5
    OPEN_METEO_TIMEOUT: float = 3.0
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        case_sensitive = True

settings = Settings()
