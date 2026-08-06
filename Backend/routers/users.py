"""API-Endpunkte für Nutzer (Users). Jeder Nutzer sieht/verwaltet nur den eigenen Account.

Das Anlegen neuer Nutzer läuft ausschließlich über POST /api/auth/register (Passwort-Hashing,
Username-Ableitung etc.) -- hier gibt es bewusst keinen weiteren, ungesicherten Create-Endpoint.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models.user import User
from schemas.user import UserUpdate, UserRead

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=list[UserRead])
def get_users(current_user: User = Depends(get_current_user)):
    """Liefert den eigenen Nutzer. Kein Zugriff auf andere Accounts."""
    return [current_user]


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, current_user: User = Depends(get_current_user)):
    """Liefert den eigenen Nutzer-Datensatz. Andere User-IDs -> 404."""
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return current_user


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aktualisiert den eigenen Nutzer-Datensatz teilweise. Andere User-IDs -> 404."""
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Löscht den eigenen Account. Andere User-IDs -> 404."""
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(current_user)
    db.commit()
