"""
환경변수 로더 (python-dotenv 기반 싱글톤)
.env 파일 → 환경변수 → Config 속성으로 통합 접근
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# 프로젝트 루트의 .env 로드 (없으면 무시)
_env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(_env_path, override=False)


class _Config:
    # ── Database ──────────────────────────────────
    DATABASE_URL: str = os.environ["DATABASE_URL"]

    # ── JWT ───────────────────────────────────────
    JWT_SECRET_KEY: str = os.environ["JWT_SECRET_KEY"]
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7일

    # ── AWS ───────────────────────────────────────
    AWS_REGION: str = os.getenv("AWS_REGION", "ap-northeast-2")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "pet-id-uploads")
    SQS_QUEUE_URL: str = os.getenv("SQS_QUEUE_URL", "")

    # ── App ───────────────────────────────────────
    STAGE: str = os.getenv("STAGE", "dev")
    PRESIGNED_URL_EXPIRES: int = int(os.getenv("PRESIGNED_URL_EXPIRES", "3600"))


config = _Config()
