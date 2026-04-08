"""
High-level DB Helpers — Django QuerySet 스타일
모든 조회는 is_deleted=False 기본 필터 내장.
직접 SQLAlchemy 쿼리 작성 대신 이 헬퍼를 사용할 것.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional, Type, TypeVar

from sqlalchemy import asc, desc, func
from sqlmodel import SQLModel, Session, select

from chalicelib.core.exceptions import NotFoundError, ConflictError

T = TypeVar("T", bound=SQLModel)

_SORT_PREFIX_DESC = "-"


def _apply_soft_delete_filter(model: Type[T], stmt):
    """is_deleted 컬럼이 있는 모델에만 자동 필터 적용."""
    if hasattr(model, "is_deleted"):
        stmt = stmt.where(model.is_deleted == False)  # noqa: E712
    return stmt


def _apply_filters(model: Type[T], stmt, **kwargs):
    for key, value in kwargs.items():
        col = getattr(model, key, None)
        if col is None:
            raise AttributeError(f"{model.__name__} has no column '{key}'")
        stmt = stmt.where(col == value)
    return stmt


def _apply_sort(model: Type[T], stmt, sort: Optional[str]):
    """
    sort="created_at"     → ASC
    sort="-created_at"    → DESC
    sort="-created_at,name" → 복수 컬럼
    """
    if not sort:
        return stmt
    for field in sort.split(","):
        field = field.strip()
        direction = desc if field.startswith(_SORT_PREFIX_DESC) else asc
        col_name = field.lstrip(_SORT_PREFIX_DESC)
        col = getattr(model, col_name, None)
        if col is not None:
            stmt = stmt.order_by(direction(col))
    return stmt


# ─────────────────────────────────────────────────────────────
# 단일 조회
# ─────────────────────────────────────────────────────────────

def fetch_one(
    session: Session,
    model: Type[T],
    raise_404: bool = True,
    **kwargs,
) -> Optional[T]:
    """
    단일 Row 조회. raise_404=True 이면 없을 때 NotFoundError 발생.

    예시:
        user = fetch_one(session, User, id="abc-uuid")
        pet  = fetch_one(session, Pet, owner_id=user_id, id=pet_id)
    """
    stmt = select(model)
    stmt = _apply_soft_delete_filter(model, stmt)
    stmt = _apply_filters(model, stmt, **kwargs)
    result = session.exec(stmt).first()
    if result is None and raise_404:
        raise NotFoundError(f"{model.__name__} not found")
    return result


# ─────────────────────────────────────────────────────────────
# 목록 조회 (페이지네이션)
# ─────────────────────────────────────────────────────────────

def fetch_many(
    session: Session,
    model: Type[T],
    *,
    page: int = 1,
    limit: int = 20,
    sort: Optional[str] = "-created_at",
    **kwargs,
) -> dict:
    """
    페이지네이션 + 정렬 + 필터 통합 조회.
    반환: {"data": [...], "meta": {page, limit, total_count, total_pages}}

    예시:
        result = fetch_many(session, Pet, page=1, limit=10, sort="-created_at", owner_id=uid)
        pets   = result["data"]
        meta   = result["meta"]
    """
    base_stmt = select(model)
    base_stmt = _apply_soft_delete_filter(model, base_stmt)
    base_stmt = _apply_filters(model, base_stmt, **kwargs)

    # 총 건수
    count_stmt = select(func.count()).select_from(base_stmt.subquery())
    total_count = session.exec(count_stmt).one()

    # 페이지네이션 + 정렬
    data_stmt = _apply_sort(model, base_stmt, sort)
    data_stmt = data_stmt.offset((page - 1) * limit).limit(limit)
    rows = session.exec(data_stmt).all()

    total_pages = max(1, (total_count + limit - 1) // limit)

    return {
        "data": rows,
        "meta": {
            "page": page,
            "limit": limit,
            "total_count": total_count,
            "total_pages": total_pages,
        },
    }


# ─────────────────────────────────────────────────────────────
# 삽입
# ─────────────────────────────────────────────────────────────

def insert(session: Session, instance: T) -> T:
    """
    인스턴스를 DB에 삽입하고 refresh 후 반환.

    예시:
        pet = insert(session, Pet(owner_id=uid, name="뭉치", ...))
    """
    session.add(instance)
    session.flush()
    session.refresh(instance)
    return instance


# ─────────────────────────────────────────────────────────────
# 수정
# ─────────────────────────────────────────────────────────────

def update(
    session: Session,
    model: Type[T],
    row_id: str,
    **kwargs,
) -> T:
    """
    id 기준 row 수정. updated_at 자동 갱신.

    예시:
        pet = update(session, Pet, pet_id, name="새이름", weight=3.5)
    """
    row = fetch_one(session, model, id=row_id)
    for key, value in kwargs.items():
        if hasattr(row, key):
            setattr(row, key, value)
    if hasattr(row, "updated_at"):
        row.updated_at = datetime.now(timezone.utc)
    session.add(row)
    session.flush()
    session.refresh(row)
    return row


# ─────────────────────────────────────────────────────────────
# Soft Delete
# ─────────────────────────────────────────────────────────────

def soft_delete(session: Session, model: Type[T], row_id: str) -> None:
    """
    is_deleted=True + deleted_at 설정. Soft Delete 모델 전용.

    예시:
        soft_delete(session, MedicalVisit, visit_id)
    """
    if not hasattr(model, "is_deleted"):
        raise AttributeError(f"{model.__name__} does not support soft delete")
    row = fetch_one(session, model, id=row_id)
    row.is_deleted = True
    row.deleted_at = datetime.now(timezone.utc)
    session.add(row)
    session.flush()


# ─────────────────────────────────────────────────────────────
# 존재 확인
# ─────────────────────────────────────────────────────────────

def exists(session: Session, model: Type[T], **kwargs) -> bool:
    """
    예시:
        if exists(session, User, email="test@test.com"):
            raise ConflictError("이미 사용 중인 이메일입니다")
    """
    stmt = select(func.count()).select_from(select(model).subquery())
    stmt = _apply_soft_delete_filter(model, select(model))
    stmt = _apply_filters(model, stmt, **kwargs)
    count_stmt = select(func.count()).select_from(stmt.subquery())
    return session.exec(count_stmt).one() > 0


# ─────────────────────────────────────────────────────────────
# Join 조회 (간단한 케이스)
# ─────────────────────────────────────────────────────────────

def fetch_with_join(
    session: Session,
    model: Type[T],
    join_model: Type,
    on_condition,
    *,
    sort: Optional[str] = "-created_at",
    page: int = 1,
    limit: int = 20,
    **kwargs,
) -> dict:
    """
    단순 JOIN + 페이지네이션.

    예시:
        result = fetch_with_join(
            session, Pet, User,
            Pet.owner_id == User.id,
            sort="-created_at",
            page=1, limit=20,
        )
    """
    base_stmt = select(model).join(join_model, on_condition)
    base_stmt = _apply_soft_delete_filter(model, base_stmt)
    base_stmt = _apply_filters(model, base_stmt, **kwargs)

    count_stmt = select(func.count()).select_from(base_stmt.subquery())
    total_count = session.exec(count_stmt).one()

    data_stmt = _apply_sort(model, base_stmt, sort)
    data_stmt = data_stmt.offset((page - 1) * limit).limit(limit)
    rows = session.exec(data_stmt).all()

    total_pages = max(1, (total_count + limit - 1) // limit)
    return {
        "data": rows,
        "meta": {"page": page, "limit": limit, "total_count": total_count, "total_pages": total_pages},
    }
