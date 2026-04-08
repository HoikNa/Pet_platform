"""표준 API 응답 빌더."""
from chalice import Response
import json


def ok(data, meta: dict | None = None, status_code: int = 200) -> Response:
    body: dict = {"success": True, "data": data}
    if meta:
        body["meta"] = meta
    return Response(
        body=json.dumps(body, default=str, ensure_ascii=False),
        status_code=status_code,
        headers={"Content-Type": "application/json"},
    )


def created(data) -> Response:
    return ok(data, status_code=201)


def accepted(data) -> Response:
    return ok(data, status_code=202)


def error(code: str, message: str, details: list | None = None, status_code: int = 400) -> Response:
    body = {
        "success": False,
        "error": {"code": code, "message": message, "details": details or []},
    }
    return Response(
        body=json.dumps(body, ensure_ascii=False),
        status_code=status_code,
        headers={"Content-Type": "application/json"},
    )
