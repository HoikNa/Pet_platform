// ============================================================
// Service - 헬스 스캔 (Scan Service)
// 실제 API 연동 시 주석 해제 후 stores/scanStore.ts에서 호출
// 현재: mocks/scans.ts의 Mock 함수로 대체됨
// ============================================================

// import http from './http'
// import type { HealthScan, CreateScanRequest, PresignedUrlRequest, PresignedUrlResponse, ScanJob } from '@/types'

/**
 * S3 Presigned URL 발급 요청
 * 실제 API: POST /media/presigned-url
 */
// export async function getPresignedUrl(payload: PresignedUrlRequest): Promise<PresignedUrlResponse> {
//   const res = await http.post('/media/presigned-url', payload)
//   return res.data.data
// }

/**
 * 생체 인식 데이터 유효성 검증 트리거 (비동기 AI 큐)
 * 실제 API: POST /pets/{pet_id}/biometrics
 * 응답: 202 Accepted
 */
// export async function triggerBiometricValidation(petId: string, s3Key: string): Promise<{ job_id: string }> {
//   const res = await http.post(`/pets/${petId}/biometrics`, { s3_key: s3Key })
//   return res.data.data
// }

/**
 * 반려동물 헬스 스캔 목록 조회
 * 실제 API: GET /pets/{pet_id}/scans
 */
// export async function getScansByPetId(petId: string, params?: PaginationParams): Promise<{ scans: HealthScan[]; meta: PaginationMeta }> {
//   const res = await http.get(`/pets/${petId}/scans`, { params })
//   return { scans: res.data.data, meta: res.data.meta }
// }

/**
 * 신규 헬스 스캔 요청 (AI 분석 비동기 처리)
 * 실제 API: POST /pets/{pet_id}/scans
 * 응답: 202 Accepted + Job ID (SQS -> Worker Lambda -> FCM 알림)
 */
// export async function requestScan(petId: string, payload: CreateScanRequest): Promise<ScanJob> {
//   const res = await http.post(`/pets/${petId}/scans`, payload)
//   return res.data.data
// }

/**
 * 특정 스캔 상세 조회
 * 실제 API: GET /scans/{scan_id}
 */
// export async function getScanById(scanId: string): Promise<HealthScan> {
//   const res = await http.get(`/scans/${scanId}`)
//   return res.data.data
// }

export {}
