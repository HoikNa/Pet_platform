// ============================================================
// Mock 데이터 - 반려동물 (Pets)
// 실제 API 연동 시 services/petService.ts로 교체
// ============================================================

import type { Pet, BiometricIdentity, RFIDToken } from '@/types'

/** 데모용 반려동물 목록 */
export const MOCK_PETS: Pet[] = [
  {
    id: 'pet-001',
    owner_id: 'user-b2c-001',
    name: '뭉치',
    species: 'DOG',
    breed: '말티즈',
    birth_date: '2020-03-15',
    gender: 'MALE',
    is_neutered: true,
    registration_status: 'VERIFIED',
    weight: 3.2,
    profile_image_url: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=400&h=400&fit=crop',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-06-01T12:00:00Z',
  },
  {
    id: 'pet-002',
    owner_id: 'user-b2c-001',
    name: '두부',
    species: 'CAT',
    breed: '코리안숏헤어',
    birth_date: '2021-07-22',
    gender: 'FEMALE',
    is_neutered: true,
    registration_status: 'VERIFIED',
    weight: 4.1,
    profile_image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-06-01T12:00:00Z',
  },
  {
    id: 'pet-003',
    owner_id: 'user-b2c-001',
    name: '콩이',
    species: 'DOG',
    breed: '푸들',
    birth_date: '2022-11-05',
    gender: 'FEMALE',
    is_neutered: false,
    registration_status: 'PENDING',
    weight: 5.8,
    profile_image_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop',
    created_at: '2024-05-15T10:00:00Z',
    updated_at: '2024-05-15T10:00:00Z',
  },
]

/** B2B/B2G 포털용 추가 반려동물 (병원/지자체 연동) */
export const MOCK_ORG_PETS: Pet[] = [
  ...MOCK_PETS,
  {
    id: 'pet-004',
    owner_id: 'user-b2c-002',
    name: '초코',
    species: 'DOG',
    breed: '포메라니안',
    birth_date: '2019-06-10',
    gender: 'MALE',
    is_neutered: true,
    registration_status: 'VERIFIED',
    weight: 2.5,
    profile_image_url: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400&h=400&fit=crop',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-06-01T12:00:00Z',
  },
  {
    id: 'pet-005',
    owner_id: 'user-b2c-003',
    name: '나비',
    species: 'CAT',
    breed: '페르시안',
    birth_date: '2020-09-18',
    gender: 'FEMALE',
    is_neutered: true,
    registration_status: 'VERIFIED',
    weight: 3.8,
    profile_image_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop',
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-06-01T12:00:00Z',
  },
  {
    id: 'pet-006',
    owner_id: 'user-b2c-004',
    name: '보리',
    species: 'DOG',
    breed: '비글',
    birth_date: '2021-02-28',
    gender: 'MALE',
    is_neutered: false,
    registration_status: 'PENDING',
    weight: 11.2,
    profile_image_url: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&h=400&fit=crop',
    created_at: '2024-04-01T10:00:00Z',
    updated_at: '2024-04-01T10:00:00Z',
  },
]

/** 데모용 생체 인식 데이터 */
export const MOCK_BIOMETRICS: BiometricIdentity[] = [
  {
    id: 'bio-001',
    pet_id: 'pet-001',
    scan_source_url: 's3://pet-id-uploads/biometrics/pet-001/scan-001.jpg',
    quality_score: 97.3,
    certified_by: '한국반려동물등록협회',
    created_at: '2024-01-20T10:30:00Z',
  },
  {
    id: 'bio-002',
    pet_id: 'pet-002',
    scan_source_url: 's3://pet-id-uploads/biometrics/pet-002/scan-001.jpg',
    quality_score: 94.8,
    certified_by: '한국반려동물등록협회',
    created_at: '2024-02-10T10:30:00Z',
  },
]

/** 데모용 RFID 토큰 */
export const MOCK_RFID_TOKENS: RFIDToken[] = [
  {
    id: 'rfid-001',
    pet_id: 'pet-001',
    serial: 'RFID-20240120-001',
    issued_at: '2024-01-20T11:00:00Z',
    expires_at: '2025-01-20T11:00:00Z',
    status: 'ACTIVE',
  },
]

/**
 * 특정 소유자의 반려동물 목록 조회
 * 실제 API 연동 시 GET /pets 으로 교체
 */
export function mockGetPetsByOwner(ownerId: string): Pet[] {
  return MOCK_PETS.filter(p => p.owner_id === ownerId)
}

/**
 * 반려동물 ID로 상세 조회
 * 실제 API 연동 시 GET /pets/{pet_id} 으로 교체
 */
export function mockGetPetById(petId: string): Pet | null {
  return [...MOCK_PETS, ...MOCK_ORG_PETS].find(p => p.id === petId) ?? null
}

/**
 * 반려동물 정보 수정 (Mock)
 * 실제 API 연동 시 PATCH /pets/{pet_id} 으로 교체
 */
export function mockUpdatePet(petId: string, data: Partial<Pick<Pet, 'name' | 'birth_date' | 'weight'>>): Pet | null {
  const allPets = [...MOCK_PETS, ...MOCK_ORG_PETS]
  const pet = allPets.find(p => p.id === petId)
  if (!pet) return null
  if (data.name !== undefined) pet.name = data.name
  if (data.birth_date !== undefined) pet.birth_date = data.birth_date
  if (data.weight !== undefined) pet.weight = data.weight
  pet.updated_at = new Date().toISOString()
  return pet
}

/**
 * 신규 반려동물 등록 (Mock)
 * 실제 API 연동 시 POST /pets 으로 교체
 */
export function mockCreatePet(data: Partial<Pet>, ownerId: string): Pet {
  const newPet: Pet = {
    id: `pet-${Date.now()}`,
    owner_id: ownerId,
    name: data.name ?? '이름 없음',
    species: data.species ?? 'DOG',
    breed: data.breed ?? '혼합',
    birth_date: data.birth_date ?? '2023-01-01',
    gender: data.gender ?? 'MALE',
    is_neutered: data.is_neutered ?? false,
    registration_status: 'PENDING',
    weight: data.weight,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  MOCK_PETS.push(newPet)
  return newPet
}
