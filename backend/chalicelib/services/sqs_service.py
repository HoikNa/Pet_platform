"""
SQS 비동기 작업 Push 서비스
Biometric AI 검증 및 Health Scan AI 분석 요청을 SQS 큐로 전달.
"""
import json

import boto3
from botocore.exceptions import ClientError

from chalicelib.core.config import config
from chalicelib.core.exceptions import AppError

_sqs_client = None


def _get_sqs():
    global _sqs_client
    if _sqs_client is None:
        _sqs_client = boto3.client("sqs", region_name=config.AWS_REGION)
    return _sqs_client


def push_biometric_job(pet_id: str, s3_key: str, biometric_id: str) -> None:
    """
    생체 AI 검증 작업을 SQS 큐로 push.
    Worker Lambda: BiometricIdentity.job_status PENDING → PROCESSING → DONE/FAILED
    """
    _push({
        "job_type": "biometric_verify",
        "pet_id": pet_id,
        "s3_key": s3_key,
        "biometric_id": biometric_id,
    })


def push_scan_job(pet_id: str, s3_key: str, scan_types: list[str], job_id: str) -> None:
    """
    Health Scan AI 분석 작업을 SQS 큐로 push.
    Worker Lambda: HealthScan.job_status PENDING → PROCESSING → DONE/FAILED
    """
    _push({
        "job_type": "health_scan",
        "pet_id": pet_id,
        "s3_key": s3_key,
        "scan_types": scan_types,
        "job_id": job_id,
    })


def _push(payload: dict) -> None:
    if not config.SQS_QUEUE_URL:
        # 로컬 개발 환경: SQS URL 미설정 시 로그만 남기고 무시
        return

    try:
        _get_sqs().send_message(
            QueueUrl=config.SQS_QUEUE_URL,
            MessageBody=json.dumps(payload),
        )
    except ClientError as e:
        raise AppError(f"SQS 메시지 전송 실패: {e}") from e
