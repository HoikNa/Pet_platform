"""
Pet-ID API — Chalice 진입점
라우팅 위임만 담당. 비즈니스 로직은 controllers/ 에.

URL 프리픽스 정책: /api/v1 같은 prefix 없음. 명사형 리소스 경로 직접 사용.
"""
import json
import logging

from chalice import Chalice

from chalicelib.core.exceptions import AppError
from chalicelib.core.response import error as err_response

logger = logging.getLogger(__name__)

app = Chalice(app_name="pet-id-api")
app.debug = False  # 프로덕션에서는 False

# ── Blueprint 등록 ──────────────────────────────────────────
from chalicelib.controllers.media import media_bp          # noqa: E402
from chalicelib.controllers.auth import auth_bp            # noqa: E402
from chalicelib.controllers.users import users_bp          # noqa: E402
from chalicelib.controllers.pets import pets_bp            # noqa: E402
from chalicelib.controllers.biometrics import biometrics_bp  # noqa: E402
from chalicelib.controllers.scans import scans_bp          # noqa: E402
from chalicelib.controllers.medical import medical_bp      # noqa: E402
from chalicelib.controllers.admin import admin_bp          # noqa: E402

app.register_blueprint(media_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(pets_bp)
app.register_blueprint(biometrics_bp)
app.register_blueprint(scans_bp)
app.register_blueprint(medical_bp)
app.register_blueprint(admin_bp)


# ── 전역 에러 핸들러 ─────────────────────────────────────────
@app.middleware("http")
def handle_errors(event, get_response):
    """AppError 계열 예외를 표준 응답으로 변환."""
    try:
        return get_response(event)
    except AppError as e:
        return err_response(e.error_code, e.message, status_code=e.status_code)
    except Exception:
        return err_response("INTERNAL_ERROR", "서버 내부 오류가 발생했습니다.", status_code=500)


# ── SQS Worker Lambda (backend-dev-instruction §8) ───────────
# AI 분석 결과를 처리하는 비동기 Worker Lambda.
# 별도 Lambda 함수로 배포되며 pet-scan-queue SQS 메시지를 소비.
# 실제 AI 호출 로직은 services/ai_service.py 에 구현 예정.

@app.on_sqs_message(queue="pet-scan-queue")
def process_scan_job(event):
    """
    Health Scan / Biometric AI 분석 Worker.

    SQS 메시지 payload 형식:
      - job_type: "health_scan" | "biometric_verify"
      - pet_id, s3_key, job_id
      - scan_types (health_scan 전용): ["bcs", "gait", "eye_clarity", "voice_emotion"]
      - biometric_id (biometric_verify 전용)

    처리 흐름:
      1. S3에서 미디어 다운로드 → AI 모델 추론
      2. HealthScan / BiometricIdentity row 결과 업데이트
      3. FCM / WebSocket으로 완료 알림 Push
    """
    from chalicelib.core.db import get_session
    from chalicelib.core.helpers import update

    for record in event:
        try:
            payload = json.loads(record.body)
            job_type = payload.get("job_type")
            job_id = payload.get("job_id") or payload.get("biometric_id")

            logger.info("SQS 메시지 수신: job_type=%s, job_id=%s", job_type, job_id)

            if job_type == "health_scan":
                _handle_health_scan(payload)
            elif job_type == "biometric_verify":
                _handle_biometric_verify(payload)
            else:
                logger.warning("알 수 없는 job_type: %s", job_type)

        except Exception as e:
            logger.error("SQS 메시지 처리 실패: %s | payload=%s", e, record.body)
            raise  # SQS 재시도를 위해 예외 재발생


def _handle_health_scan(payload: dict) -> None:
    """
    Health Scan AI 분석 결과 처리 스텁.
    TODO: AI 모델 연동 후 실제 결과값으로 교체.
    """
    from chalicelib.core.db import get_session
    from chalicelib.core.helpers import update
    from chalicelib.models.scan import HealthScan

    job_id = payload["job_id"]
    with get_session() as session:
        update(session, HealthScan, job_id, job_status="DONE")
    logger.info("HealthScan %s 처리 완료 (stub)", job_id)


def _handle_biometric_verify(payload: dict) -> None:
    """
    Biometric AI 검증 결과 처리 스텁.
    TODO: AI 모델 연동 후 quality_score / feature_vector 실제 값으로 교체.
    """
    from chalicelib.core.db import get_session
    from chalicelib.core.helpers import update
    from chalicelib.models.biometric import BiometricIdentity

    biometric_id = payload["biometric_id"]
    with get_session() as session:
        update(session, BiometricIdentity, biometric_id, quality_score=1.0)
    logger.info("BiometricIdentity %s 검증 완료 (stub)", biometric_id)
