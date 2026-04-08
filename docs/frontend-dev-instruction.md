# Frontend Development Instruction

## 1. 스택 및 경로 규칙
- **스택:** Vue 3 (Composition API) + TypeScript + Vite + TailwindCSS v3 + Pinia
- **경로 alias:** `@/` → `frontend/src/`
- **레이아웃:** B2C = `layouts/MobileLayout.vue` (max-w-mobile, 하단 nav), B2B/B2G = `layouts/AdminLayout.vue` (좌측 사이드바)
- **페이지 위치:** `pages/`, 라우터: `router/index.ts`

---

## 2. 공통 UI 컴포넌트 (`components/ui/`)

| 컴포넌트 | Props 핵심 | 비고 |
|---|---|---|
| `BaseButton` | `variant: solid\|outline\|ghost`, `color: primary\|secondary\|error\|warning`, `size: sm\|md\|lg`, `loading`, `fullWidth` | `#icon-left`, `#icon-right` 슬롯 |
| `BaseInput` | `v-model`, `label`, `error`, `hint`, `type`, `required`, `multiline`, `rows` | 에러 시 자동 빨간 테두리 |
| `BaseModal` | `v-model`, `title`, `size: sm\|md\|lg\|full`, `closeOnOverlay` | `#header`, `#footer` 슬롯. Teleport to body, body scroll lock, ESC close |
| `BaseBadge` | `color: primary\|secondary\|success\|warning\|error\|slate`, `size: sm\|md`, `dot` | |
| `BaseAvatar` | `src`, `name`, `size: sm\|md\|lg` | 이미지 없으면 이니셜 |
| `BaseCard` | `padding`, `shadow` | 일반 카드 래퍼 |

**공통 레이아웃 컴포넌트 (`components/common/`)**
- `AppHeader` — `title`, `showBack`, `showNotification`, `notificationCount` prop. 알림 뱃지 자동 표시.
- `AppNavigation` — B2C 하단 탭 바 (홈/스캔/리포트/프로필). 라우터 연동.

---

## 3. 전역 타입 (`types/index.ts`)

모든 타입은 이 파일 하나에 집중. 추가 시 여기에 append.

**주요 타입 목록:**
```
UserRole: 'B2C' | 'B2B_HOSPITAL' | 'B2B_INSURANCE' | 'B2G' | 'ADMIN'
User, Pet, PetSpecies, PetGender, RegistrationStatus
BiometricIdentity, RFIDToken
BCSScore (1~9), HealthScan, ScanType, ScanSession, ScanJob
MedicalVisitType, MedicalVisit, Prescription, VaccinationType, Vaccination
CreateMedicalVisitRequest, CreatePrescriptionRequest, CreateVaccinationRequest
AdminPetListItem
ApiSuccessResponse<T>, ApiErrorResponse, PaginationMeta, PaginationParams
```

---

## 4. Pinia 스토어 (`stores/`)

| 스토어 | 파일 | 핵심 상태 / 액션 |
|---|---|---|
| `useAuthStore` | `authStore.ts` | `user`, `token`, `isAuthenticated`, `isAdmin`, `isB2CUser` / `login()`, `logout()`, `restoreSession()` |
| `usePetStore` | `petStore.ts` | `pets[]`, `selectedPetId`, `selectedPet`, `verifiedPets`, `pendingPets` / `fetchPets()`, `fetchPetById()`, `createPet()`, `updatePet()`, `selectPet()`, `markPetAsVerified()` |
| `useScanStore` | `scanStore.ts` | `currentSession`, `scanCache (Map)`, `isLoading`, `uploadProgress` / `fetchScansByPetId()`, `requestScan()`, `startSession()`, `setCapturedBlob()`, `simulateUpload()` |
| `useMedicalStore` | `medicalStore.ts` | `visits`, `prescriptions`, `vaccinations` (현재 펫 computed), `upcomingVaccinationCount` / `fetchAllMedicalRecords()`, `addVisit()`, `addPrescription()`, `addVaccination()` |
| `useAdminStore` | `adminStore.ts` | `petList`, `filteredList`, `pagedList`, `statusFilter`, `currentPage` / `fetchOrgPets()`, `setSearch()`, `setStatusFilter()`, `setPage()` |

**캐시 패턴:** `Map<petId, T[]>` 구조. `forceRefresh=false` 시 캐시 히트 즉시 반환.

---

## 5. Composables (`composables/`)

