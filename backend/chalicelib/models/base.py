"""
공통 베이스 모델 — 모든 테이블이 상속
UUID PK, 생성/수정/삭제 타임스탬프, Soft Delete 포함
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


class TimestampMixin(SQLModel):
    created_at: datetime = Field(default_factory=_now, nullable=False)
    updated_at: datetime = Field(default_factory=_now, nullable=False)


class SoftDeleteMixin(TimestampMixin):
    is_deleted: bool = Field(default=False, nullable=False, index=True)
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)
