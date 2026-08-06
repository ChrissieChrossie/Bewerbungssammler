"""Datenbank-Setup: Engine, Session-Factory und Base-Klasse für die Models."""

import os
from pathlib import Path

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

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


def run_migrations() -> None:
    """Bringt das Schema beim App-Start per Alembic auf den neuesten Stand.

    Ersetzt das frühere ``Base.metadata.create_all()``. Für Datenbanken, die vor
    der Einführung von Alembic bereits per create_all angelegt wurden (Tabellen
    existieren, aber es gibt noch keine Alembic-Revisions-Historie), wird zuerst
    auf die Baseline-Revision gestempelt, statt die (bereits vorhandenen) Tabellen
    erneut anzulegen.
    """
    from alembic import command
    from alembic.config import Config
    from alembic.runtime.migration import MigrationContext

    alembic_cfg = Config(str(BASE_DIR / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(BASE_DIR / "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", DATABASE_URL)

    with engine.connect() as connection:
        current_revision = MigrationContext.configure(connection).get_current_revision()
        already_has_tables = inspect(connection).has_table("users")

    if current_revision is None and already_has_tables:
        command.stamp(alembic_cfg, "0001_baseline")

    command.upgrade(alembic_cfg, "head")
