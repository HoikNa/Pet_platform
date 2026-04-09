"""
Biometrics 컨트롤러
POST /pets/{pet_id}/biometrics — S3 업로드 완료 후 AI 검증 트리거
  body: { "s3_key": "biometric/user_id/uuid.jpg" }
  response 202: { "job_id": "<biometric_id>", "status": "PENDING" }

흐름:
  1. BiometricIdentity row 생성 (quality_score=0, 상태 PENDING)
  2. SQS push → Worker Lambda AI 검증 → quality_score 업데이트
"""
from chalice import Blueprint

from chalicelib.auth.decorators import require_auth, require_pet_ownership
from chalicelib.core.db import get_session
from chalicelib.core.exceptions import AppError, ConflictError, NotFoundError
from chalicelib.core.helpers import exists, fetch_one, insert
from chalicelib.core.response import accepted, error as err_response
from chalicelib.models.biometric import BiometricIdentity
from chalicelib.models.pet import Pet
from chalicelib.services.s3_service import build_s3_uri
from chalicelib.services.sqs_service import push_biometric_job

biometrics_bp = Blueprint(__name__)


@biometrics_bp.route("/pets/{pet_id}/biometrics", methods=["POST"], cors=True)
@require_auth
@require_pet_ownership
def register_biometric(pet_id):
    """
    Body: { "s3_key": "biometric/user_id/uuid.jpg" }
    Response 202: { "job_id": "<biometric_id>", "status": "PENDING" }
    """
    body = biometrics_bp.current_app.current_request.json_body or {}
    s3_key = (body.get("s3_key") or "").strip()

    if not s3_key:
        return err_response("VALIDATION_ERROR", "s3_key는 필수입니다.", status_code=422)

    try:
        with get_session() as session:
            # 펫 존재 확인 (require_pet_ownership 이미 확인했지만 명시적으로 재확인)
            fetch_one(session, Pet, id=pet_id)

            # 이미 생체 정보가 등록된 경우 409
            if exists(session, BiometricIdentity, pet_id=pet_id):
                return err_response(
                    "CONFLICT",
                    "이미 생체 정보가 등록된 반려동물입니다. 기존 데이터를 삭제 후 재시도하세요.",
                    status_code=409,
                )

            biometric = insert(
                session,
                BiometricIdentity(
                    pet_id=pet_id,
                    scan_source_url=build_s3_uri(s3_key),
                    quality_score=0.0,  # Worker가 갱신
                ),
            )
            job_id = biometric.id

        # SQS push — 세션 커밋 이후에 실행 (롤백 대상 아님)
        push_biometric_job(pet_id=pet_id, s3_key=s3_key, biometric_id=job_id)

        return accepted({"job_id": job_id, "status": "PENDING"})

    except NotFoundError as e:
        return err_response(e.error_code, e.message, status_code=404)
    except AppError as e:
        return err_response(e.error_code, e.message, status_code=400)
