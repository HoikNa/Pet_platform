# 1. Database Model Design

## 1. 개요
본 문서는 'Pet-ID AI 플랫폼'의 데이터 지속성을 처리하기 위한 SQLModel 기반 관계형 데이터베이스(PostgreSQL) 설계 명세입니다. 고가용성, 무결성 유지, 그리고 AI 분석 및 B2B 확장을 고려하여 정규화 및 관계를 정의합니다.

## 2. 테이블 정의 및 관계

### 2.1. 사용자 (Users)
*   **목적:** B2C 반려인, B2B 관리자, B2G 관계자 등 모든 플랫폼 사용자의 계정 및 권한 관리.
*   **필드:** ID(PK, UUID), 이메일, 패스워드 해시, 소셜 연동 키(Kakao 등), 이름, 연락처, Role(B2C, B2B_HOSPITAL, B2B_INSURANCE, B2G, ADMIN), 생성일, 수정일, 삭제일(Soft Delete).
*   **제약/정책:** 이메일 및 소셜 연동 키는 유니크 인덱스 처리.

### 2.2. 반려동물 (Pets)
*   **목적:** 반려동물 기본 정보 및 소유자 매핑. 핵심 Entity (Primary Key = UUID 기반 생체 인식 식별자 지원).
*   **필드:** ID(PK, UUID), 소유자 ID(FK -> Users), 이름, 종/품종, 생년월일, 성별, 중성화 여부, 등록 상태(PENDING, VERIFIED), 생성일, 수정일.
*   **관계:** Users 모델과 1:N 관계. 소유자 탈퇴 시 CASCADE 정책 적용(선택적 Soft Delete).

### 2.3. 생체 식별 정보 (Biometric_Identities)
*   **목적:** 비접촉 스캔된 안면/비문 데이터를 바탕으로 개체를 식별하는 마스터 데이터.
*   **필드:** ID(PK, UUID), 반려동물 ID(FK -> Pets, Unique), 스캔 원본 경로(S3 URI), 특징점 데이터(Vector/JSON), 품질 점수, 인증 기관, 생성일.
*   **관계:** Pets 모델과 1:1 관계. 반려동물 기록 하드 삭제 시 RESTRICT 또는 CASCADE 기반 제거. 보안 요구가 높은 핵심 테이블.

### 2.4. RFID 웨어러블 토큰 (RFID_Tokens)
*   **목적:** 오프라인 시설 접근 및 생체 식별의 상호 보완적 오프라인 토큰.
*   **필드:** ID(PK, UUID), 반려동물 ID(FK -> Pets), 토큰 시리얼(유니크), 발급일, 만료일, 상태(ACTIVE, REVOKED).

### 2.5. 헬스 스캔 리포트 (Health_Scans)
*   **목적:** AI 스캔을 통해 추출된 일별/주기별 비만 및 노화 지표 저장.
*   **필드:** ID(PK, UUID), 반려동물 ID(FK -> Pets), 측정일시, BCS_Score(1~9), 보행 점수(정량화된 추론 수치), 안구 혼탁도 점수, 음성 감정 점수(파형 분석 수치), AI 코멘트, 연관 첨부 파일 경로(S3 URI).
*   **관계:** Pets 모델과 1:N 관계. Time-series 분석의 핵심 소스. Pets 삭제 시 CASCADE 제거 (데이터 활용 동의 여부에 따라 비식별화 보존 처리).

### 2.6. 기관 및 B2B 연결 (Organizations & Memberships)
*   **목적:** B2B 병원 등과 반려인의 연결 기록 관리 (B2B SaaS 및 병원 CRM 지원용).
*   **필드:** [Organizations] - ID, 기관명, 타입, 연락처. / [Memberships] - 기관 ID, 사용자 ID, 권한 등급.

## 3. 참조 무결성 및 Cascade 정책

*   **Users -> Pets:** 소유자 계정 삭제 시 Soft Delete (is_deleted 튜플 업데이트). 반려동물 데이터는 데이터 거버넌스 정책에 따라 처리.
*   **Pets -> Health_Scans:** 반려동물 강제 삭제 시 CASCADE 삭제 처리 혹은 비식별 데이터로 Migration 큐 적재.
*   **Pets -> Biometric_Identities:** 반려동물 정보 삭제 시 무결성 보장을 위해 함께 CASCADE.

## 4. 인덱싱 정책
*   빠른 Read 성능 확보를 위해 `Users.email`, `Biometric_Identities.pet_id`, `Health_Scans.created_at` 컬럼에 대해 B-Tree 복합 인덱스 적용.
*   Soft Delete 필드(`is_deleted`)가 포함된 부분 인덱스(Partial Index) 활용으로 Active 레코드 조회 최적화.
