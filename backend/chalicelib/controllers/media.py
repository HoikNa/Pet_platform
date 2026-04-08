"""
미디어 컨트롤러 — Presigned URL 발급
POST /media/presigned-url
"""
import json

from chalice import Blueprint

from chalicelib.auth.decorators import require_auth
from chalicelib.core.exceptions import AppError, ValidationError
from chalicelib.core.response import created, error as err_response
from chalicelib.services.s3_service import generate_presigned_url

media_bp = Blueprint(__name__)


@media_bp.route("/media/presigned-url", methods=["POST"])
@require_auth
def get_presigned_url():
    """
    Body: { "filename": "scan.jpg", "file_type": "image/jpeg", "purpose": "biometric" }
    Response 201: { "upload_url": "...", "s3_key": "...", "expires_in": 3600 }

    purpose 허용값: biometric | health_scan | voice_emotion
    """
    request = media_bp.current_app.current_request
    user = request.context["user"]

    body = request.json_body or {}
    filename = body.get("filename", "").strip()
    file_type = body.get("file_type", "").strip()
    purpose = body.get("purpose", "").strip()

    if not filename or not file_type or not purpose:
        return err_response(
            "VALIDATION_ERROR",
            "filename, file_type, purpose 는 필수입니다.",
            status_code=422,
        )

    try:
        result = generate_presigned_url(
            filename=filename,
            file_type=file_type,
            purpose=purpose,
            user_id=user["user_id"],
        )
        return created(result)
    except AppError as e:
        return err_response(e.error_code, e.message, status_code=422)
