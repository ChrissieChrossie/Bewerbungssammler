from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    username: str
    name: str
    email: EmailStr


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    username: str | None = None
    name: str | None = None
    email: EmailStr | None = None


class UserRead(UserBase):
    id: int

    model_config = {"from_attributes": True}