| Composable | 반환값 핵심 |
|---|---|
| `useCamera()` | `isRecording`, `hasPermission`, `stream` / `startCamera(facing)`, `stopCamera()`, `startRecording()`, `stopRecording(): Promise<Blob>`, `captureImage()`, `switchCamera()` |
| `useAudioRecorder()` | `isRecording`, `hasPermission`, `duration` / `startMicrophone()`, `startRecording()`, `stopRecording(): Promise<Blob>`, `stopMicrophone()` |
| `useS3Upload()` | `isUploading`, `progress` / `upload(file, {filename, purpose}): Promise<s3Key>` — purpose: `biometric\|health_scan\|voice_emotion` |
| `useToast()` | `success(title, msg)`, `error(title, msg)`, `warning(title, msg)` |

---

## 6. Mock 아키텍처 (`mocks/`)

실제 API 연동 전까지 스토어가 직접 Mock 함수를 호출. API 연동 시 `services/` 로 교체.

| 파일 | 제공 함수 |
|---|---|
| `mocks/users.ts` | `mockLogin()`, `mockGetUserById()` |
| `mocks/pets.ts` | `mockGetPetsByOwner()`, `mockGetPetById()`, `mockCreatePet()`, `mockUpdatePet()` |
| `mocks/scans.ts` | `mockGetScansByPetId()`, `mockGetScanById()`, `mockCreateScan()`, `getBCSDescription()` |
| `mocks/medicalRecords.ts` | `mockGetMedicalVisitsByPetId()`, `mockGetPrescriptionsByPetId()`, `mockGetVaccinationsByPetId()` |
| `mocks/organizations.ts` | `mockGetOrgPets()`, `mockGetOrgById()` |

**교체 방법:** `stores/` 내 Mock 호출 라인을 `services/` 함수로 swap. `services/http.ts` interceptor 주석 해제.

---

## 7. HTTP 클라이언트 (`services/http.ts`)

```ts
// baseURL: VITE_API_BASE_URL (기본값: http://localhost:8000)
// 실제 연동 시 두 interceptor 주석 해제:
// - request: Authorization Bearer token 주입
// - response: success:false → toast 에러, 401 → logout + redirect
```

Service 파일 패턴 (`services/petService.ts` 등): 모두 주석 처리된 API stub 보유.

---

## 8. 라우터 패턴 (`router/index.ts`)

```ts
// route.meta 구조:
{
  requiresAuth: boolean,
  requiredRoles: UserRole[],      // 역할 기반 접근 제어
  layout: 'mobile' | 'admin' | 'none',
  title: string,                  // AppHeader 타이틀
  showBack: boolean,
  showNotification: boolean,
  hideNavigation: boolean,        // 카메라/녹음 전체화면 시
}
```

**전체화면 페이지** (카메라/음성 녹음): `layout: 'none'`, `hideNavigation: true`

**주요 B2C 경로:**
```
/dashboard, /pets, /pets/:id, /pets/register
/scan, /scan/camera, /scan/voice, /scan/loading, /scan/report/:id
/reports, /profile
```

---

## 9. 디자인 토큰 (TailwindCSS)

```
primary: Deep Blue  — primary-50 ~ primary-900
secondary: Mint/Green — secondary-50 ~ secondary-900
error, warning, success — 각 50~900 팔레트
max-w-mobile: 600px (B2C 최대 너비)
```

**애니메이션:** `animate-confetti` (파티클 낙하), `animate-confetti-pop` (아이콘 팝업), `animate-fade-in`, `animate-slide-up` (모달)

---

## 10. 스캔 플로우

```
ScanOptionsPage → (VOICE 단독이면) ScanVoicePage | (나머지) ScanCameraPage
→ ScanLoadingPage (simulateUpload + requestScan)
→ ScanReportPage (/scan/report/:id)
```

- `scanStore.startSession(petId, scanTypes)` 호출 후 카메라/음성 페이지 진입
- 촬영 완료: `scanStore.setCapturedBlob(blob)` → `/scan/loading` push
- 스캔 보고서 링크: `/scan/report/:id` (이전 `/scans/:id` 경로 아님)

---

## 11. 의료 기록 모달 컴포넌트 (`components/medical/`)

| 컴포넌트 | emit |
|---|---|
| `AddVisitModal` | `submit: CreateMedicalVisitRequest` |
| `AddPrescriptionModal` | `submit: CreatePrescriptionRequest` |
| `AddVaccinationModal` | `submit: CreateVaccinationRequest` |

모두 `v-model` (boolean) + `@submit` 패턴. 수신 측에서 `medicalStore.addVisit/addPrescription/addVaccination(petId, data)` 호출.

---

## 12. 알림 카운트 연결

`MobileLayout` → `medicalStore.upcomingVaccinationCount` → `AppHeader :notification-count`

30일 이내 접종 예정 건수를 모든 캐시된 펫 대상으로 집계.
