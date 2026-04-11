# 4. Backend Architecture (AWS Chalice)

## 1. 개요
서버리스 프레임워크인 AWS Chalice 기반의 백엔드 아키텍처. 확장성, 유지보수성, 보안을 최우선으로 설계하며 모노리틱 폴더 구조 내에서 계층화(Layering)를 철저히 지킵니다.

## 2. 모듈 및 폴더 구조

```
/app.py                  # Chalice 진입점 — Blueprint 등록 + 전역 에러 핸들러 + SQS Worker 핸들러
/chalicelib/
  auth/                  # JWT 검증 + 커스텀 Role 데코레이터
    decorators.py        # @require_auth, @require_role, @require_pet_ownership
  controllers/           # 엔드포인트별 파라미터 검증 + 서비스 호출 (17개 라우트 구현)
    auth.py              # POST /auth/login, POST /auth/logout
    users.py             # GET/PATCH /users/me
    pets.py              # GET/POST /pets, GET/PATCH /pets/{pet_id}
    biometrics.py        # POST /pets/{pet_id}/biometrics
    scans.py             # GET/POST /pets/{pet_id}/scans, GET /scans/{scan_id}
    medical.py           # 진료/처방/접종 이력 CRUD (12개 엔드포인트)
    media.py             # POST /media/presigned-url
    admin.py             # GET /organizations/{org_id}/pets
  services/              # 비즈니스 로직 및 외부 서비스 추상화
    auth_service.py      # 소셜 로그인 검증, JWT 발급, 토큰 블랙리스트
    s3_service.py        # S3 Presigned URL 생성
    sqs_service.py       # SQS 메시지 발행 (AI 스캔 작업 큐)
  models/                # SQLModel 테이블 정의 (10개 테이블)
    user.py              # User
    pet.py               # Pet
    biometric.py         # BiometricIdentity
    rfid.py              # RFIDToken
    scan.py              # HealthScan
    medical.py           # MedicalVisit, Prescription, Vaccination
    organization.py      # Organization, Membership
    base.py              # 공통 Base 모델 (id, created_at, updated_at, is_deleted)
  core/
    db.py                # Session 팩토리 (with get_session() as session:)
    helpers.py           # High-level DB 헬퍼 (fetch, bulk_fetch, update, soft_delete)
    config.py            # 환경변수 싱글톤 (_Config)
    exceptions.py        # AppError, UnauthorizedError 등 커스텀 예외
    response.py          # ok(), created(), error() 표준 응답 헬퍼
/alembic/                # DB 마이그레이션 관리
/requirements.txt        # chalice, sqlmodel, psycopg2-binary, alembic, PyJWT, boto3
```

## 3. 핵심 아키텍처 원칙

### 3.1. High-level DB Helpers (`chalicelib/core/helpers.py`)
모든 조회 헬퍼는 `is_deleted=False` 기본 필터 내장. 직접 쿼리 작성 금지.

- **`fetch(session, model, **kwargs)`** — 단일/다중 조회, 없으면 자동 404
- **`bulk_fetch(session, model, limit, offset, sort, **kwargs)`** — 페이지네이션 + meta 반환
- **`update(session, model, id, **kwargs)`** — 수정 + 자동 커밋
- **`soft_delete(session, model, id)`** — `is_deleted=True` + `deleted_at` 설정

### 3.2. Security & Auth Decorators (`chalicelib/auth/decorators.py`)
- `@require_auth` — JWT 유효성 검증 (모든 보호 라우트 적용)
- `@require_role(['ADMIN', 'B2B_HOSPITAL'])` — 역할 기반 접근 제어
- `@require_pet_ownership` — 반려동물 소유자 본인 확인

JWT 페이로드: `{user_id, role, exp}` → `app.current_request.context['user']`로 접근

### 3.3. Large Media Handling (S3 횡단 관심사 분리)
Lambda 6MB Payload 한계 회피. 파일이 Lambda를 통과하지 않음.
- `POST /media/presigned-url` → S3 Presigned URL 발급
- 클라이언트가 직접 S3에 업로드 (Direct Upload)
- 업로드 완료 후 `/biometrics` 또는 `/scans` API 호출로 DB 등록

### 3.4. Async & Background Processing
- S3 업로드 완료 → SQS `pet-scan-queue` 메시지 발행
- `pet-id-api-prod-process_scan_job` Worker Lambda가 SQS 트리거로 수신
- AI 모델 추론 → DB 갱신 (현재 Stub, AI 연동 예정)

### 3.5. CORS
모든 17개 라우트에 `cors=True` 적용. Vercel 프론트엔드의 API Gateway 호출 허용.

## 4. 배포 현황

| 항목 | 값 |
|---|---|
| **API Lambda** | `pet-id-api-prod` (python3.12, 512MB, 30s) |
| **Worker Lambda** | `pet-id-api-prod-process_scan_job` |
| **API Gateway URL** | `https://trjmyzd347.execute-api.ap-northeast-2.amazonaws.com/api/` |
| **DB** | AWS RDS PostgreSQL `database-1` → `petid_db` |
| **S3** | `pet-id-uploads-prod` (CORS 설정, 퍼블릭 차단) |
| **SQS** | `pet-scan-queue` |
| **Alembic 마이그레이션** | `initial_schema` (10개 테이블) 적용 완료 |

## 5. 환경변수 (`backend/.chalice/config.json` prod stage)

```
DATABASE_URL      — RDS PostgreSQL 연결 문자열
JWT_SECRET_KEY    — JWT 서명 키
S3_BUCKET_NAME    — pet-id-uploads-prod
SQS_QUEUE_URL     — https://sqs.ap-northeast-2.amazonaws.com/563332535352/pet-scan-queue
STAGE             — prod
```
