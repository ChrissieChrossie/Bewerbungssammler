from datetime import date
from pydantic import BaseModel, HttpUrl  # pylint: disable=no-name-in-module


class JobPostingBase(BaseModel):
    title: str
    posted_at: date | None = None
    link: HttpUrl | None = None
    company_id: int


class JobPostingCreate(JobPostingBase):
    pass


class JobPostingUpdate(BaseModel):
    title: str | None = None
    posted_at: date | None = None
    link: HttpUrl | None = None
    company_id: int | None = None


class JobPostingRead(JobPostingBase):
    id: int

    model_config = {"from_attributes": True}
