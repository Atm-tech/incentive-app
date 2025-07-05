from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    DATABASE_URL: str
    master_admin_secret: str
    class Config:
        env_file = ".env"

settings = Settings()
