from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship
from chalicelib.models.base import TimestampMixin, _uuid

if TYPE_CHECKING:
    from chalicelib.models.user import User


class Organization(TimestampMixin, table=True):
    __tablename__ = "organizations"

    id: str = Field(default_factory=_uuid, primary_key=True)
    name: str = Field(nullable=False)
    org_type: str = Field(nullable=False)  # HOSPITAL | INSURANCE | GOVERNMENT
    contact: Optional[str] = Field(default=None)
    address: Optional[str] = Field(default=None)

    memberships: list["Membership"] = Relationship(
        back_populates="organization",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class Membership(TimestampMixin, table=True):
    __tablename__ = "memberships"

    id: str = Field(default_factory=_uuid, primary_key=True)
    org_id: str = Field(foreign_key="organizations.id", nullable=False, index=True)
    user_id: str = Field(foreign_key="users.id", nullable=False, index=True)
    role: str = Field(default="MEMBER")  # OWNER | ADMIN | MEMBER

    organization: Optional["Organization"] = Relationship(back_populates="memberships")
    user: Optional["User"] = Relationship(back_populates="memberships")
