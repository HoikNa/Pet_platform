// ============================================================
// Mock 데이터 - 기관 및 B2B/B2G 연동 (Organizations)
// 실제 API 연동 시 services/adminService.ts로 교체
// ============================================================

import type { Organization, AdminPetListItem, User } from '@/types'
import { MOCK_ORG_PETS } from './pets'
import { mockGetScansByPetId } from './scans'

/** 데모용 기관 목록 */
export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-hospital-001',
    name: '행복동물병원',
    type: 'HOSPITAL',
    contact: '02-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'org-gov-001',
    name: '서울시 강남구청',
    type: 'GOVERNMENT',
    contact: '02-3423-5000',
    address: '서울시 강남구 학동로 426',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'org-insurance-001',
    name: '메리츠화재 펫보험팀',
    type: 'INSURANCE',
    contact: '1566-7654',
    address: '서울시 영등포구 국제금융로 56',
    created_at: '2024-01-01T00:00:00Z',
  },
]

/** 데모용 반려동물 보호자 정보 */
const MOCK_PET_OWNERS: Record<string, Pick<User, 'id' | 'name' | 'phone' | 'email'>> = {
  'user-b2c-001': { id: 'user-b2c-001', name: '김반려', phone: '010-1234-5678', email: 'demo@petid.kr' },
  'user-b2c-002': { id: 'user-b2c-002', name: '이견주', phone: '010-2345-6789', email: 'lee@example.com' },
  'user-b2c-003': { id: 'user-b2c-003', name: '박고양', phone: '010-3456-7890', email: 'park@example.com' },
  'user-b2c-004': { id: 'user-b2c-004', name: '최강아', phone: '010-4567-8901', email: 'choi@example.com' },
}

/**
 * B2B/B2G 기관 연동 환축 목록 조회
 * 실제 API 연동 시 GET /organizations/{org_id}/pets 으로 교체
 */
export function mockGetOrgPets(_orgId: string): AdminPetListItem[] {
  return MOCK_ORG_PETS.map(pet => {
    const scans = mockGetScansByPetId(pet.id)
    return {
      pet,
      owner: MOCK_PET_OWNERS[pet.owner_id] ?? {
        id: pet.owner_id,
        name: '알 수 없음',
        phone: '-',
        email: '-',
      },
      latest_scan: scans[0],
      biometric: pet.registration_status === 'VERIFIED'
        ? { id: `bio-${pet.id}`, quality_score: Math.round(Math.random() * 10 + 90) }
        : undefined,
    }
  })
}

/**
 * 기관 ID로 기관 정보 조회
 * 실제 API 연동 시 GET /organizations/{org_id} 으로 교체
 */
export function mockGetOrgById(orgId: string): Organization | null {
  return MOCK_ORGANIZATIONS.find(o => o.id === orgId) ?? null
}
