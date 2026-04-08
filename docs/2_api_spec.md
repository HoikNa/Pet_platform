# 2. API Specification

## 1. 개요
Front-End(모바일 앱/웹, B2B 대시보드)와 통신하기 위한 RESTful API 규격. Clean Code 원칙에 따라 `/api/v1` 등의 불필요한 Prefix는 제외하고 명사형 식별자를 사용합니다.

## 2. 공통 정책

### 2.1. 표준 응답 구조 (Standard Response Structure)
프론트엔드의 통일된 에러 핸들링 및 상태 관리를 위해, 모든 API 응답은 아래 포맷을 무조건 준수합니다.

*성공 응답 (Data & Meta)*
```json
{
  "success": true,
  "data": { ...응답 페이로드... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total_count": 150,
    "total_pages": 8
  }
}
```

*실패 응답 (Error)*
```json
{
  "success": false,
  "error": {
    "code": "ERR_INVALID_BIOMETRIC",
    "message": "생체 인증 정보 품질이 기준에 미달합니다. 다시 스캔해주세요.",
    "details": [...]
  }
}
```

### 2.2. Pagination 및 Filtering 정책
*   **Pagination:** `?page=1&limit=20` 쿼리 파라미터 사용.
*   **Sorting:** `?sort=-created_at,bcs_score` (접두어 `-`는 내림차순).
*   **Filtering:** `?filter[status]=ACTIVE&filter[bcs_score_gte]=5` 형태로 조건부 필터 처리.

### 2.3. 인증 (Authentication)
*   **JWT Bearer Token:** Header `Authorization: Bearer <token>` 방식.

## 3. 도메인별 주요 엔드포인트 명세

### 3.1. Auth & Users
*   `POST /auth/login` : 소셜 로그인 토큰 검증 및 JWT 발급.
*   `POST /auth/logout` : 토큰 무효화(블랙리스트).
*   `GET /users/me` : 내 정보 조회 (권한 및 프로필).
*   `PATCH /users/me` : 내 정보 수정.

### 3.2. Pets (반려동물 관리)
*   `GET /pets` : 등록된 반려동물 목록 조회 (+ 페이징/필터).
*   `POST /pets` : 신규 반려동물 등록 (임시 프로필 생성).
*   `GET /pets/{pet_id}` : 특정 반려동물 프로필 및 등록 상태 상세 조회.
*   `PATCH /pets/{pet_id}` : 기본 정보(체중, 생년월일 수정 등) 업데이트.

### 3.3. Biometrics & Media (생체 및 S3 업로드)
대용량 파일 처리를 위해 AWS S3 Presigned URL 워크플로우 적용.
*   `POST /media/presigned-url` : 
    *   Payload: `{ "filename": "scan.jpg", "file_type": "image/jpeg", "purpose": "biometric" }` (음성 파일의 경우 `file_type`: `audio/wav` 또는 `audio/mpeg`, `purpose`: `voice_emotion` 지원)
    *   Response: 생성된 업로드용 S3 URL 및 접근 키 발급. 프론트가 직접 S3 업로드 수행.
*   `POST /pets/{pet_id}/biometrics` : S3 업로드 성공 후 생체 데이터 유효성 검증 트리거 (비동기 AI 검증 큐로 Push 후 202 Accepted 반환).

### 3.4. Health Scans (건강 모니터링)
*   `GET /pets/{pet_id}/scans` : 해당 반려동물의 누적 건강 리포트 시계열 차트 데이터 조회.
*   `POST /pets/{pet_id}/scans` : S3에 업로드된 비디오 및 이미지 키를 전달하여 신규 건강 분석(Gait/BCS) 요청. (202 Accepted 및 Job ID 반환 후, 백엔드 SQS 큐를 통해 비동기 처리되며 완료 시 FCM 또는 웹소켓으로 프론트엔드에 푸시 알림).
*   `GET /scans/{scan_id}` : 특정 회차의 상세 건강 리포트 (코멘트, 부위별 세부 지표 포함).

### 3.5. Medical Records (진료·처방·접종 이력)
보호자가 반려동물의 병원 방문 이력, 처방 이력, 접종 이력을 직접 기록하고 조회하는 API.

**진료 이력**
*   `GET /pets/{pet_id}/medical-visits` : 해당 반려동물의 진료 이력 목록 조회 (페이지네이션 지원).
*   `POST /pets/{pet_id}/medical-visits` : 신규 진료 기록 추가.
*   `GET /pets/{pet_id}/medical-visits/{visit_id}` : 특정 진료 기록 상세 조회.
*   `PATCH /pets/{pet_id}/medical-visits/{visit_id}` : 진료 기록 수정.
*   `DELETE /pets/{pet_id}/medical-visits/{visit_id}` : 진료 기록 삭제 (Soft Delete).

**약 처방 이력**
*   `GET /pets/{pet_id}/prescriptions` : 해당 반려동물의 처방 이력 목록 조회.
*   `POST /pets/{pet_id}/prescriptions` : 신규 처방 기록 추가.
*   `DELETE /pets/{pet_id}/prescriptions/{prescription_id}` : 처방 기록 삭제 (Soft Delete).

**접종 이력**
*   `GET /pets/{pet_id}/vaccinations` : 해당 반려동물의 접종 이력 목록 조회 (다음 접종 예정일 포함).
*   `POST /pets/{pet_id}/vaccinations` : 신규 접종 기록 추가.
*   `DELETE /pets/{pet_id}/vaccinations/{vaccination_id}` : 접종 기록 삭제 (Soft Delete).

### 3.6. Organizations & Admin (B2B/B2G)
*   `GET /organizations/{org_id}/pets` : 소속 기관과 연동된 전체 환축/동물 목록 조회 및 원내 CRM EMR 데이터 결합을 위한 정보 제공 (페이징/필터링 필수 지원).

## 4. 에러 코드 체계 
*   `AUTH_001` : 만료된 토큰
*   `BIO_001` : 흐릿한 이지미 (품질 저하)
*   `BIO_002` : 다중 객체 검출 (프레임 내 다른 동물 존재)
*   `DB_001` : 존재하지 않는 식별자 접근.
