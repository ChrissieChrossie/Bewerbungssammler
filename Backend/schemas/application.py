"""Pydantic-Schemas für Bewerbungen (Applications)."""

from datetime import date
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from models.application import ApplicationStatus


class ApplicationBase(BaseModel):
    """Gemeinsame Felder aller Application-Schemas."""

    job_posting_id: int
    status: ApplicationStatus = ApplicationStatus.OPEN
    applied_at: date
    note: str | None = None


class ApplicationCreate(ApplicationBase):
    """Schema zum Anlegen einer Bewerbung. user_id kommt aus der Session, nicht vom Client."""


class ApplicationUpdate(BaseModel):
    """Schema zum teilweisen Aktualisieren einer Bewerbung."""

    status: ApplicationStatus | None = None
    applied_at: date | None = None
    note: str | None = None


class ApplicationRead(ApplicationBase):
    """Schema zum Auslesen einer Bewerbung."""

    id: int
    user_id: int

    model_config = {"from_attributes": True}
