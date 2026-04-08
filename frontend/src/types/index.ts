// ============================================================
// Pet-ID AI 플랫폼 - 전역 타입 정의
// ============================================================

// ------------------------------------------------------------
// 공통 API 응답 타입
// ------------------------------------------------------------

/** API 성공 응답 */
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

/** API 실패 응답 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown[]
  }
}

/** 페이지네이션 메타 정보 */
export interface PaginationMeta {
  page: number
  limit: number
  total_count: number
  total_pages: number
}

/** 페이지네이션 쿼리 파라미터 */
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
}

// ------------------------------------------------------------
// 사용자 (Users)
// ------------------------------------------------------------

/** 사용자 역할 */
export type UserRole = 'B2C' | 'B2B_HOSPITAL' | 'B2B_INSURANCE' | 'B2G' | 'ADMIN'

/** 사용자 프로필 */
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  social_key?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

/** 로그인 요청 (소셜) */
export interface SocialLoginRequest {
  provider: 'kakao'
  token: string
}

/** 로그인 응답 */
export interface AuthTokens {
  access_token: string
  token_type: 'Bearer'
  user: User
}

// ------------------------------------------------------------
// 반려동물 (Pets)
// ------------------------------------------------------------

/** 반려동물 등록 상태 */
export type PetRegistrationStatus = 'PENDING' | 'VERIFIED'

/** 반려동물 성별 */
export type PetGender = 'MALE' | 'FEMALE'

/** 반려동물 종 */
export type PetSpecies = 'DOG' | 'CAT' | 'OTHER'

/** 반려동물 기본 정보 */
export interface Pet {
  id: string
  owner_id: string
  name: string
  species: PetSpecies
  breed: string
  birth_date: string
  gender: PetGender
  is_neutered: boolean
  registration_status: PetRegistrationStatus
  weight?: number
  profile_image_url?: string
  created_at: string
  updated_at: string
}

/** 반려동물 등록 요청 */
export interface CreatePetRequest {
  name: string
  species: PetSpecies
  breed: string
  birth_date: string
  gender: PetGender
  is_neutered: boolean
  weight?: number
}

/** 반려동물 정보 수정 요청 */
export interface UpdatePetRequest {
  name?: string
  birth_date?: string
  weight?: number
}

// ------------------------------------------------------------
// 생체 인식 정보 (Biometric Identities)
// ------------------------------------------------------------

/** 생체 인식 데이터 */
export interface BiometricIdentity {
  id: string
  pet_id: string
  scan_source_url: string
  quality_score: number
  certified_by?: string
  created_at: string
}

/** S3 Presigned URL 요청 */
export interface PresignedUrlRequest {
  filename: string
  file_type: string
  purpose: 'biometric' | 'health_scan' | 'voice_emotion'
}

/** S3 Presigned URL 응답 */
export interface PresignedUrlResponse {
  upload_url: string
  s3_key: string
  expires_in: number
}

// ------------------------------------------------------------
// 헬스 스캔 리포트 (Health Scans)
// ------------------------------------------------------------

/** BCS 점수 (1~9단계) */
export type BCSScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** 스캔 타입 */
export type ScanType = 'BCS' | 'AGING' | 'GAIT' | 'VOICE'

/** 헬스 스캔 리포트 */
export interface HealthScan {
  id: string
  pet_id: string
  scan_date: string
  bcs_score: BCSScore
  gait_score: number
  eye_clarity_score: number
  voice_emotion_score?: number
  ai_comment: string
  attachment_urls?: string[]
  scan_types: ScanType[]
  created_at: string
}

/** 헬스 스캔 요청 */
export interface CreateScanRequest {
  s3_video_key?: string
  s3_image_key?: string
  scan_types: ScanType[]
}

/** 비동기 스캔 작업 상태 */
export interface ScanJob {
  job_id: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  pet_id: string
  created_at: string
}

// ------------------------------------------------------------
// 기관 및 B2B (Organizations)
// ------------------------------------------------------------

