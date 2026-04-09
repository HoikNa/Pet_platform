// ============================================================
// Pinia 스토어 - 진료 기록 (Medical Store)
// 반려동물별 진료·처방·접종 이력 상태 관리 (멀티 펫 캐시)
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  MedicalVisit,
  Prescription,
  Vaccination,
  CreateMedicalVisitRequest,
  CreatePrescriptionRequest,
  CreateVaccinationRequest,
} from '@/types'
import {
  mockGetMedicalVisitsByPetId,
  mockGetPrescriptionsByPetId,
  mockGetVaccinationsByPetId,
} from '@/mocks/medicalRecords'

export const useMedicalStore = defineStore('medical', () => {
  // ---- 멀티 펫 캐시 ----
  const visitsCache = ref<Map<string, MedicalVisit[]>>(new Map())
  const prescriptionsCache = ref<Map<string, Prescription[]>>(new Map())
  const vaccinationsCache = ref<Map<string, Vaccination[]>>(new Map())

  // ---- 현재 조회 중인 펫 ID ----
  const currentPetId = ref<string | null>(null)
  const isLoading = ref(false)

  // ---- 현재 펫의 데이터 (computed) ----
  const visits = computed<MedicalVisit[]>(() =>
    currentPetId.value ? (visitsCache.value.get(currentPetId.value) ?? []) : []
  )
  const prescriptions = computed<Prescription[]>(() =>
    currentPetId.value ? (prescriptionsCache.value.get(currentPetId.value) ?? []) : []
  )
  const vaccinations = computed<Vaccination[]>(() =>
    currentPetId.value ? (vaccinationsCache.value.get(currentPetId.value) ?? []) : []
  )

  // ---- 전역 알림: 30일 이내 접종 예정 건수 ----
  const upcomingVaccinationCount = computed<number>(() => {
    const today = new Date()
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    let count = 0
    for (const vacs of vaccinationsCache.value.values()) {
      count += vacs.filter(v => {
        if (!v.next_due_date) return false
        const due = new Date(v.next_due_date)
        return due >= today && due <= thirtyDaysLater
      }).length
    }
    return count
  })

  // ---- 액션 ----

  /**
   * 특정 반려동물의 모든 진료 기록 로드 (캐시 히트 시 생략)
   * 실제 API 연동 시 각 엔드포인트로 교체
   */
  async function fetchAllMedicalRecords(petId: string, forceRefresh = false): Promise<void> {
    if (!forceRefresh && visitsCache.value.has(petId)) {
      currentPetId.value = petId
      return
    }
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 0))
      visitsCache.value.set(petId, mockGetMedicalVisitsByPetId(petId))
      prescriptionsCache.value.set(petId, mockGetPrescriptionsByPetId(petId))
      vaccinationsCache.value.set(petId, mockGetVaccinationsByPetId(petId))
      currentPetId.value = petId
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 진료 기록 추가
   * 실제 API 연동 시 POST /pets/{pet_id}/medical-visits 로 교체
   */
  async function addVisit(petId: string, data: CreateMedicalVisitRequest): Promise<MedicalVisit> {
    await new Promise(resolve => setTimeout(resolve, 0))
    const newVisit: MedicalVisit = {
      id: `visit-${Date.now()}`,
      pet_id: petId,
      ...data,
      created_at: new Date().toISOString(),
    }
    const current = visitsCache.value.get(petId) ?? []
    visitsCache.value.set(petId, [newVisit, ...current])
    return newVisit
  }

  /**
   * 처방 기록 추가
   * 실제 API 연동 시 POST /pets/{pet_id}/prescriptions 로 교체
   */
  async function addPrescription(petId: string, data: CreatePrescriptionRequest): Promise<Prescription> {
    await new Promise(resolve => setTimeout(resolve, 0))
    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      pet_id: petId,
      ...data,
      created_at: new Date().toISOString(),
    }
    const current = prescriptionsCache.value.get(petId) ?? []
    prescriptionsCache.value.set(petId, [newRx, ...current])
    return newRx
  }

  /**
   * 접종 기록 추가
   * 실제 API 연동 시 POST /pets/{pet_id}/vaccinations 로 교체
   */
  async function addVaccination(petId: string, data: CreateVaccinationRequest): Promise<Vaccination> {
    await new Promise(resolve => setTimeout(resolve, 0))
    const newVac: Vaccination = {
      id: `vac-${Date.now()}`,
      pet_id: petId,
      ...data,
      created_at: new Date().toISOString(),
    }
    const current = vaccinationsCache.value.get(petId) ?? []
    vaccinationsCache.value.set(petId, [newVac, ...current])
    return newVac
  }

  /** 전체 캐시 초기화 */
  function reset(): void {
    visitsCache.value.clear()
    prescriptionsCache.value.clear()
    vaccinationsCache.value.clear()
    currentPetId.value = null
  }

  return {
    currentPetId,
    isLoading,
    visits,
    prescriptions,
    vaccinations,
    upcomingVaccinationCount,
    fetchAllMedicalRecords,
    addVisit,
    addPrescription,
    addVaccination,
    reset,
  }
})
