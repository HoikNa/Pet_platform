"""
Admin / B2B 컨트롤러
GET /organizations/{org_id}/pets — 소속 기관 환축 목록 (페이징/필터 필수)

접근 가능 역할: B2B_HOSPITAL, B2B_INSURANCE, B2G, ADMIN
기관 소속 여부는 require_org_access 데코레이터로 검증.

쿼리 로직:
  Membership.org_id == org_id 에 속한 user_id 들을 서브쿼리로 가져온 후
  Pet.owner_id IN (subquery) 로 환축 목록 반환.
"""
from chalice import Blueprint
from sqlalchemy import select
from sqlmodel import Session

from chalicelib.auth.decorators import require_auth, require_org_access, require_role
from chalicelib.core.db import get_session
from chalicelib.core.exceptions import NotFoundError
from chalicelib.core.response import ok, error as err_response
from chalicelib.models.organization import Membership
from chalicelib.models.pet import Pet

admin_bp = Blueprint(__name__)

_B2B_ROLES = ["B2B_HOSPITAL", "B2B_INSURANCE", "B2G", "ADMIN"]


def _serialize_pet(pet: Pet) -> dict:
    return {
        "id": pet.id,
        "owner_id": pet.owner_id,
        "name": pet.name,
        "species": pet.species,
        "breed": pet.breed,
        "birth_date": pet.birth_date,
        "gender": pet.gender,
        "is_neutered": pet.is_neutered,
        "registration_status": pet.registration_status,
        "weight": pet.weight,
        "profile_image_url": pet.profile_image_url,
        "created_at": str(pet.created_at),
    }


@admin_bp.route("/organizations/{org_id}/pets", methods=["GET"], cors=True)
@require_auth
@require_role(_B2B_ROLES)
@require_org_access
def list_org_pets(org_id):
    """
    Query: ?page=1&limit=20&sort=-created_at&filter[registration_status]=VERIFIED
    Response: 소속 기관 환축 목록
    """
    request = admin_bp.current_app.current_request
    params = request.query_params or {}

    page = max(1, int(params.get("page", 1)))
    limit = min(100, max(1, int(params.get("limit", 20))))
    sort = params.get("sort", "-created_at")

    # filter[col]=val 파싱
    extra_filters: dict = {}
    for key, val in params.items():
        if key.startswith("filter[") and key.endswith("]"):
            extra_filters[key[7:-1]] = val

    with get_session() as session:
        data, meta = _fetch_org_pets(session, org_id, page, limit, sort, **extra_filters)
        return ok([_serialize_pet(p) for p in data], meta=meta)


def _fetch_org_pets(
    session: Session,
    org_id: str,
    page: int,
    limit: int,
    sort: str,
    **filters,
) -> tuple[list[Pet], dict]:
    """
    org_id에 소속된 멤버들이 소유한 Pet 목록을 반환.
    Membership.user_id 서브쿼리 → Pet.owner_id IN 방식.
    """
    from sqlalchemy import asc, desc, func

    # 서브쿼리: org 소속 user_id 목록
    member_subq = (
        select(Membership.user_id)
        .where(Membership.org_id == org_id)
        .subquery()
    )

    # 기본 쿼리
    base = (
        select(Pet)
        .where(Pet.is_deleted == False)  # noqa: E712
        .where(Pet.owner_id.in_(select(member_subq)))
    )

    # 추가 필터 적용
    for col_name, val in filters.items():
        col = getattr(Pet, col_name, None)
        if col is not None:
            base = base.where(col == val)

    # 총 건수
    from sqlalchemy import select as sa_select
    total_count = session.exec(
        sa_select(func.count()).select_from(base.subquery())
    ).one()

    # 정렬
    for field in sort.split(","):
        field = field.strip()
        direction = desc if field.startswith("-") else asc
        col_name = field.lstrip("-")
        col = getattr(Pet, col_name, None)
        if col is not None:
            base = base.order_by(direction(col))

    # 페이지네이션
    base = base.offset((page - 1) * limit).limit(limit)
    rows = session.exec(base).all()

    total_pages = max(1, (total_count + limit - 1) // limit)
    meta = {"page": page, "limit": limit, "total_count": total_count, "total_pages": total_pages}
    return list(rows), meta
