// ============================================================
// Mock 데이터 - 유기동물 & 동물 등록 신청 (Shelter & Registration)
// 실제 API 연동 시 services/govService.ts로 교체
// ============================================================

import type { ShelterReport, RegistrationApplication } from '@/types'

// ------------------------------------------------------------
// 유기동물 신고
// ------------------------------------------------------------
export const MOCK_SHELTER_REPORTS: ShelterReport[] = [
  {
    id: 'shelter-001',
    report_date: '2026-04-08',
    location: '서울시 강남구 역삼동 공원 인근',
    species: 'DOG',
    breed: '말티즈 추정',
    description: '흰색 소형견. 목줄 없음. 건강 상태 양호.',
    status: 'SHELTERED',
    shelter_name: '강남구 동물보호센터',
    contact: '010-1111-2222',
    created_at: '2026-04-08T09:15:00Z',
    updated_at: '2026-04-08T14:00:00Z',
  },
  {
    id: 'shelter-002',
    pet_id: 'pet-003',
    report_date: '2026-04-06',
    location: '서울시 강남구 삼성동 아파트 단지',
    species: 'CAT',
    breed: '코리안 숏헤어',
    description: '등록 칩 확인됨. 보호자 연락 중.',
    status: 'RETURNED',
    contact: '010-3333-4444',
    created_at: '2026-04-06T17:30:00Z',
    updated_at: '2026-04-07T11:00:00Z',
  },
  {
    id: 'shelter-003',
    report_date: '2026-04-03',
    location: '서울시 강남구 논현동 도로변',
    species: 'DOG',
    breed: '믹스견',
    description: '중형견. 다리 부상 의심. 즉시 구조 필요.',
    status: 'SHELTERED',
    shelter_name: '강남구 동물보호센터',
    contact: '010-5555-6666',
    created_at: '2026-04-03T13:00:00Z',
    updated_at: '2026-04-03T15:00:00Z',
  },
  {
    id: 'shelter-004',
    report_date: '2026-03-28',
    location: '서울시 강남구 청담동 공원',
    species: 'CAT',
    breed: '페르시안 추정',
    description: '고양이. 건강 양호. 매우 온순함.',
    status: 'ADOPTED',
    shelter_name: '강남구 동물보호센터',
    contact: '010-7777-8888',
    created_at: '2026-03-28T10:00:00Z',
    updated_at: '2026-04-02T16:00:00Z',
  },
  {
    id: 'shelter-005',
    report_date: '2026-04-09',
    location: '서울시 강남구 개포동 주택가',
    species: 'DOG',
    breed: '포메라니안 추정',
    description: '소형견. 겁에 질린 상태.',
    status: 'REPORTED',
    contact: '010-9999-0000',
    created_at: '2026-04-09T08:00:00Z',
    updated_at: '2026-04-09T08:00:00Z',
  },
]

// ------------------------------------------------------------
// 동물 등록 신청
// ------------------------------------------------------------
export const MOCK_REGISTRATION_APPLICATIONS: RegistrationApplication[] = [
  {
    id: 'app-001',
    pet_id: 'pet-001',
    owner_id: 'user-b2c-001',
    applied_at: '2026-04-01',
    status: 'APPROVED',
    district: '강남구',
    reviewed_at: '2026-04-03T10:00:00Z',
    created_at: '2026-04-01T09:00:00Z',
    updated_at: '2026-04-03T10:00:00Z',
  },
  {
    id: 'app-002',
    pet_id: 'pet-002',
    owner_id: 'user-b2c-002',
    applied_at: '2026-04-05',
    status: 'PENDING',
    district: '강남구',
    created_at: '2026-04-05T11:00:00Z',
    updated_at: '2026-04-05T11:00:00Z',
  },
  {
    id: 'app-003',
    pet_id: 'pet-003',
    owner_id: 'user-b2c-003',
    applied_at: '2026-04-07',
    status: 'ADDITIONAL_REQUIRED',
    district: '강남구',
    reviewer_notes: '예방접종 증명서 추가 제출 필요',
    reviewed_at: '2026-04-08T09:00:00Z',
    created_at: '2026-04-07T14:00:00Z',
    updated_at: '2026-04-08T09:00:00Z',
  },
  {
    id: 'app-004',
    pet_id: 'pet-004',
    owner_id: 'user-b2c-004',
    applied_at: '2026-03-25',
    status: 'APPROVED',
    district: '강남구',
    reviewed_at: '2026-03-27T14:00:00Z',
    created_at: '2026-03-25T10:00:00Z',
    updated_at: '2026-03-27T14:00:00Z',
  },
  {
    id: 'app-005',
    pet_id: 'pet-005',
    owner_id: 'user-b2c-001',
    applied_at: '2026-04-09',
    status: 'PENDING',
    district: '강남구',
    created_at: '2026-04-09T07:30:00Z',
    updated_at: '2026-04-09T07:30:00Z',
  },
]

export function mockGetAllShelterReports(): ShelterReport[] {
  return [...MOCK_SHELTER_REPORTS].sort(
    (a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
  )
}

export function mockGetAllApplications(): RegistrationApplication[] {
  return [...MOCK_REGISTRATION_APPLICATIONS].sort(
    (a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
  )
}

export function mockGetApplicationsByStatus(status: RegistrationApplication['status']): RegistrationApplication[] {
  return MOCK_REGISTRATION_APPLICATIONS.filter(a => a.status === status)
}
