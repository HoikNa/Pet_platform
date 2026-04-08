from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship
from chalicelib.models.base import TimestampMixin, _uuid

if TYPE_CHECKING:
    from chalicelib.models.pet import Pet


class BiometricIdentity(TimestampMixin, table=True):
    """
    반려동물 1:1 관계. Pet 삭제 시 CASCADE 삭제.
    Soft Delete 없음 — 생체 데이터는 법적 의무 보존 정책 별도 적용.
    """
    __tablename__ = "biometric_identities"

    id: str = Field(default_factory=_uuid, primary_key=True)
    pet_id: str = Field(foreign_key="pets.id", unique=True, nullable=False, index=True)
    scan_source_url: str = Field(nullable=False)   # s3://bucket/key
    feature_vector: Optional[str] = Field(default=None)  # JSON 직렬화된 특징점
    quality_score: float = Field(nullable=False)
    certified_by: Optional[str] = Field(default=None)

    pet: Optional["Pet"] = Relationship(back_populates="biometric")
