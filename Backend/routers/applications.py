from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.application import Application
from models.user import User
from models.job_posting import JobPosting
from schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationRead

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("/", response_model=list[ApplicationRead])
def get_applications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Application).offset(skip).limit(limit).all()


@router.get("/{application_id}", response_model=ApplicationRead)
def get_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return application


@router.post("/", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    if not db.query(User).filter(User.id == payload.user_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not db.query(JobPosting).filter(JobPosting.id == payload.job_posting_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job posting not found")
    application = Application(**payload.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.put("/{application_id}", response_model=ApplicationRead)
def update_application(application_id: int, payload: ApplicationUpdate, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(application, field, value)
    db.commit()
    db.refresh(application)
    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    db.delete(application)
    db.commit()
