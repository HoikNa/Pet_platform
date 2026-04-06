# 5. Frontend Architecture (Vue3)

## 1. 개요
Composition API, TypeScript, Vite 환경을 100% 활용하는 Vue3 프론트엔드 아키텍처 규격입니다. 전역 상태 관리 단일화 및 API 호출 구조의 캡슐화를 통해 유지보수성과 컴포넌트 재사용성을 높이는 데 주력합니다.

## 2. 폴더 구조 
```
/src
  ├── assets/          # 정적 리소스, 디자인 시스템의 글로벌 CSS, 폰트
  ├── components/      # 단위 컴포넌트 (UI Atoms, Molecules), 도메인 특화 Components 분리
  ├── composables/     # 비즈니스/로직 모듈 캡슐화 (useCamera, useBiometricUpload 등)
  ├── layouts/         # B2C 모바일 뷰어용 레이아웃, 대시보드 레이아웃
  ├── pages/           # vue-router에 매핑되는 엔트리 스크린 단위
  ├── router/          # 라우팅 매핑 테이블 및 네비게이션 가드 정의
  ├── stores/          # Pinia 전역 상태 관리소
  ├── services/        # HTTP API 클라이언트 추상화(Axios interceptors)
```

## 3. 계층별 설계 방향

### 3.1. 상태 관리 (State Management - Pinia)
*   목적별 스토어 모듈 분리.
*   `useAuthStore`: 유저 세션 토큰, 사용자 권한 및 로그인 로직 전역 제어.
*   `usePetStore`: 현재 선택된 반려동물의 식별자, 기본 정보 캐싱 처리 (화면 전환 간 상태 유지 목적).
*   `useScanStore`: 임시 촬영 세션 데이터, 미처리 된 presigned upload URL 캐싱.
*   `useAdminStore`: B2B/B2G 관리자 포털 전용 상태 관리 (소속 기관 환축 목록, CRM 뷰 상태 등 캐싱).

### 3.2. API Service Layer
*   `axios` 인스턴스 싱글톤 구성 (`http.ts`).
*   **Request Interceptor:** 헤더에 Pinia의 인증 토큰 주입.
*   **Response Interceptor:** 공통 API 규격 중 `success: false` 도달 시 전역 `toast/feedback` 컴포넌트를 이용해 에러 메시지 팝업 중앙 집중 처리 (코드 중복 방지). 또한 만료된 토큰 응답 트리거 시 강제 로그아웃.

### 3.3. Composables (로직 재사용)
*   `useCamera`: MediaRecorder API 래핑, 카메라 권한 요청, 전/후면 전환 기능을 공용 제공.
*   `useS3Upload`: presigned url 요청 및 Axios를 이용한 S3 바이너리 푸시 흐름 일체화.
*   `usePagination`: 목록형 페이지의 공통 `Ref` 반환 (데이터, 현재 페이지, 다음 페이지 여부, 로딩 상태 등).

### 3.4. 컴포넌트 개발 규칙 (Smart & Dumb Components)
*   **Dumb Components (`/components/ui/`)**: Props만 받고 이벤트(Emits)만 송출, 안에 API 호출 금지. Tailwind 클래스로만 구현 (Design System 매핑).
*   **Smart Components (`/pages/` 및 특정 복합 위젯)**: 로직 분기, Store 사용, API 호출 등 제어 담당.

## 4. 환경 변수 관리 (Env)
Vite 기반 환경 세팅 (`.env`, `.env.production`). 
*   `VITE_API_BASE_URL`
*   `VITE_AWS_S3_REGION` 등 인프라 설정 주입.
