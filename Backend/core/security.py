"""Security-Kern: Passwort-Hashing, JWT-Access-Tokens und Refresh-Token-Handling.

Kapselt die kryptografischen Details, damit Algorithmus/Library zentral
austauschbar bleiben und der Rest der App nur gegen diese Funktionen programmiert.
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from core.config import settings


class PasswordService:
    """Hasht und verifiziert Passwörter mit bcrypt (nie Klartext, nie Eigenimplementierung)."""

    @staticmethod
    def hash_password(plain_password: str) -> str:
        salt = bcrypt.gensalt(rounds=settings.bcrypt_rounds)
        return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(plain_password.encode("utf-8"), password_hash.encode("utf-8"))


# Gültiger bcrypt-Hash eines Zufallswerts, den niemand kennt. Wird beim Login für
# nicht existierende User verwendet, damit bcrypt.checkpw in jedem Fall ausgeführt
# wird (Timing-Angriffe zur User-Enumeration werden dadurch verhindert).
DUMMY_PASSWORD_HASH = PasswordService.hash_password(secrets.token_urlsafe(32))


def create_access_token(user_id: int) -> str:
    """Erstellt ein kurzlebiges, signiertes JWT für den Access-Token-Cookie."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_access_token_ttl_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int | None:
    """Verifiziert Signatur + Ablauf und liefert die User-ID, oder None bei ungültigem Token."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError:
        return None
    if payload.get("type") != "access":
        return None
    try:
        return int(payload["sub"])
    except (KeyError, ValueError, TypeError):
        return None


def generate_refresh_token() -> tuple[str, str]:
    """Erzeugt einen opaken Refresh-Token. Rückgabe: (Token für den Client, Hash für die DB)."""
    token = secrets.token_urlsafe(48)
    return token, hash_refresh_token(token)


def hash_refresh_token(token: str) -> str:
    """SHA-256-Hash des Refresh-Tokens für den DB-Vergleich (der Klartext-Token wird nie gespeichert)."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
