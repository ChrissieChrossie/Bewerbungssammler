"""Model für Bewerbungen (Applications) und deren Status."""

import enum
from sqlalchemy import Column, Integer, Date, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base


class ApplicationStatus(str, enum.Enum):
    """Mögliche Stati einer Bewerbung."""

    OPEN = "open"
    IN_PROGRESS = "in_progress"
    INVITED = "invited"
    REJECTED = "rejected"
    ACCEPTED = "accepted"


class Application(Base):
    """Eine Bewerbung eines Users auf eine Stellenausschreibung."""

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id"), nullable=False)
    status = Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.OPEN)
    applied_at = Column(Date, nullable=False)
    note = Column(Text, nullable=True)

    user = relationship("User", back_populates="applications")
    job_posting = relationship("JobPosting", back_populates="applications")
