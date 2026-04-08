"""
소셜 로그인 서비스 — Kakao 토큰 검증 → User upsert → JWT 발급
토큰 블랙리스트는 모듈 레벨 set으로 관리 (Lambda 재기동 시 초기화 — 운영 환경은 Redis로 교체).
"""
import json
import urllib.request
from urllib.error import URLError

from chalicelib.auth.blacklist import add as _blacklist_add
from chalicelib.auth.blacklist import contains as _blacklist_contains
from chalicelib.auth.jwt_handler import create_token
from chalicelib.core.db import get_session
from chalicelib.core.exceptions import UnauthorizedError
from chalicelib.core.helpers import fetch_one, insert
from chalicelib.models.user import User

_KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me"


# ─────────────────────────────────────────────────────────────
# 소셜 로그인
# ─────────────────────────────────────────────────────────────

def social_login(provider: str, social_token: str) -> dict:
    """
    소셜 토큰 검증 → User upsert → JWT 반환.
    반환: {"token": "<jwt>", "user": {...}}
    """
    if provider == "kakao":
        raw = _verify_kakao(social_token)
    else:
        raise UnauthorizedError(f"지원하지 않는 소셜 로그인 provider: {provider}")

    social_key = f"{provider}:{raw['id']}"
    kakao_account = raw.get("kakao_account", {})
    properties = raw.get("properties", {})
    email = kakao_account.get("email") or f"{social_key}@noemail.local"
    name = properties.get("nickname") or "Unknown"
    avatar_url = properties.get("profile_image")

    with get_session() as session:
        user = fetch_one(session, User, raise_404=False, social_key=social_key)
        if user is None:
            user = insert(
                session,
                User(
                    email=email,
                    social_key=social_key,
                    name=name,
                    avatar_url=avatar_url,
                    role="B2C",
                ),
            )
        token = create_token(user.id, user.role)

    return {"token": token, "user": _serialize(user)}


def _verify_kakao(social_token: str) -> dict:
    req = urllib.request.Request(
        _KAKAO_USER_INFO_URL,
        headers={"Authorization": f"Bearer {social_token}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status != 200:
                raise UnauthorizedError("카카오 토큰 검증에 실패했습니다.")
            return json.loads(resp.read().decode())
    except URLError as e:
        raise UnauthorizedError(f"카카오 API 호출 오류: {e}") from e


# ─────────────────────────────────────────────────────────────
# 토큰 블랙리스트 (chalicelib/auth/blacklist.py 위임)
# ─────────────────────────────────────────────────────────────

def blacklist_token(token: str) -> None:
    _blacklist_add(token)


def is_blacklisted(token: str) -> bool:
    return _blacklist_contains(token)


# ─────────────────────────────────────────────────────────────
# 직렬화
# ─────────────────────────────────────────────────────────────

def _serialize(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "phone": user.phone,
        "role": user.role,
        "avatar_url": user.avatar_url,
        "created_at": str(user.created_at),
    }
