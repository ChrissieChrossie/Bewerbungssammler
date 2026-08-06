"""Wiederverwendbare FastAPI-Dependencies (aktuell: Auth-Guard)."""

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.security import decode_access_token
from database import get_db
from models.user import User

ACCESS_TOKEN_COOKIE = "access_token"
REFRESH_TOKEN_COOKIE = "refresh_token"

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Nicht angemeldet.",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    access_token: str | None = Cookie(default=None, alias=ACCESS_TOKEN_COOKIE),
    db: Session = Depends(get_db),
) -> User:
    """Guard für geschützte Endpoints: liest den Access-Token-Cookie, lädt den User. 401 sonst."""
    if not access_token:
        raise _UNAUTHORIZED
    user_id = decode_access_token(access_token)
    if user_id is None:
        raise _UNAUTHORIZED
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise _UNAUTHORIZED
    return user
