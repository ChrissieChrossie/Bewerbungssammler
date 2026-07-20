from datetime import date
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from models.application import ApplicationStatus


class ApplicationBase(BaseModel):
    user_id: int
    job_posting_id: int
    status: ApplicationStatus = ApplicationStatus.open
    applied_at: date
    note: str | None = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus | None = None
    applied_at: date | None = None
    note: str | None = None


class ApplicationRead(ApplicationBase):
    id: int

    model_config = {"from_attributes": True}
