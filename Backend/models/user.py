"""Model für Nutzer (Users)."""

from sqlalchemy import Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    """Ein Nutzer, der Bewerbungen verwaltet."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(254), unique=True, nullable=False)

    # password_hash speichert ausschließlich den bcrypt-Hash, niemals das Klartext-Passwort.
    # Nie in ein Response-Schema aufnehmen (siehe schemas/auth.py UserPublic).
    password_hash = Column(String(255), nullable=False)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    applications = relationship("Application", back_populates="user")
    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
