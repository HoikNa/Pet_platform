"""도메인 예외 — Controller에서 표준 에러 응답으로 변환."""


class AppError(Exception):
    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"

    def __init__(self, message: str = "Internal server error"):
        self.message = message
        super().__init__(message)


class NotFoundError(AppError):
    status_code = 404
    error_code = "DB_001"


class UnauthorizedError(AppError):
    status_code = 401
    error_code = "AUTH_001"


class ForbiddenError(AppError):
    status_code = 403
    error_code = "AUTH_002"


class ConflictError(AppError):
    status_code = 409
    error_code = "CONFLICT"


class ValidationError(AppError):
    status_code = 422
    error_code = "VALIDATION_ERROR"


class BiometricQualityError(AppError):
    status_code = 422
    error_code = "BIO_001"

    def __init__(self, message: str = "이미지 품질이 기준에 미달합니다. 다시 스캔해 주세요."):
        super().__init__(message)


class MultipleObjectDetectedError(AppError):
    status_code = 422
    error_code = "BIO_002"

    def __init__(self, message: str = "프레임 내 다른 동물이 감지되었습니다."):
        super().__init__(message)
