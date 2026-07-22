"""Datenbank-Setup: Engine, Session-Factory und Base-Klasse für die Models."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

# Fallback: SQLite für lokale Entwicklung
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bewerbungssammler.db")

# SQLite benötigt ein extra connect_args-Flag für Threading
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(  # pylint: disable=invalid-name
    autocommit=False, autoflush=False, bind=engine
)


class Base(DeclarativeBase):
    """Gemeinsame Basisklasse für alle SQLAlchemy-Models."""


def get_db():
    """Dependency: liefert eine DB-Session und schließt sie nach dem Request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
