// ============================================================
// Pinia 스토어 - 반려동물 (Pet Store)
// 현재 선택된 반려동물 식별자, 기본 정보 캐싱 처리
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pet, CreatePetRequest } from '@/types'
import { mockGetPetsByOwner, mockGetPetById, mockCreatePet } from '@/mocks/pets'
import { useAuthStore } from './authStore'

export const usePetStore = defineStore('pet', () => {
  // ---- 상태 ----
  const pets = ref<Pet[]>([])
  const selectedPetId = ref<string | null>(null)
  const isLoading = ref(false)

  // ---- 계산된 속성 ----
  const selectedPet = computed<Pet | null>(() => {
    if (!selectedPetId.value) return null
    return pets.value.find(p => p.id === selectedPetId.value) ?? null
  })

  const verifiedPets = computed(() => pets.value.filter(p => p.registration_status === 'VERIFIED'))
  const pendingPets = computed(() => pets.value.filter(p => p.registration_status === 'PENDING'))

  // ---- 액션 ----

  /**
   * 소유자의 반려동물 목록 불러오기
   * 실제 API 연동 시 GET /pets 으로 교체
   */
  async function fetchPets(): Promise<void> {
    const authStore = useAuthStore()
    if (!authStore.user) return

    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      pets.value = mockGetPetsByOwner(authStore.user.id)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 반려동물 ID로 상세 조회
   * 실제 API 연동 시 GET /pets/{pet_id} 으로 교체
   */
  async function fetchPetById(petId: string): Promise<Pet | null> {
    // 캐시 우선 조회
    const cached = pets.value.find(p => p.id === petId)
    if (cached) return cached

    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      const pet = mockGetPetById(petId)
      if (pet) {
        // 캐시에 추가
        const exists = pets.value.findIndex(p => p.id === petId)
        if (exists === -1) pets.value.push(pet)
      }
      return pet
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 신규 반려동물 등록
   * 실제 API 연동 시 POST /pets 으로 교체
   */
  async function createPet(data: CreatePetRequest): Promise<Pet> {
    const authStore = useAuthStore()
    if (!authStore.user) throw new Error('로그인이 필요합니다')

    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      const newPet = mockCreatePet(data, authStore.user.id)
      pets.value.push(newPet)
      return newPet
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 현재 선택 반려동물 설정
   */
  function selectPet(petId: string | null): void {
    selectedPetId.value = petId
  }

  /**
   * 반려동물 등록 상태를 VERIFIED로 업데이트 (생체 인식 완료 후)
   */
  function markPetAsVerified(petId: string): void {
    const pet = pets.value.find(p => p.id === petId)
    if (pet) {
      pet.registration_status = 'VERIFIED'
    }
  }

  /**
   * 스토어 초기화
   */
  function reset(): void {
    pets.value = []
    selectedPetId.value = null
  }

  return {
    pets,
    selectedPetId,
    isLoading,
    selectedPet,
    verifiedPets,
    pendingPets,
    fetchPets,
    fetchPetById,
    createPet,
    selectPet,
    markPetAsVerified,
    reset,
  }
})
