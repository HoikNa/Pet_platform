// ============================================================
// Service - 진료 기록 (Medical Service)
// 실제 API 연동 시 주석 해제 후 stores/medicalStore.ts에서 호출
// 현재: mocks/medicalRecords.ts의 Mock 함수로 대체됨
// ============================================================

// import http from './http'
// import type {
//   MedicalVisit, Prescription, Vaccination,
//   CreateMedicalVisitRequest, CreatePrescriptionRequest, CreateVaccinationRequest,
//   PaginationParams,
// } from '@/types'

/**
 * 진료 이력 목록 조회
 * 실제 API: GET /pets/{pet_id}/medical-visits
 */
// export async function getMedicalVisits(petId: string, params?: PaginationParams) {
//   const res = await http.get(`/pets/${petId}/medical-visits`, { params })
//   return { visits: res.data.data, meta: res.data.meta }
// }

/**
 * 진료 기록 추가
 * 실제 API: POST /pets/{pet_id}/medical-visits
 */
// export async function createMedicalVisit(petId: string, payload: CreateMedicalVisitRequest): Promise<MedicalVisit> {
//   const res = await http.post(`/pets/${petId}/medical-visits`, payload)
//   return res.data.data
// }

/**
 * 진료 기록 수정
 * 실제 API: PATCH /pets/{pet_id}/medical-visits/{visit_id}
 */
// export async function updateMedicalVisit(petId: string, visitId: string, payload: Partial<CreateMedicalVisitRequest>): Promise<MedicalVisit> {
//   const res = await http.patch(`/pets/${petId}/medical-visits/${visitId}`, payload)
//   return res.data.data
// }

/**
 * 진료 기록 삭제 (Soft Delete)
 * 실제 API: DELETE /pets/{pet_id}/medical-visits/{visit_id}
 */
// export async function deleteMedicalVisit(petId: string, visitId: string): Promise<void> {
//   await http.delete(`/pets/${petId}/medical-visits/${visitId}`)
// }

/**
 * 처방 이력 목록 조회
 * 실제 API: GET /pets/{pet_id}/prescriptions
 */
// export async function getPrescriptions(petId: string, params?: PaginationParams) {
//   const res = await http.get(`/pets/${petId}/prescriptions`, { params })
//   return { prescriptions: res.data.data, meta: res.data.meta }
// }

/**
 * 처방 기록 추가
 * 실제 API: POST /pets/{pet_id}/prescriptions
 */
// export async function createPrescription(petId: string, payload: CreatePrescriptionRequest): Promise<Prescription> {
//   const res = await http.post(`/pets/${petId}/prescriptions`, payload)
//   return res.data.data
// }

/**
 * 처방 기록 삭제 (Soft Delete)
 * 실제 API: DELETE /pets/{pet_id}/prescriptions/{prescription_id}
 */
// export async function deletePrescription(petId: string, prescriptionId: string): Promise<void> {
//   await http.delete(`/pets/${petId}/prescriptions/${prescriptionId}`)
// }

/**
 * 접종 이력 목록 조회
 * 실제 API: GET /pets/{pet_id}/vaccinations
 */
// export async function getVaccinations(petId: string, params?: PaginationParams) {
//   const res = await http.get(`/pets/${petId}/vaccinations`, { params })
//   return { vaccinations: res.data.data, meta: res.data.meta }
// }

/**
 * 접종 기록 추가
 * 실제 API: POST /pets/{pet_id}/vaccinations
 */
// export async function createVaccination(petId: string, payload: CreateVaccinationRequest): Promise<Vaccination> {
//   const res = await http.post(`/pets/${petId}/vaccinations`, payload)
//   return res.data.data
// }

/**
 * 접종 기록 삭제 (Soft Delete)
 * 실제 API: DELETE /pets/{pet_id}/vaccinations/{vaccination_id}
 */
// export async function deleteVaccination(petId: string, vaccinationId: string): Promise<void> {
//   await http.delete(`/pets/${petId}/vaccinations/${vaccinationId}`)
// }

export {}
