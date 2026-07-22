"""Pydantic-Schemas für Unternehmen (Companies)."""

from pydantic import BaseModel, HttpUrl  # pylint: disable=no-name-in-module


class CompanyBase(BaseModel):
    """Gemeinsame Felder aller Company-Schemas."""

    name: str
    homepage: HttpUrl | None = None


class CompanyCreate(CompanyBase):
    """Schema zum Anlegen eines Unternehmens."""


class CompanyUpdate(BaseModel):
    """Schema zum teilweisen Aktualisieren eines Unternehmens."""

    name: str | None = None
    homepage: HttpUrl | None = None


class CompanyRead(CompanyBase):
    """Schema zum Auslesen eines Unternehmens."""

    id: int

    model_config = {"from_attributes": True}
