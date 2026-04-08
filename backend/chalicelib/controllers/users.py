"""
Users 컨트롤러
GET   /users/me — 내 정보 조회
PATCH /users/me — 내 정보 수정 (name, phone, avatar_url)
"""
from chalice import Blueprint

from chalicelib.auth.decorators import require_auth
from chalicelib.core.db import get_session
from chalicelib.core.exceptions import AppError, NotFoundError
from chalicelib.core.helpers import fetch_one, update
from chalicelib.core.response import ok, error as err_response
from chalicelib.models.user import User

users_bp = Blueprint(__name__)

_UPDATABLE = {"name", "phone", "avatar_url"}


def _serialize(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "phone": user.phone,
        "role": user.role,
        "avatar_url": user.avatar_url,
        "created_at": str(user.created_at),
        "updated_at": str(user.updated_at),
    }


@users_bp.route("/users/me", methods=["GET"])
@require_auth
def get_me():
    user_id = users_bp.current_app.current_request.context["user"]["user_id"]
    try:
        with get_session() as session:
            user = fetch_one(session, User, id=user_id)
            return ok(_serialize(user))
    except NotFoundError as e:
        return err_response(e.error_code, e.message, status_code=404)


@users_bp.route("/users/me", methods=["PATCH"])
@require_auth
def update_me():
    request = users_bp.current_app.current_request
    user_id = request.context["user"]["user_id"]
    body = request.json_body or {}

    fields = {k: v for k, v in body.items() if k in _UPDATABLE and v is not None}
    if not fields:
        return err_response(
            "VALIDATION_ERROR",
            f"수정 가능한 필드: {', '.join(_UPDATABLE)}",
            status_code=422,
        )

    try:
        with get_session() as session:
            user = update(session, User, user_id, **fields)
            return ok(_serialize(user))
    except NotFoundError as e:
        return err_response(e.error_code, e.message, status_code=404)
    except AppError as e:
        return err_response(e.error_code, e.message, status_code=400)
