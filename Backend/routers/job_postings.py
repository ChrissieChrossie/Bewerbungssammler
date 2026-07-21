"""API-Endpunkte für Stellenausschreibungen (Job Postings)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.job_posting import JobPosting
from models.company import Company
from schemas.job_posting import JobPostingCreate, JobPostingUpdate, JobPostingRead

router = APIRouter(prefix="/job-postings", tags=["Job Postings"])


@router.get("/", response_model=list[JobPostingRead])
def get_job_postings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Listet Stellenausschreibungen mit Pagination."""
    return db.query(JobPosting).offset(skip).limit(limit).all()


@router.get("/{job_posting_id}", response_model=JobPostingRead)
def get_job_posting(job_posting_id: int, db: Session = Depends(get_db)):
    """Liefert eine einzelne Stellenausschreibung anhand ihrer ID."""
    job_posting = db.query(JobPosting).filter(JobPosting.id == job_posting_id).first()
    if not job_posting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found")
    return job_posting


@router.post("/", response_model=JobPostingRead, status_code=status.HTTP_201_CREATED)
def create_job_posting(payload: JobPostingCreate, db: Session = Depends(get_db)):
    """Legt eine neue Stellenausschreibung an."""
    if not db.query(Company).filter(Company.id == payload.company_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    job_posting = JobPosting(**payload.model_dump())
    db.add(job_posting)
    db.commit()
    db.refresh(job_posting)
    return job_posting


@router.put("/{job_posting_id}", response_model=JobPostingRead)
def update_job_posting(
    job_posting_id: int, payload: JobPostingUpdate, db: Session = Depends(get_db)
):
    """Aktualisiert eine Stellenausschreibung teilweise."""
    job_posting = db.query(JobPosting).filter(JobPosting.id == job_posting_id).first()
    if not job_posting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found")
    if payload.company_id and not db.query(Company).filter(
        Company.id == payload.company_id
    ).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(job_posting, field, value)
    db.commit()
    db.refresh(job_posting)
    return job_posting


@router.delete("/{job_posting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_posting(job_posting_id: int, db: Session = Depends(get_db)):
    """Löscht eine Stellenausschreibung."""
    job_posting = db.query(JobPosting).filter(JobPosting.id == job_posting_id).first()
    if not job_posting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found")
    db.delete(job_posting)
    db.commit()
