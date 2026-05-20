# Pet-ID AI — Pet_platform

## 프로젝트 개요
- **이름**: Pet-ID AI (반려동물 AI 건강 플랫폼)
- **목적**: AI 기반 반려동물 생체인식 등록, 건강 스캔, 의료 기록 통합 관리 (B2C/B2B/B2G 다중 테넌트)
- **단계**: 초기 운영 (APIs deployed, 프론트엔드 Mock 데이터 단계 → API 연동 단계 전환 중)
- **프론트엔드**: Vercel 배포 (`.env.production` 참조)
- **백엔드 API**: AWS Lambda + API Gateway

## 역할
시니어 풀스택 엔지니어로서 PRD부터 운영 준비까지 체계적으로 진행한다.
완벽한 코드보다 **데모 가능한 동작 코드**를 우선하되, 운영 전환 가능한 구조로 작성한다.
`docs/` 폴더의 설계 문서가 기준이며, 구현 전 항상 확인한다.

---

## 기술 스택

### 백엔드 (`backend/`)
| 항목 | 내용 |
|------|------|
| 언어 | Python 3.12 |
| 프레임워크 | AWS Chalice 1.32.0 (Serverless) |
| ORM | SQLModel 0.0.38 (SQLAlchemy + Pydantic) |
| 마이그레이션 | Alembic 1.13.0 |
| 인증 | PyJWT 2.8.0 + 토큰 블랙리스트 (in-memory) |
| DB (로컬) | SQLite (`dev.db`) |
| DB (운영) | AWS RDS PostgreSQL (`petid_db`) |
| 파일 저장 | AWS S3 (`pet-id-uploads-prod`) presigned URL |
| 메시지 큐 | AWS SQS (`pet-scan-queue`) — AI 비동기 처리 |
| AWS SDK | boto3 1.34.0 |
| 배포 | AWS Lambda + API Gateway |

### 프론트엔드 (`frontend/`)
| 항목 | 내용 |
|------|------|
| 언어 | TypeScript 5.4.5 |
| 프레임워크 | Vue 3.4.29 (Composition API) |
| 빌드 | Vite 5.3.3 |
| 스타일 | TailwindCSS 3.4.4 |
| 상태 관리 | Pinia 2.1.7 |
| HTTP | Axios 1.7.2 |
| 라우팅 | Vue Router 4.3.3 |
| 배포 | Vercel |
| 패키지 매니저 | npm |

---

## 디렉토리 구조

