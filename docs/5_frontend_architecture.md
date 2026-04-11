# 5. Frontend Architecture (Vue3)

## 1. 개요
Composition API, TypeScript, Vite 환경을 100% 활용하는 Vue3 프론트엔드 아키텍처. 전역 상태 관리 단일화 및 Mock → 실제 API 교체 구조로 설계됨. 현재 3.1단계(Mock 데이터 동작) 완료, 3.2단계(실제 API 연동) 예정.

## 2. 기술 스택 및 배포

- **스택:** Vue 3 (Composition API) + TypeScript + Vite + TailwindCSS v3 + Pinia
- **배포:** Vercel — `https://frontend-eta-eosin.vercel.app`
- **경로 alias:** `@/` → `frontend/src/`

## 3. 폴더 구조

```
/frontend/src/
  assets/                # 정적 리소스, 글로벌 CSS
  components/
    common/              # AppHeader, AppNavigation, ToastContainer
    ui/                  # BaseButton, BaseInput, BaseModal, BaseBadge, BaseAvatar, BaseCard, BaseToast, DataTable
    medical/             # AddVisitModal, AddPrescriptionModal, AddVaccinationModal
    pets/                # PetCard
    scan/                # ScanResultChart
  composables/           # useCamera, useAudioRecorder, useS3Upload, useToast, usePagination
  layouts/               # MobileLayout (B2C), AdminLayout (B2B/B2G)
  mocks/                 # users, pets, scans, medicalRecords (실제 API 연동 전 사용)
  pages/
    LandingPage.vue
    LoginPage.vue
    DashboardPage.vue
    ProfilePage.vue
    ReportsPage.vue
    pets/                # PetListPage, PetDetailPage, PetRegisterPage
    scan/                # ScanOptionsPage, ScanCameraPage, ScanVoicePage, ScanLoadingPage, ScanReportPage
    admin/               # AdminDashboardPage, AdminPetDetailPage
    admin/hospital/      # HospitalDashboardPage, HospitalAppointmentsPage, HospitalVaccinationsPage
    admin/insurance/     # InsuranceDashboardPage, InsuranceClaimsPage, InsuranceClaimDetailPage, InsuranceAnalyticsPage
    admin/gov/           # GovDashboardPage, GovRegistrationsPage, GovShelterPage, GovStatisticsPage
  router/                # index.ts — 라우팅 테이블 + 네비게이션 가드
  services/              # http.ts (Axios 싱글톤, API 연동 시 interceptor 활성화)
  stores/                # authStore, petStore, scanStore, medicalStore, adminStore
  types/                 # index.ts — 전역 타입 정의
```

## 4. 레이아웃 구조

### 4.1. MobileLayout (B2C — layout: 'mobile')
- 최대 너비 600px, 모바일 앱 스타일
- 상단: `AppHeader` (sticky, 뒤로가기/알림)
- 하단: `AppNavigation` (홈/반려동물/스캔/리포트/프로필 탭)
- 중간: `<RouterView>` + `<Transition>` (fade/slide-left)
- **주의:** `<Transition>`은 단일 루트 요소만 허용. 모달이 있는 페이지는 반드시 단일 `<div>`로 전체 감싸야 함.

### 4.2. AdminLayout (B2B/B2G — layout: 'admin')
- 좌측 사이드바 구조, 데스크톱 대시보드

### 4.3. layout: 'none'
- Landing, Login, 카메라/녹음/로딩 전체화면 페이지

## 5. 페이지 목록 및 라우트

