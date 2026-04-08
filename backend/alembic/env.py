"""
Alembic 마이그레이션 환경 설정
- DATABASE_URL은 .env에서 로드 (python-dotenv)
- target_metadata: SQLModel의 모든 모델 메타데이터 자동 감지
- autogenerate: alembic revision --autogenerate 지원
"""
import sys
import os
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import engine_from_config, pool
from sqlmodel import SQLModel

from alembic import context

# backend/ 디렉토리를 sys.path에 추가 (chalicelib import 가능하게)
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# .env 로드 + config 싱글톤 초기화
from chalicelib.core.config import config as app_config  # noqa: E402

# 모든 모델 import — autogenerate가 테이블을 감지하기 위해 반드시 필요
import chalicelib.models  # noqa: F401, E402

alembic_config = context.config

if alembic_config.config_file_name is not None:
    fileConfig(alembic_config.config_file_name)

# DATABASE_URL을 alembic.ini의 sqlalchemy.url 대신 .env에서 주입
alembic_config.set_main_option("sqlalchemy.url", app_config.DATABASE_URL)

target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    url = alembic_config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        alembic_config.get_section(alembic_config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,  # 컬럼 타입 변경도 감지
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
