from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship
from chalicelib.models.base import TimestampMixin, _uuid

if TYPE_CHECKING:
    from chalicelib.models.pet import Pet


class RFIDToken(TimestampMixin, table=True):
    """Pet 삭제 시 CASCADE 삭제."""
    __tablename__ = "rfid_tokens"

    id: str = Field(default_factory=_uuid, primary_key=True)
    pet_id: str = Field(foreign_key="pets.id", nullable=False, index=True)
    serial: str = Field(unique=True, nullable=False)
    issued_at: str = Field(nullable=False)
    expires_at: str = Field(nullable=False)
    status: str = Field(default="ACTIVE")  # ACTIVE | REVOKED

    pet: Optional["Pet"] = Relationship(back_populates="rfid_tokens")
