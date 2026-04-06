# 4. Backend Architecture (AWS Chalice)

## 1. 개요
서버리스 프레임워크인 AWS Chalice 기반의 백엔드 아키텍처. 확장성, 유지보수성, 보안을 최우선으로 설계하며 모노리틱 폴더 구조 내에서 계층화(Layering)를 철저히 지킵니다. 대용량 AI 분석 라이브러리 지원을 위한 환경 구성 및 헬퍼 함수를 통한 생산성 향상에 중점을 둡니다.

## 2. 모듈 및 폴더 구조
```
/chalicelib
  ├── auth/            # JWT 검증 및 커스텀 인가 체계 (Decorators)
  ├── controllers/     # 엔드포인트별 비즈니스 로직 및 파라미터 밸리데이션 처리
  ├── services/        # AI 모듈 연동, AWS S3 통신, 외부 결제/알림 API 추상화 모듈
  ├── models/          # SQLModel 데이터 모델 정의
  ├── core/            # DB Session 팩토리, 고수준 DB 헬퍼, 환경변수 (Config)
/app.py                # Chalice Router (컨트롤러로 요청 패스 위임)
/requirements.txt      # 패키지 매니징
```

## 3. 핵심 아키텍처 원칙 구현 설계

### 3.1. High-level DB Helpers (DB 처리 추상화)
ORM을 사용할 때 비즈니스 파일에 쿼리 로직이 산재하는 것을 막기 위해 `chalicelib/core/helpers.py` 내부에 Django QuerySet 스타일의 공통 헬퍼 클래스를 정의합니다. 특히 모든 조회용 헬퍼는 데이터베이스 모델 설계서에 명시된 `is_deleted=False` 조건을 기본 필터로 내장하여 Soft Delete 레코드를 격리합니다.
*   **fetch(model, **kwargs):** 필터링 조건 제공 시 단일/다중 Row 패치 및 예외 처리(404 에러 등 자동 전환).
*   **bulk_fetch(model, limit, offset, sort, **kwargs):** 페이지네이션 처리가 내재된 다중 조회 및 `meta` 정보 포함 반환기.
*   **update(model, id, **kwargs):** 특정 식별자에 대한 수정 및 자동 커밋 처리.

### 3.2. Security & Auth Decorators
*   기본 Chalice Authorizer 외에, B2B와 B2C 간 철저한 인가 분리를 위해 파이썬 커스텀 데코레이터 적용.
*   `@require_role(['ADMIN', 'B2B_HOSPITAL'])`, `@require_pet_ownership` 등의 데코레이터를 통해 Controller 내릴 시점 전 단일 책임 검증.

### 3.3. Large Media Handling (S3 횡단 관심사 분리)
*   Lambda의 15분 제한 및 6MB Payload 한계를 회피를 위해, 파일 버퍼가 람다로 진입하지 않습니다.
*   `app.py` 에 API Gateway 단에서 Binary Media Type 제약 없이, 오직 Presigned URL을 발급하는 엔드포인트만 노출시킴.

### 3.4. Async & Background Processing 체계
*   복잡한 영상 기반 Gait Analysis나 BCS 처리 시 사용.
*   업무 플로우: 프론트 S3 업로드 -> SQS 대기열 삽입 -> 백그라운드 Worker Lambda가 해당 SQS 이벤트 트리거 수신 후 분석 -> DB 갱신 반영 -> FCM 혹은 웹소켓으로 프론트엔드에 완료 푸시.

## 4. 의존성 및 배포 환경 관리 (Lambda Layers)
*   AWS Chalice 배포 시 S3 업로드 한계를 초과하는 크리티컬 라이브러리(SQLModel, psycopg2-binary, 컴퓨터비전 처리 라이브러리 등)는 별도의 **AWS Lambda Layer** 로 패키징하여 분리, Chalice Config(`config.json`) 에 ARN 명시.
*   Alembic은 CI/CD 파이프라인 단에서 (Lambda와 독립적으로) 컨테이너에서 마이그레이션 스크립트를 RDS로 송신하는 형태로 관리.
