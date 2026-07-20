from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    homepage = Column(String(500), nullable=True)

    job_postings = relationship("JobPosting", back_populates="company")
