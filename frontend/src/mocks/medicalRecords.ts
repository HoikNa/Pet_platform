// ============================================================
// Mock 데이터 - 진료 기록 (Medical Records)
// 실제 API 연동 시 services/medicalService.ts로 교체
// ============================================================

import type { MedicalVisit, Prescription, Vaccination } from '@/types'

// ------------------------------------------------------------
// 진료 이력
// ------------------------------------------------------------
export const MOCK_MEDICAL_VISITS: MedicalVisit[] = [
  {
    id: 'visit-001',
    pet_id: 'pet-001',
    visit_date: '2026-03-20',
    hospital_name: '행복 동물병원',
    vet_name: '이수의 원장',
    visit_type: 'CHECK_UP',
    chief_complaint: '정기 건강 검진',
    diagnosis: '전반적 건강 상태 양호. 체중 정상 범위.',
    treatment_notes: '혈액 검사, 소변 검사 정상. 치석 경미하게 형성 중.',
    follow_up_date: '2026-09-20',
    cost: 55000,
    created_at: '2026-03-20T10:30:00Z',
  },
  {
    id: 'visit-002',
    pet_id: 'pet-001',
    visit_date: '2025-11-05',
    hospital_name: '행복 동물병원',
    vet_name: '이수의 원장',
    visit_type: 'TREATMENT',
    chief_complaint: '귀 긁음, 머리 흔들기',
    diagnosis: '외이염 (세균성)',
    treatment_notes: '귀 세척 처치 후 항생제 점이액 처방. 2주 후 재내원 예정.',
    follow_up_date: '2025-11-19',
    cost: 42000,
    created_at: '2025-11-05T14:00:00Z',
  },
  {
    id: 'visit-003',
    pet_id: 'pet-001',
    visit_date: '2025-07-12',
    hospital_name: '서울펫 클리닉',
    vet_name: '박동물 수의사',
    visit_type: 'TREATMENT',
    chief_complaint: '식욕 감소, 구토 1회',
    diagnosis: '경미한 위장염',
    treatment_notes: '소화기 진정제 처방. 1~2일 소화기 식이 권장.',
    cost: 38000,
    created_at: '2025-07-12T11:00:00Z',
  },
  {
    id: 'visit-004',
    pet_id: 'pet-002',
    visit_date: '2026-02-14',
    hospital_name: '고양이 전문 동물병원',
    vet_name: '최수의 원장',
    visit_type: 'CHECK_UP',
    chief_complaint: '연간 건강 검진',
    diagnosis: '건강 양호. 체중 적정.',
    treatment_notes: '치석 경미. 구강 관리 권장.',
    follow_up_date: '2027-02-14',
    cost: 65000,
    created_at: '2026-02-14T10:00:00Z',
  },
  {
    id: 'visit-005',
    pet_id: 'pet-002',
    visit_date: '2025-09-03',
    hospital_name: '고양이 전문 동물병원',
    vet_name: '최수의 원장',
    visit_type: 'TREATMENT',
    chief_complaint: '피부 가려움, 탈모',
    diagnosis: '알레르기성 피부염',
    treatment_notes: '항히스타민제 처방. 알레르기 식이요법 권장. 3주 투약.',
    cost: 48000,
    created_at: '2025-09-03T15:30:00Z',
  },
]

// ------------------------------------------------------------
// 약 처방 이력
// ------------------------------------------------------------
export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-001',
    pet_id: 'pet-001',
    medical_visit_id: 'visit-002',
    prescribed_date: '2025-11-05',
    hospital_name: '행복 동물병원',
    vet_name: '이수의 원장',
    drug_name: '오티컴 점이액',
    dosage: '3~4방울',
    frequency: '1일 2회',
    duration_days: 14,
    purpose: '외이염 치료 (항생제)',
    notes: '점이 전 귀 안을 부드럽게 닦아 주세요.',
    created_at: '2025-11-05T14:00:00Z',
  },
  {
    id: 'rx-002',
    pet_id: 'pet-001',
    medical_visit_id: 'visit-003',
    prescribed_date: '2025-07-12',
    hospital_name: '서울펫 클리닉',
    vet_name: '박동물 수의사',
    drug_name: '펩타민 시럽',
    dosage: '5ml',
    frequency: '1일 3회 (식후)',
    duration_days: 5,
    purpose: '위장 진정 (소화기 보호)',
    created_at: '2025-07-12T11:00:00Z',
  },
  {
    id: 'rx-003',
    pet_id: 'pet-001',
    prescribed_date: '2026-01-10',
    hospital_name: '행복 동물병원',
    vet_name: '이수의 원장',
    drug_name: '넥스가드 스펙트라',
    dosage: '소형견용 1정',
    frequency: '월 1회',
    duration_days: 30,
    purpose: '심장사상충·벼룩·진드기 예방',
    notes: '매월 같은 날짜에 급여하세요.',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'rx-004',
    pet_id: 'pet-002',
    medical_visit_id: 'visit-005',
    prescribed_date: '2025-09-03',
    hospital_name: '고양이 전문 동물병원',
    vet_name: '최수의 원장',
    drug_name: '아포퀄 정 5.4mg',
    dosage: '1정',
    frequency: '1일 1회',
    duration_days: 21,
    purpose: '알레르기성 피부염 (가려움 억제)',
    notes: '식욕 감소 등 부작용 발생 시 즉시 내원하세요.',
    created_at: '2025-09-03T15:30:00Z',
  },
]

