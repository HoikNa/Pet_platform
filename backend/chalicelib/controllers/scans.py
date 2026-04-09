"""
Health Scans 컨트롤러
GET  /pets/{pet_id}/scans       — 시계열 스캔 목록 (페이지네이션)
POST /pets/{pet_id}/scans       — AI 분석 요청 → SQS push → 202 + job_id
GET  /scans/{scan_id}           — 특정 스캔 상세 리포트
"""
import json

from chalice import Blueprint

from chalicelib.auth.decorators import require_auth, require_pet_ownership
from chalicelib.core.db import get_session
from chalicelib.core.exceptions import AppError, NotFoundError
from chalicelib.core.helpers import fetch_many, fetch_one, insert
from chalicelib.core.response import accepted, ok, error as err_response
from chalicelib.models.scan import HealthScan
from chalicelib.services.sqs_service import push_scan_job

scans_bp = Blueprint(__name__)

_VALID_SCAN_TYPES = {"bcs", "gait", "eye_clarity", "voice_emotion"}


def _serialize(scan: HealthScan) -> dict:
    return {
        "id": scan.id,
        "pet_id": scan.pet_id,
        "scan_date": scan.scan_date,
        "job_status": scan.job_status,
        "bcs_score": scan.bcs_score,
        "gait_score": scan.gait_score,
        "eye_clarity_score": scan.eye_clarity_score,
        "voice_emotion_score": scan.voice_emotion_score,
        "ai_comment": scan.ai_comment,
        "scan_types": json.loads(scan.scan_types) if scan.scan_types else [],
        "attachment_urls": json.loads(scan.attachment_urls) if scan.attachment_urls else [],
        "created_at": str(scan.created_at),
    }


@scans_bp.route("/pets/{pet_id}/scans", methods=["GET"], cors=True)
@require_auth
@require_pet_ownership
def list_scans(pet_id):
    """
    Query: ?page=1&limit=20&sort=-scan_date
    Response: 시계열 스캔 목록
    """
    params = scans_bp.current_app.current_request.query_params or {}
    page = max(1, int(params.get("page", 1)))
    limit = min(100, max(1, int(params.get("limit", 20))))
    sort = params.get("sort", "-scan_date")

    with get_session() as session:
        result = fetch_many(session, HealthScan, page=page, limit=limit, sort=sort, pet_id=pet_id)
        return ok(
            [_serialize(s) for s in result["data"]],
            meta=result["meta"],
        )


@scans_bp.route("/pets/{pet_id}/scans", methods=["POST"], cors=True)
@require_auth
@require_pet_ownership
def create_scan(pet_id):
    """
    Body: { "s3_key": "health_scan/...", "scan_types": ["bcs", "gait"], "scan_date": "2026-04-08T10:00:00Z" }
    Response 202: { "job_id": "<scan_id>", "status": "PENDING" }
    """
    body = scans_bp.current_app.current_request.json_body or {}
    s3_key = (body.get("s3_key") or "").strip()
    scan_types = body.get("scan_types") or []
    scan_date = (body.get("scan_date") or "").strip()

    if not s3_key:
        return err_response("VALIDATION_ERROR", "s3_key는 필수입니다.", status_code=422)
    if not scan_types:
        return err_response("VALIDATION_ERROR", "scan_types는 1개 이상 필요합니다.", status_code=422)
    if not scan_date:
        from datetime import datetime, timezone
        scan_date = datetime.now(timezone.utc).isoformat()

    invalid = set(scan_types) - _VALID_SCAN_TYPES
    if invalid:
        return err_response(
            "VALIDATION_ERROR",
            f"유효하지 않은 scan_type: {', '.join(invalid)}. 허용값: {', '.join(_VALID_SCAN_TYPES)}",
            status_code=422,
        )

    try:
        with get_session() as session:
            scan = insert(
                session,
                HealthScan(
                    pet_id=pet_id,
                    scan_date=scan_date,
                    scan_types=json.dumps(scan_types),
                    attachment_urls=json.dumps([s3_key]),
                    job_status="PENDING",
                ),
            )
            job_id = scan.id

        push_scan_job(pet_id=pet_id, s3_key=s3_key, scan_types=scan_types, job_id=job_id)

        return accepted({"job_id": job_id, "status": "PENDING"})

    except AppError as e:
        return err_response(e.error_code, e.message, status_code=400)


def _get_scan_detail(scan_id: str, user: dict):
    """스캔 상세 조회 공통 로직. 두 경로에서 공유."""
    from chalicelib.models.pet import Pet

    try:
        with get_session() as session:
            scan = fetch_one(session, HealthScan, id=scan_id)

            # B2C 소유권 확인 (ADMIN 제외)
            if user["role"] not in {"ADMIN"}:
                pet = fetch_one(session, Pet, id=scan.pet_id)
                if pet.owner_id != user["user_id"]:
                    return err_response("AUTH_002", "해당 스캔에 대한 접근 권한이 없습니다.", status_code=403)

            return ok(_serialize(scan))
    except NotFoundError as e:
        return err_response(e.error_code, e.message, status_code=404)


@scans_bp.route("/scans/{scan_id}", methods=["GET"], cors=True)
@require_auth
def get_scan(scan_id):
    """API Spec §3.4 — 특정 스캔 상세 리포트."""
    user = scans_bp.current_app.current_request.context["user"]
    return _get_scan_detail(scan_id, user)


@scans_bp.route("/scan/report/{scan_id}", methods=["GET"], cors=True)
@require_auth
def get_scan_report(scan_id):
    """Backend-dev-instruction §6 경로 alias — /scans/{scan_id} 와 동일."""
    user = scans_bp.current_app.current_request.context["user"]
    return _get_scan_detail(scan_id, user)
