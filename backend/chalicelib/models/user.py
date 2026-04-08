from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship
from chalicelib.models.base import SoftDeleteMixin, _uuid

if TYPE_CHECKING:
    from chalicelib.models.pet import Pet
    from chalicelib.models.organization import Membership


class User(SoftDeleteMixin, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=_uuid, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    password_hash: Optional[str] = Field(default=None)
    social_key: Optional[str] = Field(default=None, unique=True, index=True)
    name: str = Field(nullable=False)
    phone: Optional[str] = Field(default=None)
    role: str = Field(nullable=False)  # B2C | B2B_HOSPITAL | B2B_INSURANCE | B2G | ADMIN
    avatar_url: Optional[str] = Field(default=None)

    # Relations
    pets: list["Pet"] = Relationship(back_populates="owner")
    memberships: list["Membership"] = Relationship(back_populates="user")
