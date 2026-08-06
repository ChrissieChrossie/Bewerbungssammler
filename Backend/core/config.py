"""Zentrale Konfiguration, ausschließlich über Umgebungsvariablen (siehe .env.example)."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Auth- und Security-Einstellungen. Secrets kommen ausschließlich aus der Umgebung."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_access_token_ttl_minutes: int = 15
    jwt_refresh_token_ttl_days: int = 7

    bcrypt_rounds: int = 12

    # Frontend-Origin fuer CORS (nur relevant, wenn Frontend/Backend nicht ueber
    # den Vite-Dev-Proxy, sondern direkt cross-origin miteinander sprechen).
    frontend_origin: str = "http://localhost:5173"

    # In Produktion (HTTPS) auf true setzen, damit Cookies nur ueber TLS gesendet werden.
    cookie_secure: bool = False

    rate_limit_login: str = "5/minute"
    rate_limit_register: str = "5/minute"


settings = Settings()
