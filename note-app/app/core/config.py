from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NoteApp API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    GROQ_API_KEY: str
    OPENAI_API_KEY: str
    
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SECRET_KEY: str
    
    JWT_SECRET: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    DATABASE_URL: str

    class Config:
        env_file = ".env.local"
        case_sensitive = False

settings = Settings()
