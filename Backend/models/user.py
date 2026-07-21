"""Model für Nutzer (Users)."""

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    """Ein Nutzer, der Bewerbungen verwaltet."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(254), unique=True, nullable=False)

    applications = relationship("Application", back_populates="user")