// ------------------------------------------------------------
// 접종 이력
// ------------------------------------------------------------
export const MOCK_VACCINATIONS: Vaccination[] = [
  {
    id: 'vac-001',
    pet_id: 'pet-001',
    vaccine_name: 'DHPPL (종합백신 5종)',
    vaccination_type: 'CORE',
    vaccinated_date: '2025-03-15',
    next_due_date: '2026-03-15',
    hospital_name: '행복 동물병원',
    vet_name: '이수의 원장',
    manufacturer: '메리알',
    created_at: '2025-03-15T10:00:00Z',
  },
  {
    id: 'vac-002',
    pet_id: 'pet-001',
    vaccine_name: '광견병 백신',
    vaccination_type: 'RABIES',
    vaccinated_date: '2025-03-15',
    next_due_date: '2026-03-15',
    hospital_name: '행복 동물병원',
    vet_name: '이수의 원장',
    manufacturer: '노바티스',
    batch_number: 'RAB-2025-0315',
    created_at: '2025-03-15T10:00:00Z',
  },
  {
    id: 'vac-003',
    pet_id: 'pet-001',
    vaccine_name: '켄넬코프 (기관지염)',
    vaccination_type: 'NON_CORE',
    vaccinated_date: '2025-03-15',
    next_due_date: '2026-03-15',
    hospital_name: '행복 동물병원',
    vet_name: '이수의 원장',
    manufacturer: '조에티스',
    created_at: '2025-03-15T10:00:00Z',
  },
  {
    id: 'vac-004',
    pet_id: 'pet-001',
    vaccine_name: '코로나 장염',
    vaccination_type: 'NON_CORE',
    vaccinated_date: '2025-03-15',
    next_due_date: '2026-03-15',
    hospital_name: '행복 동물병원',
    vet_name: '이수의 원장',
    manufacturer: '메리알',
    created_at: '2025-03-15T10:00:00Z',
  },
  {
    id: 'vac-005',
    pet_id: 'pet-002',
    vaccine_name: '고양이 종합백신 (FVRCP)',
    vaccination_type: 'CORE',
    vaccinated_date: '2026-02-14',
    next_due_date: '2027-02-14',
    hospital_name: '고양이 전문 동물병원',
    vet_name: '최수의 원장',
    manufacturer: '조에티스',
    created_at: '2026-02-14T10:00:00Z',
  },
  {
    id: 'vac-006',
    pet_id: 'pet-002',
    vaccine_name: '고양이 광견병 백신',
    vaccination_type: 'RABIES',
    vaccinated_date: '2026-02-14',
    next_due_date: '2027-02-14',
    hospital_name: '고양이 전문 동물병원',
    vet_name: '최수의 원장',
    manufacturer: '메리알',
    batch_number: 'CAT-RAB-2026-0214',
    created_at: '2026-02-14T10:00:00Z',
  },
]

// ------------------------------------------------------------
// 조회 헬퍼 함수
// ------------------------------------------------------------

export function mockGetMedicalVisitsByPetId(petId: string): MedicalVisit[] {
  return MOCK_MEDICAL_VISITS
    .filter(v => v.pet_id === petId)
    .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
}

export function mockGetPrescriptionsByPetId(petId: string): Prescription[] {
  return MOCK_PRESCRIPTIONS
    .filter(p => p.pet_id === petId)
    .sort((a, b) => new Date(b.prescribed_date).getTime() - new Date(a.prescribed_date).getTime())
}

export function mockGetVaccinationsByPetId(petId: string): Vaccination[] {
  return MOCK_VACCINATIONS
    .filter(v => v.pet_id === petId)
    .sort((a, b) => new Date(b.vaccinated_date).getTime() - new Date(a.vaccinated_date).getTime())
}
