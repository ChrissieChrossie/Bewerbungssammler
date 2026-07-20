from pydantic import BaseModel, HttpUrl  # pylint: disable=no-name-in-module


class CompanyBase(BaseModel):
    name: str
    homepage: HttpUrl | None = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: str | None = None
    homepage: HttpUrl | None = None


class CompanyRead(CompanyBase):
    id: int

    model_config = {"from_attributes": True}
