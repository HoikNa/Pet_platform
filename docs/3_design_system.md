# 3. Design System (TailwindCSS Ver3 기반)

## 1. 개요
확장성과 재사용성, 그리고 '통합 플랫폼'으로서의 신뢰감을 주는 모듈화된 UI 디자인 규격입니다. TailwindCSS v3 설정 파일(`tailwind.config.js`)에 Token을 주입하여 프로젝트 전체의 시각적 일관성을 통제합니다.

## 2. Foundation (기초 토큰)

### 2.1. Typography (폰트)
*   **글꼴:** 기본 폰트로 `Pretendard`(한글)와 `Inter`(영문/숫자) 혼용 처리.
*   **스케일:** Text-xs 부터 Text-4xl까지 일관된 Line-height(1.5배수) 및 자간(Tracking) 규칙 적용.

### 2.2. Colors (컬러 팔레트)
*   **Primary (Brand):** 신뢰감과 기술을 상징하는 Deep Blue 계열 (`primary-50` ~ `primary-900`).
*   **Secondary:** 생동감과 건강함을 뜻하는 Mint/Green 계열.
*   **Neutral (Grayscale):** 텍스트 및 보더용 무채색, `slate` 파생 컬러 10단계.
*   **Semantic:** 
    *   Success: Green 계열 (`success-500`)
    *   Warning: Yellow/Orange (`warning-500`)
    *   Error/Danger: Red (`error-500`) - 알림 및 실패 상태 (에러 토스트 등).
*   **다크모드 대응:** Semantic 컬러 토큰은 밝은 환경과 어두운 환경에서 접근성 명도비(WCAG 2.1) 4.5:1 이상을 통과하도록 세팅.

### 2.3. Spacing & Shadows
*   **간격 척도:** 4px 배수 시스템 (pt-1, 2, 4, 8, 16 등).
*   **그림자 (Elevation):** 컴포넌트 중요도 및 Z축 깊이에 따른 `shadow-sm`, `shadow-md`, `shadow-lg` 3단계 체계 구현.

## 3. Atomic Components (원자 컴포넌트)
기초 토큰을 조합하여 가장 작은 단위의 독립적 컴포넌트를 구성.
*   **Button:** 사이즈(sm/md/lg), 변형(solid, outline, ghost), 상태(default, hover, disabled, loading - 스피너 내장) 지원.
*   **Input & Textarea:** 에러 상태 테두리, 포커스 링, 라벨/도움말 택스트 내장.
*   **Badge:** B2B 및 상태구분용 (Active, Pending, Alert 등).
*   **Avatar:** 반려동물 증명 이미지 및 사용자 프로필 동그란 마스크 포맷.

## 4. Compound Components (복합 컴포넌트)
원자 컴포넌트들을 결합하여 특정 기능을 수행하는 묶음 컴포넌트.
*   **Card:** 대시보드에서 각 수치(BCS 등)를 보여주기 위한 공통 컨테이너. (Header, Body, Footer 구역).
*   **Data Table:** B2B/B2G 환경을 위한 페이지네이션, 정렬, 필터 포함 테이블 (Vue slots 활용).
*   **Modal / Dialog:** 생체 스캔 시작 확인, 최종 안내용 오버레이 창. Focus Trap 내장.
*   **Feedback (Toast / Alert):** API 표준 응답 포맷에 일치시켜 전역에서 발생하는 에러 메시지를 띄우는 배너.
*   **File Uploader & Camera Guide:** 카메라 스캐너의 실시간 가이드라인(원형/타원형 오버레이 및 십자선 마커 등) 구현.

## 5. Layout Structures (레이아웃)
*   **App Shell (B2C Mobile First):** 하단 네비게이션 탭 (GNB), 상단 글로벌 헤더 (알림 아이콘), 페이지 트랜지션 영역 보유. Container-max-width를 600px 이하로 제한하여 모바일 앱 환경 일관화.
*   **App Shell (B2B/B2G Desktop First):** 좌측 사이드바 구조 형태. 다중 뷰 스플릿 보드 템플릿 포함.
