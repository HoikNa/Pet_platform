"""
S3 Presigned URL 발급 서비스
파일은 Lambda를 거치지 않고 클라이언트 → S3 직접 PUT 업로드.
"""
import uuid

import boto3
from botocore.exceptions import ClientError

from chalicelib.core.config import config
from chalicelib.core.exceptions import AppError

# purpose → 허용 Content-Type 매핑
_ALLOWED_TYPES: dict[str, list[str]] = {
    "biometric": ["image/jpeg", "image/png", "image/webp"],
    "health_scan": ["video/mp4", "video/webm", "video/ogg"],
    "voice_emotion": ["audio/webm", "audio/ogg", "audio/mpeg", "audio/wav"],
}

_s3_client = None


def _get_s3():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client("s3", region_name=config.AWS_REGION)
    return _s3_client


def generate_presigned_url(
    filename: str,
    file_type: str,
    purpose: str,
    user_id: str,
) -> dict:
    """
    S3 Presigned PUT URL 발급.

    반환:
        {
            "upload_url": "https://s3.amazonaws.com/...",
            "s3_key": "biometric/user_id/uuid_filename.jpg",
            "expires_in": 3600,
        }

    사용 흐름:
        1. 클라이언트 → POST /media/presigned-url → 이 함수 호출
        2. 클라이언트 → PUT upload_url (Content-Type: file_type)
        3. 클라이언트 → POST /pets/{id}/biometrics (s3_key 전달)
    """
    allowed = _ALLOWED_TYPES.get(purpose)
    if allowed is None:
        raise AppError(f"지원하지 않는 purpose입니다: {purpose}")
    if file_type not in allowed:
        raise AppError(f"'{purpose}'에 허용되지 않는 파일 타입입니다: {file_type}")

    ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
    s3_key = f"{purpose}/{user_id}/{uuid.uuid4()}.{ext}"

    try:
        upload_url = _get_s3().generate_presigned_url(
            "put_object",
            Params={
                "Bucket": config.S3_BUCKET_NAME,
                "Key": s3_key,
                "ContentType": file_type,
            },
            ExpiresIn=config.PRESIGNED_URL_EXPIRES,
        )
    except ClientError as e:
        raise AppError(f"Presigned URL 발급 실패: {e}") from e

    return {
        "upload_url": upload_url,
        "s3_key": s3_key,
        "expires_in": config.PRESIGNED_URL_EXPIRES,
    }


def build_s3_uri(s3_key: str) -> str:
    """s3_key → s3://bucket/key 형식 URI 변환."""
    return f"s3://{config.S3_BUCKET_NAME}/{s3_key}"


def delete_object(s3_key: str) -> None:
    """S3 오브젝트 삭제 (레코드 삭제 시 연동)."""
    try:
        _get_s3().delete_object(Bucket=config.S3_BUCKET_NAME, Key=s3_key)
    except ClientError:
        pass  # 삭제 실패는 로깅만. 정합성 에러로 처리하지 않음.
