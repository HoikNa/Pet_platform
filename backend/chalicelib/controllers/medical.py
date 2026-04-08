"""
Medical Records 컨트롤러
진료 이력 (MedicalVisit), 처방 이력 (Prescription), 접종 이력 (Vaccination) CRUD
모든 엔드포인트는 require_auth + require_pet_ownership 적용.
"""
from chalice import Blueprint

from chalicelib.auth.decorators import require_auth, require_pet_ownership
from chalicelib.core.db import get_session
from chalicelib.core.exceptions import AppError, NotFoundError
from chalicelib.core.helpers import fetch_many, fetch_one, insert, soft_delete, update
from chalicelib.core.response import created, ok, error as err_response
from chalicelib.models.medical import MedicalVisit, Prescription, Vaccination

medical_bp = Blueprint(__name__)


# ════════════════════════════════════════════════════════════════
# 직렬화 헬퍼
# ════════════════════════════════════════════════════════════════

def _visit_dict(v: MedicalVisit) -> dict:
    return {
        "id": v.id,
        "pet_id": v.pet_id,
        "visit_date": v.visit_date,
        "hospital_name": v.hospital_name,
        "vet_name": v.vet_name,
        "visit_type": v.visit_type,
        "chief_complaint": v.chief_complaint,
        "diagnosis": v.diagnosis,
        "treatment_notes": v.treatment_notes,
        "follow_up_date": v.follow_up_date,
        "cost": v.cost,
        "created_at": str(v.created_at),
        "updated_at": str(v.updated_at),
    }


def _rx_dict(p: Prescription) -> dict:
    return {
        "id": p.id,
        "pet_id": p.pet_id,
        "medical_visit_id": p.medical_visit_id,
        "prescribed_date": p.prescribed_date,
        "hospital_name": p.hospital_name,
        "vet_name": p.vet_name,
        "drug_name": p.drug_name,
        "dosage": p.dosage,
        "frequency": p.frequency,
        "duration_days": p.duration_days,
        "purpose": p.purpose,
        "notes": p.notes,
        "created_at": str(p.created_at),
    }


def _vax_dict(v: Vaccination) -> dict:
    return {
        "id": v.id,
        "pet_id": v.pet_id,
        "vaccine_name": v.vaccine_name,
        "vaccination_type": v.vaccination_type,
        "vaccinated_date": v.vaccinated_date,
        "next_due_date": v.next_due_date,
        "hospital_name": v.hospital_name,
        "vet_name": v.vet_name,
        "batch_number": v.batch_number,
        "manufacturer": v.manufacturer,
        "created_at": str(v.created_at),
    }


def _qp(request):
    return request.query_params or {}


# ════════════════════════════════════════════════════════════════
# Medical Visits
# ════════════════════════════════════════════════════════════════

_VISIT_REQUIRED = {"visit_date", "hospital_name", "visit_type", "chief_complaint", "diagnosis"}
_VISIT_UPDATABLE = {
    "visit_date", "hospital_name", "vet_name", "visit_type",
    "chief_complaint", "diagnosis", "treatment_notes", "follow_up_date", "cost",
}


@medical_bp.route("/pets/{pet_id}/medical-visits", methods=["GET"])
@require_auth
@require_pet_ownership
def list_visits(pet_id):
    params = _qp(medical_bp.current_app.current_request)
    page = max(1, int(params.get("page", 1)))
    limit = min(100, max(1, int(params.get("limit", 20))))
    sort = params.get("sort", "-visit_date")

    with get_session() as session:
        result = fetch_many(session, MedicalVisit, page=page, limit=limit, sort=sort, pet_id=pet_id)
        return ok([_visit_dict(v) for v in result["data"]], meta=result["meta"])


