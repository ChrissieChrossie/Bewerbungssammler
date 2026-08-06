"""Pydantic-Schemas (DTOs) des Backends."""

from .user import UserUpdate, UserRead
from .company import CompanyCreate, CompanyUpdate, CompanyRead
from .job_posting import JobPostingCreate, JobPostingUpdate, JobPostingRead
from .application import ApplicationCreate, ApplicationUpdate, ApplicationRead
