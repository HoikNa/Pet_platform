// ============================================================
// Mock 데이터 - 보험 청구 (Insurance Claims)
// 실제 API 연동 시 services/insuranceService.ts로 교체
// ============================================================

import type { InsuranceClaim } from '@/types'

export const MOCK_CLAIMS: InsuranceClaim[] = [
  {
    id: 'claim-001',
    pet_id: 'pet-001',
    owner_id: 'user-b2c-001',
    claim_date: '2026-04-01',
    treatment_date: '2026-03-20',
    hospital_name: '행복동물병원',
    diagnosis: '전반적 건강 검진 (정기)',
    treatment_notes: '혈액 검사, 소변 검사 정상. 치석 경미하게 형성 중.',
    claimed_amount: 55000,
    approved_amount: 44000,
    status: 'APPROVED',
    risk_score: 18,
    scan_ids: ['scan-001'],
    created_at: '2026-04-01T09:00:00Z',
    updated_at: '2026-04-03T14:00:00Z',
  },
  {
    id: 'claim-002',
    pet_id: 'pet-001',
    owner_id: 'user-b2c-001',
    claim_date: '2025-11-10',
    treatment_date: '2025-11-05',
    hospital_name: '행복동물병원',
    diagnosis: '외이염 (세균성)',
    treatment_notes: '귀 세척 처치 후 항생제 점이액 처방.',
    claimed_amount: 42000,
    approved_amount: 42000,
    status: 'APPROVED',
    risk_score: 22,
    created_at: '2025-11-10T10:00:00Z',
    updated_at: '2025-11-12T11:00:00Z',
  },
  {
    id: 'claim-003',
    pet_id: 'pet-002',
    owner_id: 'user-b2c-002',
    claim_date: '2026-04-05',
    treatment_date: '2026-02-14',
    hospital_name: '고양이 전문 동물병원',
    diagnosis: '연간 건강 검진',
    treatment_notes: '치석 경미. 구강 관리 권장.',
    claimed_amount: 65000,
    status: 'PENDING',
    risk_score: 15,
    scan_ids: ['scan-002'],
    created_at: '2026-04-05T08:30:00Z',
    updated_at: '2026-04-05T08:30:00Z',
  },
  {
    id: 'claim-004',
    pet_id: 'pet-003',
    owner_id: 'user-b2c-003',
    claim_date: '2026-04-07',
    treatment_date: '2026-04-02',
    hospital_name: '서울펫 클리닉',
    diagnosis: '슬개골 탈구 (2기) 수술',
    treatment_notes: '전신마취 하 정복술 시행. 4주 재활 권장.',
    claimed_amount: 850000,
    status: 'REVIEWING',
    risk_score: 68,
    scan_ids: ['scan-003'],
    created_at: '2026-04-07T13:00:00Z',
    updated_at: '2026-04-08T09:00:00Z',
  },
  {
    id: 'claim-005',
    pet_id: 'pet-004',
    owner_id: 'user-b2c-004',
    claim_date: '2026-03-25',
    treatment_date: '2026-03-20',
    hospital_name: '강남 동물의료센터',
    diagnosis: '췌장염 (급성)',
    treatment_notes: '입원 3일, 수액 요법 및 금식 치료.',
    claimed_amount: 320000,
    approved_amount: 256000,
    status: 'APPROVED',
    risk_score: 51,
    created_at: '2026-03-25T16:00:00Z',
    updated_at: '2026-03-28T10:00:00Z',
  },
  {
    id: 'claim-006',
    pet_id: 'pet-003',
    owner_id: 'user-b2c-003',
    claim_date: '2026-03-10',
    treatment_date: '2026-03-05',
    hospital_name: '서울펫 클리닉',
    diagnosis: '피부 알레르기 (아토피성)',
    treatment_notes: '스테로이드 주사 및 경구약 처방.',
    claimed_amount: 78000,
    status: 'REJECTED',
    risk_score: 35,
    reviewer_notes: '보험 약관 면책 조항 해당 (선천성 질환)',
    created_at: '2026-03-10T11:00:00Z',
    updated_at: '2026-03-14T15:00:00Z',
  },
  {
    id: 'claim-007',
    pet_id: 'pet-002',
    owner_id: 'user-b2c-002',
    claim_date: '2026-04-08',
    treatment_date: '2025-09-03',
    hospital_name: '고양이 전문 동물병원',
    diagnosis: '알레르기성 피부염',
    treatment_notes: '항히스타민제 처방. 알레르기 식이요법 권장.',
    claimed_amount: 48000,
    status: 'PENDING',
    risk_score: 29,
    created_at: '2026-04-08T10:00:00Z',
    updated_at: '2026-04-08T10:00:00Z',
  },
]

export function mockGetAllClaims(): InsuranceClaim[] {
  return [...MOCK_CLAIMS].sort(
    (a, b) => new Date(b.claim_date).getTime() - new Date(a.claim_date).getTime()
  )
}

export function mockGetClaimById(id: string): InsuranceClaim | null {
  return MOCK_CLAIMS.find(c => c.id === id) ?? null
}

export function mockGetClaimsByStatus(status: InsuranceClaim['status']): InsuranceClaim[] {
  return MOCK_CLAIMS.filter(c => c.status === status)
}
