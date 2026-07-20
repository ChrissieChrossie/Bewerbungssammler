"""Pydantic-Schemas für Stellenausschreibungen (Job Postings)."""

from datetime import date
from pydantic import BaseModel, HttpUrl  # pylint: disable=no-name-in-module


class JobPostingBase(BaseModel):
    """Gemeinsame Felder aller JobPosting-Schemas."""

    title: str
    posted_at: date | None = None
    link: HttpUrl | None = None
    company_id: int


class JobPostingCreate(JobPostingBase):
    """Schema zum Anlegen einer Stellenausschreibung."""


class JobPostingUpdate(BaseModel):
    """Schema zum teilweisen Aktualisieren einer Stellenausschreibung."""

    title: str | None = None
    posted_at: date | None = None
    link: HttpUrl | None = None
    company_id: int | None = None


class JobPostingRead(JobPostingBase):
    """Schema zum Auslesen einer Stellenausschreibung."""

    id: int

    model_config = {"from_attributes": True}
