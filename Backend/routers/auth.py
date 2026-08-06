"""API-Endpunkte für Registrierung, Login, Logout, Token-Refresh und Passwort-Änderung."""

import re
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from core.config import settings
from core.rate_limit import limiter
from core.security import (
    DUMMY_PASSWORD_HASH,
    PasswordService,
    create_access_token,
    generate_refresh_token,
    hash_refresh_token,
)
from database import get_db
from dependencies import ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, get_current_user
from models.refresh_token import RefreshToken
from models.user import User
from schemas.auth import ChangePasswordRequest, LoginRequest, RegisterRequest, UserPublic

router = APIRouter(prefix="/auth", tags=["Auth"])

GENERIC_LOGIN_ERROR = "E-Mail oder Passwort ist falsch."


def _derive_username(db: Session, email: str) -> str:
    """Leitet einen eindeutigen Username aus dem E-Mail-Local-Part ab (intern, nicht abgefragt)."""
    base = re.sub(r"[^a-z0-9]", "", email.split("@", 1)[0].lower()) or "user"
    base = base[:90]
    candidate = base
    suffix = 0
    while db.query(User).filter(User.username == candidate).first():
        suffix += 1
        candidate = f"{base}{suffix}"
    return candidate


def _issue_tokens(response: Response, db: Session, user: User, remember_me: bool) -> None:
    """Stellt Access- und Refresh-Token aus, persistiert den Refresh-Token-Hash und setzt Cookies."""
    access_token = create_access_token(user.id)
    refresh_token_plain, refresh_token_hash = generate_refresh_token()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=settings.jwt_refresh_token_ttl_days)

    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=refresh_token_hash,
            expires_at=expires_at,
            remember_me=remember_me,
        )
    )
    db.commit()

    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=access_token,
        max_age=settings.jwt_access_token_ttl_minutes * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )
    refresh_cookie_kwargs = {
        "key": REFRESH_TOKEN_COOKIE,
        "value": refresh_token_plain,
        "httponly": True,
        "secure": settings.cookie_secure,
        "samesite": "lax",
        "path": "/api/auth",
    }
    if remember_me:
        refresh_cookie_kwargs["max_age"] = settings.jwt_refresh_token_ttl_days * 86400
    response.set_cookie(**refresh_cookie_kwargs)


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_TOKEN_COOKIE, path="/")
    response.delete_cookie(REFRESH_TOKEN_COOKIE, path="/api/auth")


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.rate_limit_register)
def register(
    request: Request,  # noqa: ARG001 -- von slowapi für das Rate Limiting benötigt
    payload: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """Registriert einen neuen Nutzer. Sofort aktiv, keine Mail-Freischaltung nötig."""
    email = str(payload.email).strip().lower()

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Diese E-Mail-Adresse ist bereits registriert.",
        )

    user = User(
        username=_derive_username(db, email),
        name=payload.name,
        email=email,
        password_hash=PasswordService.hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    _issue_tokens(response, db, user, remember_me=False)
    return user


@router.post("/login", response_model=UserPublic)
@limiter.limit(settings.rate_limit_login)
def login(
    request: Request,  # noqa: ARG001 -- von slowapi für das Rate Limiting benötigt
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """Meldet einen Nutzer an. Fehler sind absichtlich generisch (kein User-Enumeration-Leak)."""
    email = str(payload.email).strip().lower()
    user = db.query(User).filter(User.email == email).first()

    # Hash-Vergleich läuft immer, auch wenn kein User existiert (Timing-safe gegen Enumeration).
    password_hash = user.password_hash if user else DUMMY_PASSWORD_HASH
    password_valid = PasswordService.verify_password(payload.password, password_hash)

    if not user or not password_valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=GENERIC_LOGIN_ERROR)

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    _issue_tokens(response, db, user, remember_me=payload.remember_me)
    return user


@router.post("/logout")
def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_TOKEN_COOKIE),
    db: Session = Depends(get_db),
):
    """Invalidiert den aktuellen Refresh-Token und löscht beide Auth-Cookies."""
    if refresh_token:
        token_hash = hash_refresh_token(refresh_token)
        record = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
        if record and record.revoked_at is None:
            record.revoked_at = datetime.now(timezone.utc)
            db.commit()

    _clear_auth_cookies(response)
    return {"detail": "Erfolgreich abgemeldet."}


@router.post("/refresh", response_model=UserPublic)
def refresh(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_TOKEN_COOKIE),
    db: Session = Depends(get_db),
):
    """Rotiert den Refresh-Token und stellt ein neues Access-Token aus."""
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Sitzung abgelaufen, bitte erneut anmelden."
    )
    if not refresh_token:
        raise unauthorized

    token_hash = hash_refresh_token(refresh_token)
    record = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    now = datetime.now(timezone.utc)
    if not record or record.revoked_at is not None or record.expires_at < now:
        raise unauthorized

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise unauthorized

    record.revoked_at = now  # Rotation: der alte Token ist ab hier verbraucht.
    db.commit()

    _issue_tokens(response, db, user, remember_me=record.remember_me)
    return user


@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)):
    """Liefert den aktuell eingeloggten Nutzer."""
    return current_user


@router.post("/change-password", response_model=UserPublic)
def change_password(
    payload: ChangePasswordRequest,
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_TOKEN_COOKIE),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ändert das Passwort und invalidiert alle bestehenden Sessions (die aktuelle wird erneuert)."""
    if not PasswordService.verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Das aktuelle Passwort ist falsch."
        )

    # Ob die aktuelle Session "angemeldet bleiben" war, für die neu ausgestellten Tokens übernehmen.
    remember_me = False
    if refresh_token:
        current_record = (
            db.query(RefreshToken)
            .filter(RefreshToken.token_hash == hash_refresh_token(refresh_token))
            .first()
        )
        if current_record:
            remember_me = current_record.remember_me

    current_user.password_hash = PasswordService.hash_password(payload.new_password)
    now = datetime.now(timezone.utc)
    db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id, RefreshToken.revoked_at.is_(None)
    ).update({"revoked_at": now})
    db.commit()
    db.refresh(current_user)

    _issue_tokens(response, db, current_user, remember_me=remember_me)
    return current_user
