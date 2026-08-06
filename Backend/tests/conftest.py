"""Pytest-Fixtures: isolierte SQLite-Test-Datenbank + FastAPI-TestClient."""

import os
from pathlib import Path

_TEST_DB_PATH = Path(__file__).resolve().parent / "test_bewerbungssammler.db"
_TEST_DB_PATH.unlink(missing_ok=True)

# Muss gesetzt sein, bevor database.py (und damit die Engine) importiert wird.
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB_PATH}"
os.environ["JWT_SECRET"] = "test-secret-not-for-production"
os.environ["COOKIE_SECURE"] = "false"
os.environ["RATE_LIMIT_LOGIN"] = "1000/minute"
os.environ["RATE_LIMIT_REGISTER"] = "1000/minute"

import pytest  # noqa: E402  pylint: disable=wrong-import-position
from fastapi.testclient import TestClient  # noqa: E402  pylint: disable=wrong-import-position

from database import Base, engine  # noqa: E402  pylint: disable=wrong-import-position
from main import app  # noqa: E402  pylint: disable=wrong-import-position


@pytest.fixture(scope="session")
def _app_client():
    """Startet die App einmal pro Test-Session (führt dabei echte Alembic-Migrationen aus)."""
    with TestClient(app) as test_client:
        yield test_client
    _TEST_DB_PATH.unlink(missing_ok=True)


@pytest.fixture
def client(_app_client):
    """Liefert pro Test einen Client mit leerem Cookie-Jar und leeren Tabellen danach."""
    _app_client.cookies.clear()
    yield _app_client
    with engine.begin() as connection:
        for table in reversed(Base.metadata.sorted_tables):
            connection.execute(table.delete())
    _app_client.cookies.clear()
