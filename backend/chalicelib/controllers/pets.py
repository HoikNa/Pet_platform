"""
Pets 컨트롤러
GET   /pets             — 내 반려동물 목록 (페이지네이션)
POST  /pets             — 신규 반려동물 등록
GET   /pets/{pet_id}    — 상세 조회
PATCH /pets/{pet_id}    — 기본 정보 수정
"""
from chalice import Blueprint

from chalicelib.auth.decorators import require_auth, require_pet_ownership
from chalicelib.core.db import get_session
from chalicelib.core.exceptions import AppError, NotFoundError, ValidationError
from chalicelib.core.helpers import fetch_many, fetch_one, insert, update
from chalicelib.core.response import created, ok, error as err_response
from chalicelib.models.pet import Pet

pets_bp = Blueprint(__name__)

_REQUIRED_CREATE = {"name", "species", "breed", "birth_date", "gender"}
_UPDATABLE = {"name", "birth_date", "weight", "profile_image_url"}


def _serialize(pet: Pet) -> dict:
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
        "updated_at": str(pet.updated_at),
    }


@pets_bp.route("/pets", methods=["GET"])
@require_auth
def list_pets():
    """
    Query: ?page=1&limit=20&sort=-created_at&filter[registration_status]=PENDING
    B2C: 본인 소유 펫만. ADMIN: 전체.
    """
    request = pets_bp.current_app.current_request
    user = request.context["user"]
    params = request.query_params or {}

    page = max(1, int(params.get("page", 1)))
    limit = min(100, max(1, int(params.get("limit", 20))))
    sort = params.get("sort", "-created_at")

    # filter[status]=ACTIVE 형태 파싱
    filters: dict = {}
    for key, val in params.items():
        if key.startswith("filter[") and key.endswith("]"):
            col = key[7:-1]
            filters[col] = val

    # B2C 는 본인 펫만
    if user["role"] not in {"ADMIN"}:
        filters["owner_id"] = user["user_id"]

    with get_session() as session:
        result = fetch_many(session, Pet, page=page, limit=limit, sort=sort, **filters)
        return ok(
            [_serialize(p) for p in result["data"]],
            meta=result["meta"],
        )


@pets_bp.route("/pets", methods=["POST"])
@require_auth
def create_pet():
    """
    Body: { name, species, breed, birth_date, gender, is_neutered?, weight? }
    Response 201: pet object
    """
    request = pets_bp.current_app.current_request
    user = request.context["user"]
    body = request.json_body or {}

    missing = _REQUIRED_CREATE - set(body.keys())
    if missing:
        return err_response(
            "VALIDATION_ERROR",
            f"필수 필드가 누락되었습니다: {', '.join(sorted(missing))}",
            status_code=422,
        )

    try:
        with get_session() as session:
            pet = insert(
                session,
                Pet(
                    owner_id=user["user_id"],
                    name=body["name"],
                    species=body["species"],
                    breed=body["breed"],
                    birth_date=body["birth_date"],
                    gender=body["gender"],
                    is_neutered=bool(body.get("is_neutered", False)),
                    weight=body.get("weight"),
                    registration_status="PENDING",
                ),
            )
            return created(_serialize(pet))
    except AppError as e:
        return err_response(e.error_code, e.message, status_code=400)


@pets_bp.route("/pets/{pet_id}", methods=["GET"])
@require_auth
@require_pet_ownership
def get_pet(pet_id):
    try:
        with get_session() as session:
            pet = fetch_one(session, Pet, id=pet_id)
            return ok(_serialize(pet))
    except NotFoundError as e:
        return err_response(e.error_code, e.message, status_code=404)


@pets_bp.route("/pets/{pet_id}", methods=["PATCH"])
@require_auth
@require_pet_ownership
def update_pet(pet_id):
    """수정 허용 필드: name, birth_date, weight, profile_image_url"""
    body = pets_bp.current_app.current_request.json_body or {}
    fields = {k: v for k, v in body.items() if k in _UPDATABLE and v is not None}

    if not fields:
        return err_response(
            "VALIDATION_ERROR",
            f"수정 가능한 필드: {', '.join(_UPDATABLE)}",
            status_code=422,
        )

    try:
        with get_session() as session:
            pet = update(session, Pet, pet_id, **fields)
            return ok(_serialize(pet))
    except NotFoundError as e:
        return err_response(e.error_code, e.message, status_code=404)
    except AppError as e:
        return err_response(e.error_code, e.message, status_code=400)