| 경로 | 페이지 | 역할 |
|---|---|---|
| `/` | → `/login` redirect | — |
| `/landing` | LandingPage | 서비스 소개 |
| `/login` | LoginPage | 로그인 (이메일/카카오) |
| `/dashboard` | DashboardPage | B2C 홈 |
| `/pets` | PetListPage | 반려동물 목록 |
| `/pets/register` | PetRegisterPage | 반려동물 등록 |
| `/pets/:id` | PetDetailPage | 반려동물 상세 (스캔/진료/처방/접종) |
| `/scan` | ScanOptionsPage | 스캔 옵션 선택 |
| `/scan/camera` | ScanCameraPage | 카메라 촬영 |
| `/scan/voice` | ScanVoicePage | 음성 녹음 |
| `/scan/loading` | ScanLoadingPage | AI 분석 대기 |
| `/scan/report/:id` | ScanReportPage | 스캔 리포트 |
| `/reports` | ReportsPage | 전체 스캔 기록 |
| `/profile` | ProfilePage | 프로필/설정 |
| `/admin/dashboard` | AdminDashboardPage | ADMIN 전용 |
| `/admin/hospital/dashboard` | HospitalDashboardPage | B2B_HOSPITAL |
| `/admin/insurance/dashboard` | InsuranceDashboardPage | B2B_INSURANCE |
| `/admin/gov/dashboard` | GovDashboardPage | B2G |

## 6. Pinia 스토어

| 스토어 | 핵심 상태 / 액션 |
|---|---|
| `useAuthStore` | `user`, `token`, `isAuthenticated`, `isAdmin`, `isB2CUser` / `login()`, `kakaoLogin()`, `logout()`, `restoreSession()` |
| `usePetStore` | `pets[]`, `selectedPetId`, `verifiedPets` / `fetchPets()`, `fetchPetById()`, `createPet()`, `updatePet()`, `selectPet()`, `reset()` |
| `useScanStore` | `currentSession`, `scanCache(Map)`, `uploadProgress` / `fetchScansByPetId()`, `requestScan()`, `startSession()`, `simulateUpload()` |
| `useMedicalStore` | `visits`, `prescriptions`, `vaccinations`, `upcomingVaccinationCount` / `fetchAllMedicalRecords()`, `addVisit()`, `addPrescription()`, `addVaccination()` |
| `useAdminStore` | `petList`, `filteredList`, `pagedList`, `statusFilter` / `fetchOrgPets()`, `setSearch()`, `setStatusFilter()`, `setPage()` |

**캐시 패턴:** `Map<petId, T[]>` 구조. `forceRefresh=false` 시 캐시 히트 즉시 반환.

## 7. Composables

| Composable | 주요 기능 |
|---|---|
| `useCamera()` | MediaRecorder API, 카메라 권한, 전/후면 전환, 촬영/녹화 |
| `useAudioRecorder()` | 마이크 권한, 음성 녹음, Blob 반환 |
| `useS3Upload()` | Presigned URL 요청 → S3 Direct Upload |
| `useToast()` | `success()`, `error()`, `warning()` 전역 토스트 |
| `usePagination()` | 페이지네이션 상태 관리 |

## 8. Mock → 실제 API 전환 전략

현재 스토어가 `mocks/` 파일의 함수를 직접 호출. 실제 API 연동 시:

1. `services/http.ts` interceptor 주석 해제 (JWT 주입, 에러 핸들링)
2. `services/` 하위 서비스 파일 구현 (`authService`, `petService` 등)
3. 각 스토어에서 mock 함수 호출 → 서비스 함수 호출로 교체
4. `mocks/` 디렉토리 제거

## 9. 환경 변수

| 변수 | 개발 | 프로덕션 |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | API Gateway URL |
| `VITE_AWS_S3_BUCKET` | `pet-id-uploads-dev` | `pet-id-uploads-prod` |
| `VITE_AWS_S3_REGION` | `ap-northeast-2` | `ap-northeast-2` |
| `VITE_DEMO_MODE` | `true` | `false` |

## 10. 알려진 주의사항

- **Fragment 금지:** `<Transition mode="out-in">`은 단일 루트 요소만 허용. 페이지 내 `BaseModal` 등 Teleport 컴포넌트가 있으면 전체를 하나의 `<div>`로 감쌀 것.
- **라우트 중복 금지:** 같은 컴포넌트를 다른 경로에 재사용하면 Transition이 동작하지 않아 네비게이션 클릭이 무반응처럼 보임.
