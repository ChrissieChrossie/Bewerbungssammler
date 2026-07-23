"""Model für Stellenausschreibungen (Job Postings)."""

from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class JobPosting(Base):
    """Eine Stellenausschreibung eines Unternehmens."""

    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    posted_at = Column(Date, nullable=True)
    link = Column(String(500), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)

    company = relationship("Company", back_populates="job_postings")
    applications = relationship("Application", back_populates="job_posting")
