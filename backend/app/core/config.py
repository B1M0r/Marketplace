from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra='ignore', env_file='.env', env_file_encoding='utf-8')
    
    DATABASE_URL: str = "postgresql://postgres:admin@localhost:5432/marketplace"
    JWT_SECRET: str = "caa92feefa6438c8c96d1b75f1bc388c7df2cc5e5425a2b91077d3aa5c5c2e4416acf9bfe7b9a122b07d3b071cd626c6f81a68b406078a787a3a524db986dea1"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30


@lru_cache()
def get_settings():
    return Settings()
