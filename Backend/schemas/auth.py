"""Pydantic-Schemas für Registrierung, Login und Passwort-Änderung."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator, model_validator  # pylint: disable=no-name-in-module

MIN_PASSWORD_LENGTH = 8

# Kleine Sperrliste offensichtlich schwacher Passwörter. Ersetzt keine vollständige
# Passwort-Richtlinie, verhindert aber die naheliegendsten Fälle.
COMMON_PASSWORDS = {
    "password", "password1", "passwort", "passwort1", "12345678", "123456789",
    "1234567890", "qwertyui", "qwertzui", "letmein", "welcome1", "admin1234",
    "iloveyou", "monkey123", "abc12345", "00000000", "11111111",
}


def _validate_password_strength(password: str) -> str:
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Das Passwort muss mindestens {MIN_PASSWORD_LENGTH} Zeichen lang sein.")
    if password.lower() in COMMON_PASSWORDS:
        raise ValueError("Dieses Passwort ist zu leicht zu erraten. Bitte wähle ein sichereres Passwort.")
    return password


class RegisterRequest(BaseModel):
    """Eingabedaten für POST /api/auth/register."""

    name: str
    email: EmailStr
    password: str
    password_confirm: str

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Der Name darf nicht leer sein.")
        return value

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        return _validate_password_strength(value)

    @model_validator(mode="after")
    def passwords_match(self) -> "RegisterRequest":
        if self.password != self.password_confirm:
            raise ValueError("Passwort und Passwort-Wiederholung stimmen nicht überein.")
        return self


class LoginRequest(BaseModel):
    """Eingabedaten für POST /api/auth/login."""

    email: EmailStr
    password: str
    remember_me: bool = False


class ChangePasswordRequest(BaseModel):
    """Eingabedaten für POST /api/auth/change-password."""

    current_password: str
    new_password: str
    new_password_confirm: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        return _validate_password_strength(value)

    @model_validator(mode="after")
    def passwords_match_and_differ(self) -> "ChangePasswordRequest":
        if self.new_password != self.new_password_confirm:
            raise ValueError("Neues Passwort und Wiederholung stimmen nicht überein.")
        if self.new_password == self.current_password:
            raise ValueError("Das neue Passwort darf nicht mit dem aktuellen übereinstimmen.")
        return self


class UserPublic(BaseModel):
    """Öffentlich sichtbare User-Daten – enthält niemals den Passwort-Hash."""

    id: int
    name: str
    email: EmailStr
    created_at: datetime
    last_login_at: datetime | None = None

    model_config = {"from_attributes": True}
