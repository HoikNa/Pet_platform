"""
DB Session 팩토리
SQLModel + SQLAlchemy 기반. with get_session() as session: 패턴으로 사용.
"""
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine
from sqlmodel import Session

from chalicelib.core.config import config

_is_sqlite = config.DATABASE_URL.startswith("sqlite")

engine = create_engine(
    config.DATABASE_URL,
    # SQLite: 멀티스레드 허용 + pool_size 미지원이므로 조건 분기
    connect_args={"check_same_thread": False} if _is_sqlite else {},
    pool_pre_ping=not _is_sqlite,
    **({} if _is_sqlite else {"pool_size": 5, "max_overflow": 10}),
    echo=(config.STAGE == "dev"),
)


@contextmanager
def get_session() -> Generator[Session, None, None]:
    """
    사용법:
        with get_session() as session:
            result = helpers.fetch(session, User, id="abc")
    """
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
