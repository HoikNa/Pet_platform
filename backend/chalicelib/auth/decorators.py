"""
권한 데코레이터
Chalice app.current_request 에서 Authorization 헤더를 파싱하여
검증된 사용자 정보를 request.context['user']에 주입.

Chalice 1.x 에는 Flask의 current_app 같은 proxy가 없다.
app.py 에서 생성된 Chalice 인스턴스를 lazy import 로 가져와 current_request에 접근.

사용법:
    @app.route('/pets', methods=['GET'])
    @require_auth
    def list_pets():
        user = app.current_request.context['user']
        ...
"""
import functools
from typing import Callable

from chalicelib.auth.blacklist import contains as _is_blacklisted
from chalicelib.auth.jwt_handler import decode_token
from chalicelib.core.db import get_session
from chalicelib.core.exceptions import NotFoundError, UnauthorizedError
from chalicelib.core.response import error as err_response


def _get_request():
    """Chalice 앱의 current_request를 lazy import로 안전하게 가져온다."""
    import app as _app_module          # noqa: PLC0415 — 순환 import 방지
    return _app_module.app.current_request


def _extract_token(request) -> str:
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise UnauthorizedError("Authorization 헤더가 없거나 형식이 잘못되었습니다.")
    return auth_header[len("Bearer "):]


def require_auth(fn: Callable) -> Callable:
    """JWT 검증 → request.context['user'] = {user_id, role} 주입."""
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        request = _get_request()
        try:
            token = _extract_token(request)
            if _is_blacklisted(token):
                return err_response("AUTH_001", "이미 로그아웃된 토큰입니다.", status_code=401)
            payload = decode_token(token)
            request.context["user"] = {
                "user_id": payload["user_id"],
                "role": payload["role"],
            }
        except UnauthorizedError as e:
            return err_response(e.error_code, e.message, status_code=401)
        return fn(*args, **kwargs)
    return wrapper


def require_role(roles: list[str]) -> Callable:
    """
    허용 역할 목록 지정. require_auth 이후 적용.

    예시:
        @require_auth
        @require_role(['ADMIN', 'B2B_HOSPITAL'])
    """
    def decorator(fn: Callable) -> Callable:
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            user = _get_request().context.get("user")
            if not user:
                return err_response("AUTH_001", "인증이 필요합니다.", status_code=401)
            if user["role"] not in roles:
                return err_response("AUTH_002", "접근 권한이 없습니다.", status_code=403)
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def require_pet_ownership(fn: Callable) -> Callable:
    """
    URL kwargs의 pet_id 로 소유자 본인 확인.
    ADMIN 은 무조건 통과. require_auth 이후 적용.
    """
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        from chalicelib.models.pet import Pet          # noqa: PLC0415
        from chalicelib.core.helpers import fetch_one  # noqa: PLC0415

        user = _get_request().context.get("user")
        if not user:
            return err_response("AUTH_001", "인증이 필요합니다.", status_code=401)

        if user["role"] == "ADMIN":
            return fn(*args, **kwargs)

        pet_id = kwargs.get("pet_id")
        if not pet_id:
            return err_response("VALIDATION_ERROR", "pet_id가 필요합니다.", status_code=400)

        try:
            with get_session() as session:
                pet = fetch_one(session, Pet, id=pet_id)
                if pet.owner_id != user["user_id"]:
                    return err_response("AUTH_002", "해당 반려동물에 대한 접근 권한이 없습니다.", status_code=403)
        except NotFoundError as e:
            return err_response(e.error_code, e.message, status_code=404)

        return fn(*args, **kwargs)
    return wrapper


def require_org_access(fn: Callable) -> Callable:
    """
    URL kwargs의 org_id 로 기관 멤버십 확인.
    ADMIN 은 무조건 통과. require_auth 이후 적용.
    """
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        from chalicelib.models.organization import Membership  # noqa: PLC0415
        from chalicelib.core.helpers import fetch_one           # noqa: PLC0415

        user = _get_request().context.get("user")
        if not user:
            return err_response("AUTH_001", "인증이 필요합니다.", status_code=401)

        if user["role"] == "ADMIN":
            return fn(*args, **kwargs)

        org_id = kwargs.get("org_id")
        if not org_id:
            return err_response("VALIDATION_ERROR", "org_id가 필요합니다.", status_code=400)

        try:
            with get_session() as session:
                fetch_one(session, Membership, org_id=org_id, user_id=user["user_id"])
        except NotFoundError:
            return err_response("AUTH_002", "해당 기관에 대한 접근 권한이 없습니다.", status_code=403)

        return fn(*args, **kwargs)
    return wrapper
