"""JWT 발급 / 검증."""
from datetime import datetime, timedelta, timezone

import jwt

from chalicelib.core.config import config
from chalicelib.core.exceptions import UnauthorizedError


def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=config.JWT_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, config.JWT_SECRET_KEY, algorithm=config.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, config.JWT_SECRET_KEY, algorithms=[config.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("토큰이 만료되었습니다.")
    except jwt.InvalidTokenError:
        raise UnauthorizedError("유효하지 않은 토큰입니다.")
