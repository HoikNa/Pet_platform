"""
토큰 블랙리스트 — 모듈 레벨 싱글톤 set.
decorators.py 와 auth_service.py 양쪽에서 순환 import 없이 참조할 수 있도록 분리.

운영 환경에서는 이 모듈을 Redis 클라이언트로 교체하거나
ElastiCache TTL 기반 blacklist로 업그레이드할 것.
"""

_blacklist: set[str] = set()


def add(token: str) -> None:
    """토큰을 블랙리스트에 추가 (로그아웃 시 호출)."""
    _blacklist.add(token)


def contains(token: str) -> bool:
    """토큰이 블랙리스트에 있으면 True."""
    return token in _blacklist
