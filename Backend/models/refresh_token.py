"""Model für Refresh-Tokens (serverseitig widerrufbare Sessions für JWT-Auth)."""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from database import Base


class RefreshToken(Base):
    """Ein ausgestellter Refresh-Token. Gespeichert wird nur der Hash, nie der Klartext-Token."""

    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    # Ob die Session dauerhaft (Cookie mit Ablaufdatum) oder nur für die Browser-Sitzung gilt.
    remember_me = Column(Boolean, nullable=False, default=False, server_default="false")

    user = relationship("User", back_populates="refresh_tokens")
