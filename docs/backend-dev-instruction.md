# Backend Development Instruction

## 1. 스택 및 폴더 구조
- **스택:** AWS Chalice + SQLModel (Pydantic v2) + PostgreSQL + Alembic
- **배포:** API Lambda + SQS Worker Lambda (AWS Chalice `chalice deploy --stage prod`)
- **배포 현황:** prod 스테이지 배포 완료. API Gateway URL: `https://trjmyzd347.execute-api.ap-northeast-2.amazonaws.com/api/`

```
/app.py              # Chalice 진입점 — Router 위임만 담당, 로직 없음
/chalicelib/
  auth/              # JWT 검증 + 커스텀 Role 데코레이터
  controllers/       # 파라미터 검증 + 서비스 호출
  services/          # 비즈니스 로직, S3/SQS/외부 API 추상화
  models/            # SQLModel 테이블 정의
  core/
    db.py            # Session 팩토리
    helpers.py       # High-level DB 헬퍼
    config.py        # 환경변수 싱글톤
```

---

## 2. 표준 API 응답 — 모든 엔드포인트 필수 준수

```python
# 성공
{"success": True, "data": {...}}
{"success": True, "data": [...], "meta": {"page":1,"limit":20,"total_count":150,"total_pages":8}}

# 실패
{"success": False, "error": {"code": "ERR_CODE", "message": "설명", "details": []}}
```

**에러 코드:** `AUTH_001` 만료토큰 / `BIO_001` 이미지품질저하 / `BIO_002` 다중객체검출 / `DB_001` 존재하지않는식별자

---

## 3. High-level DB Helpers (`chalicelib/core/helpers.py`)

모든 조회 헬퍼는 `is_deleted=False` 기본 필터 내장. 직접 쿼리 작성 금지.

```python
fetch(model, **kwargs)                      # 단일/다중 조회, 없으면 자동 404
bulk_fetch(model, limit, offset, sort, **kwargs)  # 페이지네이션 + meta 반환
update(model, id, **kwargs)                 # 수정 + 자동 커밋
soft_delete(model, id)                      # is_deleted=True + deleted_at 설정
```

DB Session: `with get_session() as session:` 컨텍스트 매니저. 트랜잭션 자동 관리.

---

## 4. 인증 & 권한 데코레이터 (`chalicelib/auth/`)

```python
@require_auth                               # JWT 유효성 검증 (보호 라우트 전체)
@require_role(['ADMIN', 'B2B_HOSPITAL'])    # 역할 기반 접근 제어
@require_pet_ownership                      # 반려동물 소유자 본인 확인
```

JWT 페이로드: `{user_id, role, exp}` — `app.current_request.context['user']`로 접근.

**역할:** `B2C` (본인 반려동물) / `B2B_HOSPITAL`, `B2B_INSURANCE`, `B2G` (소속 기관 환축) / `ADMIN` (전체)

---

## 5. DB 모델 (`chalicelib/models/`)

| 모델 | 핵심 필드 | Soft Delete |
|---|---|---|
| `User` | email(unique), role, social_key, phone | ✅ |
| `Pet` | owner_id(FK), species, breed, registration_status(PENDING/VERIFIED) | ✅ |
| `BiometricIdentity` | pet_id(FK, unique), scan_source_url, quality_score | CASCADE |
| `RFIDToken` | pet_id(FK), serial(unique), status(ACTIVE/REVOKED), expires_at | ❌ |
| `HealthScan` | pet_id(FK), scan_date, bcs_score(1-9), gait_score, eye_clarity_score, voice_emotion_score, scan_types(array) | CASCADE |
| `MedicalVisit` | pet_id(FK), visit_type(CHECK_UP/TREATMENT/SURGERY/EMERGENCY), chief_complaint, diagnosis, cost | ✅ |
| `Prescription` | pet_id(FK), medical_visit_id(FK nullable), drug_name, dosage, frequency, duration_days | ✅ |
| `Vaccination` | pet_id(FK), vaccination_type(CORE/NON_CORE/RABIES), vaccinated_date, next_due_date | ✅ |
| `Organization` | name, type | ❌ |
| `Membership` | org_id(FK), user_id(FK), role | ❌ |