@medical_bp.route("/pets/{pet_id}/medical-visits", methods=["POST"])
@require_auth
@require_pet_ownership
def create_visit(pet_id):
    body = medical_bp.current_app.current_request.json_body or {}
    missing = _VISIT_REQUIRED - set(body.keys())
    if missing:
        return err_response(
            "VALIDATION_ERROR",
            f"필수 필드 누락: {', '.join(sorted(missing))}",
            status_code=422,
        )
    try:
        with get_session() as session:
            visit = insert(
                session,
                MedicalVisit(
                    pet_id=pet_id,
                    visit_date=body["visit_date"],
                    hospital_name=body["hospital_name"],
                    vet_name=body.get("vet_name"),
                    visit_type=body["visit_type"],
                    chief_complaint=body["chief_complaint"],
                    diagnosis=body["diagnosis"],
                    treatment_notes=body.get("treatment_notes"),
                    follow_up_date=body.get("follow_up_date"),
                    cost=body.get("cost"),
                ),
            )
            return created(_visit_dict(visit))
    except AppError as e:
        return err_response(e.error_code, e.message, status_code=400)


@medical_bp.route("/pets/{pet_id}/medical-visits/{visit_id}", methods=["GET"])
@require_auth
@require_pet_ownership
def get_visit(pet_id, visit_id):
    try:
        with get_session() as session:
            visit = fetch_one(session, MedicalVisit, id=visit_id, pet_id=pet_id)
            return ok(_visit_dict(visit))
    except NotFoundError as e:
        return err_response(e.error_code, e.message, status_code=404)


@medical_bp.route("/pets/{pet_id}/medical-visits/{visit_id}", methods=["PATCH"])
@require_auth
@require_pet_ownership
def update_visit(pet_id, visit_id):
    body = medical_bp.current_app.current_request.json_body or {}
    fields = {k: v for k, v in body.items() if k in _VISIT_UPDATABLE and v is not None}
    if not fields:
        return err_response("VALIDATION_ERROR", "수정할 필드가 없습니다.", status_code=422)
    try:
        with get_session() as session:
            # pet_id 소유권은 요청 파라미터로 이미 검증됨; visit이 해당 pet 소속인지 확인
            fetch_one(session, MedicalVisit, id=visit_id, pet_id=pet_id)
            visit = update(session, MedicalVisit, visit_id, **fields)
            return ok(_visit_dict(visit))
    except NotFoundError as e:
        return err_response(e.error_code, e.message, status_code=404)
    except AppError as e:
        return err_response(e.error_code, e.message, status_code=400)


@medical_bp.route("/pets/{pet_id}/medical-visits/{visit_id}", methods=["DELETE"])
@require_auth
@require_pet_ownership
def delete_visit(pet_id, visit_id):
    try:
        with get_session() as session:
            fetch_one(session, MedicalVisit, id=visit_id, pet_id=pet_id)
            soft_delete(session, MedicalVisit, visit_id)
            return ok({"message": "진료 기록이 삭제되었습니다."})
    except NotFoundError as e:
        return err_response(e.error_code, e.message, status_code=404)


# ════════════════════════════════════════════════════════════════
# Prescriptions
# ════════════════════════════════════════════════════════════════

_RX_REQUIRED = {"prescribed_date", "hospital_name", "drug_name", "dosage", "frequency", "duration_days"}


@medical_bp.route("/pets/{pet_id}/prescriptions", methods=["GET"])
@require_auth
@require_pet_ownership
def list_prescriptions(pet_id):
    params = _qp(medical_bp.current_app.current_request)
    page = max(1, int(params.get("page", 1)))
    limit = min(100, max(1, int(params.get("limit", 20))))
    sort = params.get("sort", "-prescribed_date")

    with get_session() as session:
        result = fetch_many(session, Prescription, page=page, limit=limit, sort=sort, pet_id=pet_id)
        return ok([_rx_dict(p) for p in result["data"]], meta=result["meta"])


