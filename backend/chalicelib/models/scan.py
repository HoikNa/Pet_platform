from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship
from chalicelib.models.base import TimestampMixin, _uuid

if TYPE_CHECKING:
    from chalicelib.models.pet import Pet


class HealthScan(TimestampMixin, table=True):
    """
    Pet 삭제 시 CASCADE 삭제.
    비식별화 보존이 필요한 경우 서비스 레이어에서 owner_id null처리 후 보존.
    """
    __tablename__ = "health_scans"

    id: str = Field(default_factory=_uuid, primary_key=True)
    pet_id: str = Field(foreign_key="pets.id", nullable=False, index=True)
    scan_date: str = Field(nullable=False, index=True)   # ISO datetime string
    bcs_score: Optional[int] = Field(default=None)       # 1~9
    gait_score: Optional[float] = Field(default=None)
    eye_clarity_score: Optional[float] = Field(default=None)
    voice_emotion_score: Optional[float] = Field(default=None)
    ai_comment: Optional[str] = Field(default=None)
    attachment_urls: Optional[str] = Field(default=None)  # JSON array string
    scan_types: Optional[str] = Field(default=None)        # JSON array string
    job_status: str = Field(default="PENDING")             # PENDING | PROCESSING | DONE | FAILED

    pet: Optional["Pet"] = Relationship(back_populates="health_scans")
