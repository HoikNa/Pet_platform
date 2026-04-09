"""
Auth 컨트롤러
POST /auth/login   — 소셜 토큰 검증 → JWT 발급
POST /auth/logout  — 토큰 블랙리스트 등록
"""
from chalice import Blueprint

from chalicelib.auth.decorators import require_auth
from chalicelib.core.exceptions import AppError, UnauthorizedError
from chalicelib.core.response import ok, created, error as err_response
from chalicelib.services.auth_service import blacklist_token, social_login

auth_bp = Blueprint(__name__)


@auth_bp.route("/auth/login", methods=["POST"], cors=True)
def login():
    """
    Body: { "provider": "kakao", "social_token": "<kakao_access_token>" }
    Response 201: { "token": "<jwt>", "user": {...} }
    """
    body = auth_bp.current_app.current_request.json_body or {}
    provider = body.get("provider", "kakao").strip().lower()
    social_token = (body.get("social_token") or "").strip()

    if not social_token:
        return err_response("VALIDATION_ERROR", "social_token은 필수입니다.", status_code=422)

    try:
        result = social_login(provider, social_token)
        return created(result)
    except UnauthorizedError as e:
        return err_response(e.error_code, e.message, status_code=401)
    except AppError as e:
        return err_response(e.error_code, e.message, status_code=400)


@auth_bp.route("/auth/logout", methods=["POST"], cors=True)
@require_auth
def logout():
    """
    Header: Authorization: Bearer <token>
    Response 200: { "message": "로그아웃 되었습니다." }
    """
    request = auth_bp.current_app.current_request
    auth_header = request.headers.get("authorization", "")
    token = auth_header[len("Bearer "):] if auth_header.startswith("Bearer ") else ""
    if token:
        blacklist_token(token)
    return ok({"message": "로그아웃 되었습니다."})