@medical_bp.route("/pets/{pet_id}/prescriptions", methods=["POST"])
@require_auth
@require_pet_ownership
def create_prescription(pet_id):
    body = medical_bp.current_app.current_request.json_body or {}
    missing = _RX_REQUIRED - set(body.keys())
    if missing:
        return err_response(
            "VALIDATION_ERROR",
            f"필수 필드 누락: {', '.join(sorted(missing))}",
            status_code=422,
        )
    try:
        with get_session() as session:
            rx = insert(
                session,
                Prescription(
                    pet_id=pet_id,
                    medical_visit_id=body.get("medical_visit_id"),
                    prescribed_date=body["prescribed_date"],
                    hospital_name=body["hospital_name"],
                    vet_name=body.get("vet_name"),
                    drug_name=body["drug_name"],
                    dosage=body["dosage"],
                    frequency=body["frequency"],
                    duration_days=int(body["duration_days"]),
                    purpose=body.get("purpose"),
                    notes=body.get("notes"),
                ),
            )
            return created(_rx_dict(rx))
    except AppError as e:
        return err_response(e.error_code, e.message, status_code=400)


@medical_bp.route("/pets/{pet_id}/prescriptions/{prescription_id}", methods=["DELETE"])
@require_auth
@require_pet_ownership
def delete_prescription(pet_id, prescription_id):
    try:
        with get_session() as session:
            fetch_one(session, Prescription, id=prescription_id, pet_id=pet_id)
            soft_delete(session, Prescription, prescription_id)
            return ok({"message": "처방 기록이 삭제되었습니다."})
    except NotFoundError as e:
        return err_response(e.error_code, e.message, status_code=404)


# ════════════════════════════════════════════════════════════════
# Vaccinations
# ════════════════════════════════════════════════════════════════

_VAX_REQUIRED = {"vaccine_name", "vaccination_type", "vaccinated_date", "hospital_name"}


@medical_bp.route("/pets/{pet_id}/vaccinations", methods=["GET"])
@require_auth
@require_pet_ownership
def list_vaccinations(pet_id):
    params = _qp(medical_bp.current_app.current_request)
    page = max(1, int(params.get("page", 1)))
    limit = min(100, max(1, int(params.get("limit", 20))))
    sort = params.get("sort", "-vaccinated_date")

    with get_session() as session:
        result = fetch_many(session, Vaccination, page=page, limit=limit, sort=sort, pet_id=pet_id)
        return ok([_vax_dict(v) for v in result["data"]], meta=result["meta"])


@medical_bp.route("/pets/{pet_id}/vaccinations", methods=["POST"])
@require_auth
@require_pet_ownership
def create_vaccination(pet_id):
    body = medical_bp.current_app.current_request.json_body or {}
    missing = _VAX_REQUIRED - set(body.keys())
    if missing:
        return err_response(
            "VALIDATION_ERROR",
            f"필수 필드 누락: {', '.join(sorted(missing))}",
            status_code=422,
        )
    try:
        with get_session() as session:
            vax = insert(
                session,
                Vaccination(
                    pet_id=pet_id,
                    vaccine_name=body["vaccine_name"],
                    vaccination_type=body["vaccination_type"],
                    vaccinated_date=body["vaccinated_date"],
                    next_due_date=body.get("next_due_date"),
                    hospital_name=body["hospital_name"],
                    vet_name=body.get("vet_name"),
                    batch_number=body.get("batch_number"),
                    manufacturer=body.get("manufacturer"),
                ),
            )
            return created(_vax_dict(vax))
    except AppError as e:
        return err_response(e.error_code, e.message, status_code=400)


@medical_bp.route("/pets/{pet_id}/vaccinations/{vaccination_id}", methods=["DELETE"])
@require_auth
@require_pet_ownership
def delete_vaccination(pet_id, vaccination_id):
    try:
        with get_session() as session:
            fetch_one(session, Vaccination, id=vaccination_id, pet_id=pet_id)
            soft_delete(session, Vaccination, vaccination_id)
            return ok({"message": "접종 기록이 삭제되었습니다."})
    except NotFoundError as e:
        return err_response(e.error_code, e.message, status_code=404)
