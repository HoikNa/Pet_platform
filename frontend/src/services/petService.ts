// ============================================================
// Service - 반려동물 (Pet Service)
// 실제 API 연동 시 주석 해제 후 stores/petStore.ts에서 호출
// 현재: mocks/pets.ts의 Mock 함수로 대체됨
// ============================================================

// import http from './http'
// import type { Pet, CreatePetRequest, UpdatePetRequest, PaginationParams } from '@/types'

/**
 * 반려동물 목록 조회 (페이지네이션/필터 포함)
 * 실제 API: GET /pets
 */
// export async function getPets(params?: PaginationParams): Promise<{ pets: Pet[]; meta: PaginationMeta }> {
//   const res = await http.get('/pets', { params })
//   return { pets: res.data.data, meta: res.data.meta }
// }

/**
 * 반려동물 상세 조회
 * 실제 API: GET /pets/{pet_id}
 */
// export async function getPetById(petId: string): Promise<Pet> {
//   const res = await http.get(`/pets/${petId}`)
//   return res.data.data
// }

/**
 * 신규 반려동물 등록
 * 실제 API: POST /pets
 */
// export async function createPet(payload: CreatePetRequest): Promise<Pet> {
//   const res = await http.post('/pets', payload)
//   return res.data.data
// }

/**
 * 반려동물 정보 수정
 * 실제 API: PATCH /pets/{pet_id}
 */
// export async function updatePet(petId: string, payload: UpdatePetRequest): Promise<Pet> {
//   const res = await http.patch(`/pets/${petId}`, payload)
//   return res.data.data
// }

export {}