모든 PK: UUID. **인덱스:** `Users.email`, `BiometricIdentity.pet_id`, `HealthScan.created_at` B-Tree 복합. `is_deleted` Partial Index.

---

## 6. 엔드포인트 목록

```
# Auth & Users
POST   /auth/login                     소셜 토큰 검증 → JWT 발급
POST   /auth/logout                    토큰 블랙리스트
GET    /users/me                       내 정보 조회
PATCH  /users/me                       내 정보 수정

# Pets
GET    /pets                           반려동물 목록
POST   /pets                           등록 (status=PENDING)
GET    /pets/{pet_id}                  상세 조회
PATCH  /pets/{pet_id}                  기본 정보 수정 (name, birth_date, weight)

# Biometrics & Media
POST   /media/presigned-url            S3 Presigned URL 발급
                                       body: {filename, file_type, purpose}
                                       purpose: biometric|health_scan|voice_emotion
POST   /pets/{pet_id}/biometrics       S3 업로드 완료 → AI 검증 SQS Push → 202

# Health Scans
GET    /pets/{pet_id}/scans            스캔 이력 목록 (시계열, 페이지네이션)
POST   /pets/{pet_id}/scans            AI 분석 요청 (s3_key) → SQS Push → 202 + job_id
GET    /scan/report/{scan_id}          특정 스캔 상세 리포트

# Medical Records
GET/POST            /pets/{pet_id}/medical-visits
GET/PATCH/DELETE    /pets/{pet_id}/medical-visits/{visit_id}
GET/POST            /pets/{pet_id}/prescriptions
DELETE              /pets/{pet_id}/prescriptions/{prescription_id}
GET/POST            /pets/{pet_id}/vaccinations
DELETE              /pets/{pet_id}/vaccinations/{vaccination_id}

# B2B/B2G
GET    /organizations/{org_id}/pets    소속 기관 환축 목록 (필터/페이지 필수)
```

**Pagination:** `?page=1&limit=20&sort=-created_at&filter[status]=ACTIVE`

---

## 7. S3 미디어 처리 패턴

파일은 Lambda를 거치지 않음 (6MB payload 한계 우회).

```
클라이언트 → POST /media/presigned-url → Presigned URL 수령
클라이언트 → S3 직접 PUT 업로드
클라이언트 → POST /pets/{id}/biometrics (s3_key 전달)
Lambda     → SQS Push → Worker Lambda → AI 처리 → DB 갱신
완료        → FCM / WebSocket → 클라이언트 알림
```

---

## 8. 비동기 AI 처리 (SQS Worker Lambda)

```python
@app.on_sqs_message(queue='pet-scan-queue')
def process_scan(event):
    for record in event:
        payload = json.loads(record.body)  # {pet_id, s3_key, scan_types, job_id}
        result = ai_service.analyze(payload)
        helpers.update(HealthScan, payload['job_id'], **result)
        push_notification(payload['pet_id'], result)
```

비동기 응답: `202 Accepted + job_id` 반환 → 푸시 알림으로 완료 통지.

---

## 9. 환경변수 (`chalicelib/core/config.py`)

```
DATABASE_URL      PostgreSQL 연결 문자열 (prod: RDS petid_db)
JWT_SECRET_KEY    JWT 서명 키
S3_BUCKET_NAME    미디어 버킷명 (prod: pet-id-uploads-prod)
SQS_QUEUE_URL     분석 작업 큐 URL (prod: pet-scan-queue)
STAGE             dev | prod
PRESIGNED_URL_EXPIRES  3600 (초)
```

`.chalice/config.json`의 `environment_variables`로 환경별 주입.
**주의:** `AWS_REGION`은 Lambda 예약 환경변수라 config.json에서 설정 불가. SDK 기본값 사용.
Alembic: `DATABASE_URL` 환경변수로 RDS 직접 연결 후 `alembic upgrade head` 실행.
CORS: 모든 라우트에 `cors=True` 필수 (API Gateway OPTIONS 자동 생성).
