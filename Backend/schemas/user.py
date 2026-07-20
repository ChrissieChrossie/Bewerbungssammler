"""Pydantic-Schemas für Nutzer (Users)."""

from pydantic import BaseModel, EmailStr  # pylint: disable=no-name-in-module


class UserBase(BaseModel):
    """Gemeinsame Felder aller User-Schemas."""

    username: str
    name: str
    email: EmailStr


class UserCreate(UserBase):
    """Schema zum Anlegen eines Nutzers."""


class UserUpdate(BaseModel):
    """Schema zum teilweisen Aktualisieren eines Nutzers."""

    username: str | None = None
    name: str | None = None
    email: EmailStr | None = None


class UserRead(UserBase):
    """Schema zum Auslesen eines Nutzers."""

    id: int

    model_config = {"from_attributes": True}