```
Pet_platform/
├── docs/                          # 설계 문서 (한국어)
│   ├── pet_prd.md                 # PRD (페르소나, 기능 요구사항, 비즈니스 모델)
│   ├── 1_database_model.md        # DB 스키마 및 관계
│   ├── 2_api_spec.md              # REST API 명세 (17 엔드포인트)
│   ├── 3_design_system.md         # 디자인 토큰 및 컴포넌트
│   ├── 4_backend_architecture.md  # Chalice 아키텍처 상세
│   ├── 5_frontend_architecture.md # Vue3 구조 및 패턴
│   ├── 6_ux_flow.md               # UX 플로우
│   └── 7_system_architecture.md   # 배포 및 인프라
├── backend/
│   ├── app.py                     # Chalice 진입점 및 라우트 등록
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── .env.example               # 환경변수 템플릿
│   ├── dev.db                     # SQLite 개발 DB
│   ├── .chalice/
│   │   ├── config.json            # Chalice 스테이지 설정 (dev/prod)
│   │   └── prod_policy.json       # AWS IAM 정책
│   ├── alembic/versions/          # 마이그레이션 스크립트
│   └── chalicelib/
│       ├── auth/
│       │   ├── decorators.py      # @require_auth, @require_role, @require_pet_ownership
│       │   ├── jwt_handler.py     # JWT 인코딩/디코딩
│       │   └── blacklist.py       # 로그아웃용 토큰 블랙리스트
│       ├── controllers/           # 7개 컨트롤러 (17 라우트)
│       │   ├── auth.py            # POST /auth/login, /auth/logout
│       │   ├── users.py           # GET/PATCH /users/me
│       │   ├── pets.py            # Pet CRUD
│       │   ├── biometrics.py      # 생체인식 등록 (SQS 비동기)
│       │   ├── scans.py           # 건강 스캔 (202 + Job ID)
│       │   ├── medical.py         # 의료 기록 CRUD (12 엔드포인트)
│       │   ├── media.py           # S3 presigned URL
│       │   └── admin.py           # B2B/B2G 관리자 포털
│       ├── services/
│       │   ├── auth_service.py    # 소셜 로그인 + JWT
│       │   ├── s3_service.py      # S3 presigned URL
│       │   └── sqs_service.py     # SQS 메시지 발행
│       ├── models/                # SQLModel ORM 모델 (10 테이블)
│       │   ├── base.py            # BaseModel (id:UUID, timestamps, soft delete)
│       │   ├── user.py            # User (B2C/B2B/B2G 역할)
│       │   ├── pet.py             # Pet + 소유권
│       │   ├── biometric.py       # BiometricIdentity (특징 벡터)
│       │   ├── rfid.py            # RFID 웨어러블 토큰
│       │   ├── scan.py            # HealthScan (BCS, 보행, 노화)
│       │   ├── medical.py         # MedicalVisit, Prescription, Vaccination
│       │   └── organization.py    # Organization, Membership
│       └── core/
│           ├── db.py              # SQLModel 세션 팩토리
│           ├── helpers.py         # 고수준 DB 헬퍼 (fetch, update, soft_delete)
│           ├── config.py          # 환경 설정 싱글턴
│           ├── exceptions.py      # 커스텀 예외
│           └── response.py        # 표준 JSON 응답 헬퍼
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── vercel.json                # SPA fallback
    ├── .env.production            # API Gateway URL, S3 버킷, Kakao 키
    └── src/
        ├── layouts/
        │   ├── MobileLayout.vue   # B2C 모바일 (최대 600px, 하단 네비)
        │   └── AdminLayout.vue    # B2B/B2G 데스크톱 (좌측 사이드바)
        ├── pages/                 # 15개+ 페이지 컴포넌트
        │   ├── LoginPage.vue / LandingPage.vue / DashboardPage.vue
        │   ├── pets/              # PetListPage, PetDetailPage, PetRegisterPage
        │   ├── scan/              # ScanOptionsPage → ScanCameraPage/ScanVoicePage → ScanLoadingPage → ScanReportPage
        │   └── admin/             # 병원/보험/정부 포털 (각 4페이지)
        ├── components/
        │   ├── ui/                # BaseButton, BaseInput, BaseModal, BaseCard, BaseBadge, BaseAvatar, BaseToast, DataTable
        │   ├── common/            # AppHeader, AppNavigation, ToastContainer
        │   ├── medical/           # AddVisitModal, AddPrescriptionModal, AddVaccinationModal
        │   └── scan/              # ScanResultChart
        ├── stores/                # Pinia 스토어 (5개)
        │   ├── authStore.ts       # 인증·세션
        │   ├── petStore.ts        # 반려동물 목록·캐시
        │   ├── scanStore.ts       # 스캔 캐시 (Map), 업로드 진행
        │   ├── medicalStore.ts    # 진료·처방·예방접종
        │   └── adminStore.ts      # 조직 반려동물·필터·페이지네이션
        ├── composables/
        │   ├── useCamera.ts       # MediaRecorder, 카메라 권한
        │   ├── useAudioRecorder.ts
        │   ├── useS3Upload.ts     # Presigned URL 직접 업로드
        │   ├── useToast.ts
        │   └── usePagination.ts
        ├── mocks/                 # Mock 데이터 (API 연동 전 사용)
        └── services/              # API 서비스 레이어 (Axios)
```

---

## API 엔드포인트 (17개)

**Base URL**: `/api/v1`  
**인증**: JWT Bearer Token (7일 만료)

| Method | Path | 권한 | 설명 |
|--------|------|------|------|
| POST | `/auth/login` | Public | 소셜 토큰 → JWT |
| POST | `/auth/logout` | 필요 | 토큰 블랙리스트 등록 |
| GET | `/users/me` | 필요 | 프로필 조회 |
| PATCH | `/users/me` | 필요 | 프로필 수정 |
| GET | `/pets` | 필요 | 목록 (pagination) |
| POST | `/pets` | 필요 | 반려동물 등록 |
| GET | `/pets/{pet_id}` | 필요 | 상세 조회 |
| PATCH | `/pets/{pet_id}` | 필요 | 정보 수정 |
| POST | `/media/presigned-url` | 필요 | S3 직접 업로드 URL |
| POST | `/pets/{pet_id}/biometrics` | 필요 | 생체인식 등록 (SQS 비동기) |
| GET | `/pets/{pet_id}/scans` | 필요 | 스캔 이력 |
| POST | `/pets/{pet_id}/scans` | 필요 | AI 스캔 요청 (202 + Job ID) |
| GET | `/scans/{scan_id}` | 필요 | 스캔 결과 상세 |
| GET/POST | `/pets/{pet_id}/medical/visits` | 필요 | 진료 기록 목록/등록 |
| GET/PATCH/DELETE | `/pets/{pet_id}/medical/visits/{id}` | 필요 | 진료 기록 상세 |
| GET/POST/DELETE | `/pets/{pet_id}/medical/prescriptions` | 필요 | 처방 관리 |
| GET/POST/DELETE | `/pets/{pet_id}/medical/vaccinations` | 필요 | 예방접종 관리 |
| GET | `/organizations/{org_id}/pets` | B2B/B2G | 조직 반려동물 조회 |

**표준 응답**: `{"success": true, "data": {...}, "meta": {...}}` 또는 `{"success": false, "error": {...}}`

---

## 데이터베이스 모델 (10개 테이블)

