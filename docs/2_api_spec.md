# 2. API Specification

## 1. 개요
Front-End(모바일 앱/웹, B2B 대시보드)와 통신하기 위한 RESTful API 규격. Clean Code 원칙에 따라 `/api/v1` 등의 불필요한 Prefix는 제외하고 명사형 식별자를 사용합니다.

**현재 배포 Base URL:** `https://trjmyzd347.execute-api.ap-northeast-2.amazonaws.com/api`

## 2. 공통 정책

### 2.1. 표준 응답 구조
```json
// 성공
{ "success": true, "data": { ... } }
{ "success": true, "data": [...], "meta": { "page": 1, "limit": 20, "total_count": 150, "total_pages": 8 } }

// 실패
{ "success": false, "error": { "code": "ERR_CODE", "message": "설명", "details": [] } }
```

### 2.2. Pagination 및 Filtering
- **Pagination:** `?page=1&limit=20`
- **Sorting:** `?sort=-created_at,bcs_score` (접두어 `-`는 내림차순)
- **Filtering:** `?filter[status]=ACTIVE&filter[bcs_score_gte]=5`

### 2.3. 인증
- **JWT Bearer Token:** `Authorization: Bearer <token>`

### 2.4. CORS
- 모든 엔드포인트에 `cors=True` 적용 (Vercel 프론트엔드 도메인 허용)

## 3. 구현된 엔드포인트 (17개)

### 3.1. Auth
| Method | Path | 설명 | 인증 |
|---|---|---|---|
| POST | `/auth/login` | 소셜 토큰 검증 → JWT 발급 | ❌ |
| POST | `/auth/logout` | 토큰 블랙리스트 등록 | ✅ |

**로그인 요청 Body:**
```json
{ "provider": "kakao", "social_token": "<kakao_access_token>" }
```

### 3.2. Users
| Method | Path | 설명 | 인증 |
|---|---|---|---|
| GET | `/users/me` | 내 정보 조회 | ✅ |
| PATCH | `/users/me` | 내 정보 수정 | ✅ |

### 3.3. Pets
| Method | Path | 설명 | 인증 |
|---|---|---|---|
| GET | `/pets` | 반려동물 목록 조회 (페이징/필터) | ✅ |
| POST | `/pets` | 신규 반려동물 등록 | ✅ |
| GET | `/pets/{pet_id}` | 반려동물 상세 조회 | ✅ |
| PATCH | `/pets/{pet_id}` | 기본 정보 업데이트 | ✅ |

### 3.4. Biometrics & Media
| Method | Path | 설명 | 인증 |
|---|---|---|---|
| POST | `/media/presigned-url` | S3 Presigned URL 발급 | ✅ |
| POST | `/pets/{pet_id}/biometrics` | 생체 데이터 등록 트리거 (202 반환) | ✅ |

**Presigned URL 요청 Body:**
```json
{ "filename": "scan.mp4", "file_type": "video/mp4", "purpose": "biometric" }
```
`purpose`: `biometric` | `health_scan` | `voice_emotion`

### 3.5. Health Scans
| Method | Path | 설명 | 인증 |
|---|---|---|---|
| GET | `/pets/{pet_id}/scans` | 스캔 이력 목록 (시계열) | ✅ |
| POST | `/pets/{pet_id}/scans` | AI 스캔 요청 (202 + Job ID) | ✅ |
| GET | `/scans/{scan_id}` | 특정 스캔 상세 리포트 | ✅ |
| GET | `/scan/report/{scan_id}` | 리포트 뷰 전용 | ✅ |

### 3.6. Medical Records
| Method | Path | 설명 | 인증 |
|---|---|---|---|
| GET | `/pets/{pet_id}/medical-visits` | 진료 이력 목록 | ✅ |
| POST | `/pets/{pet_id}/medical-visits` | 진료 기록 추가 | ✅ |
| GET | `/pets/{pet_id}/medical-visits/{visit_id}` | 진료 기록 상세 | ✅ |
| PATCH | `/pets/{pet_id}/medical-visits/{visit_id}` | 진료 기록 수정 | ✅ |
| DELETE | `/pets/{pet_id}/medical-visits/{visit_id}` | 진료 기록 삭제 (Soft) | ✅ |
| GET | `/pets/{pet_id}/prescriptions` | 처방 이력 목록 | ✅ |
| POST | `/pets/{pet_id}/prescriptions` | 처방 기록 추가 | ✅ |
| DELETE | `/pets/{pet_id}/prescriptions/{prescription_id}` | 처방 기록 삭제 | ✅ |
| GET | `/pets/{pet_id}/vaccinations` | 접종 이력 목록 | ✅ |
| POST | `/pets/{pet_id}/vaccinations` | 접종 기록 추가 | ✅ |
| DELETE | `/pets/{pet_id}/vaccinations/{vaccination_id}` | 접종 기록 삭제 | ✅ |

### 3.7. Admin
| Method | Path | 설명 | 인증 |
|---|---|---|---|
| GET | `/organizations/{org_id}/pets` | 기관 소속 환축 목록 (페이징/필터) | ✅ (B2B/B2G) |

## 4. 에러 코드 체계

| 코드 | 설명 |
|---|---|
| `AUTH_001` | 만료/유효하지 않은 토큰 |
| `BIO_001` | 이미지 품질 저하 |
| `BIO_002` | 다중 객체 검출 (프레임 내 다른 동물 존재) |
| `DB_001` | 존재하지 않는 식별자 접근 |
| `VALIDATION_ERROR` | 필수 파라미터 누락 또는 형식 오류 |
| `INTERNAL_ERROR` | 서버 내부 오류 |