/** 기관 타입 */
export type OrganizationType = 'HOSPITAL' | 'INSURANCE' | 'SHELTER' | 'GOVERNMENT'

/** 기관 정보 */
export interface Organization {
  id: string
  name: string
  type: OrganizationType
  contact: string
  address?: string
  created_at: string
}

/** 기관-사용자 멤버십 */
export interface Membership {
  org_id: string
  user_id: string
  permission_level: 'READ' | 'WRITE' | 'ADMIN'
  created_at: string
}

/** B2B/B2G 관리자 포털 - 환축 목록 아이템 */
export interface AdminPetListItem {
  pet: Pet
  owner: Pick<User, 'id' | 'name' | 'phone' | 'email'>
  latest_scan?: HealthScan
  biometric?: Pick<BiometricIdentity, 'id' | 'quality_score'>
}

// ------------------------------------------------------------
// 진료 기록 (Medical Records)
// ------------------------------------------------------------

/** 진료 유형 */
export type MedicalVisitType = 'CHECK_UP' | 'TREATMENT' | 'SURGERY' | 'EMERGENCY'

/** 진료 이력 */
export interface MedicalVisit {
  id: string
  pet_id: string
  visit_date: string
  hospital_name: string
  vet_name?: string
  visit_type: MedicalVisitType
  chief_complaint: string
  diagnosis: string
  treatment_notes?: string
  follow_up_date?: string
  cost?: number
  created_at: string
}

/** 약 처방 이력 */
export interface Prescription {
  id: string
  pet_id: string
  medical_visit_id?: string
  prescribed_date: string
  hospital_name: string
  vet_name?: string
  drug_name: string
  dosage: string
  frequency: string
  duration_days: number
  purpose?: string
  notes?: string
  created_at: string
}

/** 접종 유형 */
export type VaccinationType = 'CORE' | 'NON_CORE' | 'RABIES'

/** 접종 이력 */
export interface Vaccination {
  id: string
  pet_id: string
  vaccine_name: string
  vaccination_type: VaccinationType
  vaccinated_date: string
  next_due_date?: string
  hospital_name: string
  vet_name?: string
  batch_number?: string
  manufacturer?: string
  created_at: string
}

/** 의료 기록 요청 */
export interface CreateMedicalVisitRequest {
  visit_date: string
  hospital_name: string
  vet_name?: string
  visit_type: MedicalVisitType
  chief_complaint: string
  diagnosis: string
  treatment_notes?: string
  follow_up_date?: string
  cost?: number
}

export interface CreatePrescriptionRequest {
  medical_visit_id?: string
  prescribed_date: string
  hospital_name: string
  vet_name?: string
  drug_name: string
  dosage: string
  frequency: string
  duration_days: number
  purpose?: string
  notes?: string
}

export interface CreateVaccinationRequest {
  vaccine_name: string
  vaccination_type: VaccinationType
  vaccinated_date: string
  next_due_date?: string
  hospital_name: string
  vet_name?: string
  batch_number?: string
  manufacturer?: string
}

// ------------------------------------------------------------
// RFID 토큰 (RFID Tokens)
// ------------------------------------------------------------

/** RFID 토큰 상태 */
export type RFIDTokenStatus = 'ACTIVE' | 'REVOKED'

/** RFID 웨어러블 토큰 */
export interface RFIDToken {
  id: string
  pet_id: string
  serial: string
  issued_at: string
  expires_at: string
  status: RFIDTokenStatus
}

// ------------------------------------------------------------
// 프론트엔드 전용 타입
// ------------------------------------------------------------

/** Toast 알림 타입 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/** Toast 알림 */
export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

/** 카메라 스캔 세션 */
export interface ScanSession {
  petId: string
  scanTypes: ScanType[]
  capturedBlob?: Blob
  uploadedS3Key?: string
  presignedUrl?: string
}

/** 라우트 메타 */
export interface RouteMeta {
  requiresAuth?: boolean
  requiredRoles?: UserRole[]
  layout?: 'mobile' | 'admin'
  title?: string
}