| 테이블 | 설명 |
|--------|------|
| **users** | B2C/B2B/B2G 역할, 소셜 로그인 키 |
| **pets** | 반려동물 메타데이터, 소유자 FK |
| **biometric_identities** | 안면/발바닥 스캔 (1:1 Pet), 특징 벡터, 품질 점수 |
| **rfid_tokens** | 오프라인 접근용 RFID 웨어러블 토큰 |
| **health_scans** | AI 추출 지표 (BCS 1-9, 보행 분석, 안구 선명도, 음성 감정) |
| **medical_visits** | 동물병원 방문 (검진/수술/응급), 진단, 치료 |
| **prescriptions** | 투약 이력, 용량, 기간, 수의사 메모 |
| **vaccinations** | 백신 종류, 날짜, 다음 접종일, 제조사 배치 |
| **organizations** | B2B 병원/보험사/정부 기관 |
| **memberships** | 사용자-조직 관계 및 역할 |

- 모든 테이블: UUID PK
- Soft delete: `is_deleted`, `deleted_at` (물리 삭제 없음)
- 부분 인덱스: 활성 레코드만 대상

---

## 인증 및 권한

- **JWT** 7일 만료, in-memory 블랙리스트 (로그아웃 시 등록)
- **역할**: `B2C` (일반 사용자), `B2B_HOSPITAL`, `B2B_INSURANCE`, `B2G` (정부)
- **데코레이터**: `@require_auth`, `@require_role(roles)`, `@require_pet_ownership`

---

## 프론트엔드 레이아웃 구조

- **MobileLayout** — B2C 사용자, 최대 600px, 하단 네비게이션, sticky 헤더
- **AdminLayout** — B2B/B2G 관리자, 데스크톱, 좌측 사이드바

**스캔 플로우**: `ScanOptionsPage` → `ScanCameraPage` or `ScanVoicePage` → `ScanLoadingPage` → `ScanReportPage`

---

## 로컬 개발

```bash
# 백엔드 환경 설정
cd backend
cp .env.example .env
# .env에 DATABASE_URL, JWT_SECRET_KEY, AWS 자격증명 설정

python3 -m venv .venv && .venv/bin/pip install -r requirements.txt

# DB 마이그레이션
.venv/bin/alembic upgrade head

# 로컬 서버 실행 (포트 8000)
.venv/bin/chalice local --host 0.0.0.0 --port 8000

# 프론트엔드
cd frontend
npm install && npm run dev
```

**환경변수** (`.env.example` 참조):
```
DATABASE_URL=postgresql://...   # 또는 sqlite:///./dev.db
JWT_SECRET_KEY=...
PERSONAL_ACCESS_CODE=...        # 로컬 테스트용
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=pet-id-uploads-prod
SQS_QUEUE_URL=...
```

---

## 배포

```bash
# 백엔드
cd backend
.venv/bin/chalice deploy --stage prod

# 프론트엔드 (Vercel 자동 배포)
cd frontend
npm run build   # 로컬 빌드 확인용
```

---

## 개발 현황 및 다음 단계

| 항목 | 상태 |
|------|------|
| 백엔드 17개 엔드포인트 | ✅ 운영 중 |
| RDS 스키마 (10 테이블) | ✅ 마이그레이션 완료 |
| S3/SQS 인프라 | ✅ 준비 완료 |
| 프론트엔드 Mock 데이터 | ✅ 완료 |
| Mock → 실 API 연동 | 🔄 진행 중 (3.2단계) |
| AI 모델 통합 (BCS, 보행) | ⏳ 예정 |
| Kakao 실제 OAuth | ⏳ 예정 |
| 푸시 알림 (FCM/WebSocket) | ⏳ 예정 |

---

## 작업 원칙

1. **Mock → 실 API 전환**: `frontend/src/mocks/`의 Mock 데이터를 `frontend/src/services/`의 실제 API 서비스로 교체 시 해당 Mock 파일 삭제
2. **Soft Delete 필수**: 데이터 삭제 시 물리 삭제 금지, `is_deleted=True` 처리
3. **DB 헬퍼 활용**: `core/helpers.py`의 고수준 헬퍼 함수 우선 사용 (직접 SQLAlchemy 쿼리 최소화)
4. **S3 직접 업로드**: Lambda payload 한계 회피를 위해 Presigned URL 통한 클라이언트 직접 업로드
5. **오류 대응**: 즉시 수정 금지 — 근본 원인 분석 → 보고 → 수정
6. **코드 변경**: 변경된 부분만 출력, 전체 파일 재출력 금지
7. **언어**: 코드·변수명은 영어, 응답은 한국어

---

## 사용 가능한 Skills

| 명령 | 설명 | 호출 시점 |
|------|------|----------|
| /plan-discovery | 1단계: 기획 (PRD, 페르소나) | 프로젝트 시작 |
| /plan-design | 2단계: 설계 (DB, API, 디자인 시스템) | 기획 완료 후 |
| /implement-frontend | 3단계: 프론트엔드 구현 | 설계 완료 후 |
| /implement-backend | 4단계: 백엔드 구현 | 프론트 완료 후 |
| /run-tests | 5단계: 테스트 + 통합 | 구현 완료 후 |
| /production-ready | 6단계: 운영 준비 | MVP 검증 후 |
