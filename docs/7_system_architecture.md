# 7. System Architecture — 배포 현황 및 구축 설계

## 1. 현재 배포 현황 (as of 2026-04-10)

| 구성 요소 | 서비스 | 엔드포인트/URL |
|---|---|---|
| **프론트엔드** | Vercel | https://frontend-eta-eosin.vercel.app |
| **백엔드 API** | AWS Lambda + API Gateway | https://trjmyzd347.execute-api.ap-northeast-2.amazonaws.com/api/ |
| **Worker Lambda** | AWS Lambda + SQS | `pet-id-api-prod-process_scan_job` |
| **DB** | AWS RDS PostgreSQL | `database-1` → `petid_db` (ap-northeast-2) |
| **미디어 스토리지** | AWS S3 | `pet-id-uploads-prod` |
| **비동기 큐** | AWS SQS | `pet-scan-queue` |
| **소스 코드** | GitHub | `HoikNa/Pet_platform` (main 브랜치) |

## 2. 시스템 계층 구조

### 2.1. Presentation Layer
- **B2C 모바일 / B2B/B2G 대시보드:** Vue3/Vite 빌드 결과물을 **Vercel**에 배포
  - SPA 라우팅: `vercel.json` rewrites 설정으로 `/` fallback 처리
  - 빌드 시 `VITE_API_BASE_URL`로 API Gateway URL 주입

### 2.2. Application Layer
- **API Lambda** (`pet-id-api-prod`): 동기 CRUD API 처리 (python3.12, 512MB, 30s)
- **Worker Lambda** (`pet-id-api-prod-process_scan_job`): SQS 트리거 비동기 AI 처리 (Stub, AI 모델 연동 예정)
- **API Gateway:** 모든 외부 요청의 진입점. CORS는 각 라우트 레벨에서 처리

### 2.3. Data Layer
- **AWS RDS PostgreSQL** (`petid_db`): 10개 테이블, Alembic `initial_schema` 마이그레이션 완료
  - Users, Pets, BiometricIdentities, RFIDTokens, HealthScans, MedicalVisits, Prescriptions, Vaccinations, Organizations, Memberships
- **AWS S3** (`pet-id-uploads-prod`): 미디어 파일 전용. Lambda를 통과하지 않고 Presigned URL 방식으로 클라이언트 Direct Upload
- **AWS SQS** (`pet-scan-queue`): AI 스캔 작업 비동기 큐

## 3. 주요 데이터 흐름

### 3.1. 반려동물 등록 흐름
```
앱 → POST /media/presigned-url → S3 Presigned URL 발급
앱 → S3 Direct Upload (Lambda 무통과)
앱 → POST /pets/{id}/biometrics → SQS 메시지 발행 → 202 반환
Worker Lambda → SQS 수신 → AI 생체 인식 추론 (예정) → DB 업데이트
```

### 3.2. 헬스 스캔 흐름
```
앱 → POST /media/presigned-url → S3 URL 발급
앱 → S3 Direct Upload
앱 → POST /pets/{id}/scans → Job ID 반환 (202)
Worker Lambda → SQS 수신 → BCS/Gait AI 추론 (예정) → DB 갱신 → 알림 Push
```

### 3.3. 의료 기록 조회 흐름
```
앱 → GET /pets/{id}/medical-visits (JWT 인증) → RDS 조회 → 응답
```

## 4. 차기 구축 목표 (미구현)

| 항목 | 설명 |
|---|---|
| **AI 모델 연동** | Worker Lambda Stub → 실제 BCS/Gait/생체인식 모델 연동 |
| **실제 소셜 로그인** | 카카오 OAuth → 현재는 Mock 로그인 |
| **프론트 API 연동** | Mock 데이터 → 실제 API 서비스 레이어 활성화 (3.2단계) |
| **Amazon QLDB** | 생체 인식 원장 불변 저장소 (보험 부정수급 방어) |
| **FCM / WebSocket** | AI 분석 완료 시 푸시 알림 |
| **AWS WAF** | API Gateway 앞단 웹 공격 방어 |
| **CloudFront** | Vercel 대신 S3+CloudFront로 프론트 배포 전환 (프로덕션 확장 시) |

## 5. 보안 구성

- **JWT:** HS256, 7일 만료, 블랙리스트 방식 로그아웃
- **S3:** 퍼블릭 액세스 전면 차단, Presigned URL (1시간 유효)로만 접근
- **RDS:** 퍼블릭 액세스 허용 (개발 편의), 프로덕션 확장 시 Private Subnet 이전 필요
- **CORS:** `Access-Control-Allow-Origin: *` (프로덕션 확장 시 특정 도메인으로 제한 필요)
