// ============================================================
// Mock 데이터 - 헬스 스캔 리포트 (Health Scans)
// 실제 API 연동 시 services/scanService.ts로 교체
// ============================================================

import type { HealthScan, BCSScore } from '@/types'

/** 데모용 헬스 스캔 리포트 목록 */
export const MOCK_SCANS: HealthScan[] = [
  // 뭉치(pet-001) - 최근 6회 스캔
  {
    id: 'scan-001',
    pet_id: 'pet-001',
    scan_date: '2024-06-01T14:30:00Z',
    bcs_score: 4 as BCSScore,
    gait_score: 88.5,
    eye_clarity_score: 92.0,
    voice_emotion_score: 76.3,
    ai_comment:
      '뭉치의 전반적인 건강 상태가 양호합니다. BCS 점수 4점으로 이상적인 체형을 유지하고 있으며, 보행 패턴도 정상 범위 내에 있습니다. 안구 상태도 맑고 건강합니다. 현재 식이 관리를 유지하시고 꾸준한 산책을 권장드립니다.',
    attachment_urls: ['s3://pet-id-uploads/scans/pet-001/scan-001.mp4'],
    scan_types: ['BCS', 'GAIT', 'AGING'],
    created_at: '2024-06-01T14:35:00Z',
  },
  {
    id: 'scan-002',
    pet_id: 'pet-001',
    scan_date: '2024-05-01T10:00:00Z',
    bcs_score: 5 as BCSScore,
    gait_score: 85.2,
    eye_clarity_score: 90.5,
    ai_comment:
      '지난달 대비 체중이 약간 증가했습니다. BCS 5점은 정상 범위이지만 약간 과체중 경향이 보입니다. 간식을 줄이고 운동량을 늘려주세요.',
    scan_types: ['BCS', 'GAIT'],
    created_at: '2024-05-01T10:05:00Z',
  },
  {
    id: 'scan-003',
    pet_id: 'pet-001',
    scan_date: '2024-04-01T11:00:00Z',
    bcs_score: 4 as BCSScore,
    gait_score: 90.1,
    eye_clarity_score: 93.2,
    ai_comment: '체형 및 보행 상태 모두 우수합니다. 노화 지표도 나이 대비 젊은 편입니다.',
    scan_types: ['BCS', 'AGING'],
    created_at: '2024-04-01T11:05:00Z',
  },
  {
    id: 'scan-004',
    pet_id: 'pet-001',
    scan_date: '2024-03-01T09:00:00Z',
    bcs_score: 3 as BCSScore,
    gait_score: 87.8,
    eye_clarity_score: 91.0,
    ai_comment: '약간 저체중 경향입니다. 칼로리 섭취량을 조금 늘려보세요.',
    scan_types: ['BCS'],
    created_at: '2024-03-01T09:05:00Z',
  },
  {
    id: 'scan-005',
    pet_id: 'pet-001',
    scan_date: '2024-02-01T14:00:00Z',
    bcs_score: 4 as BCSScore,
    gait_score: 89.3,
    eye_clarity_score: 92.5,
    ai_comment: '이상적인 체형을 유지하고 있습니다.',
    scan_types: ['BCS', 'GAIT'],
    created_at: '2024-02-01T14:05:00Z',
  },
  {
    id: 'scan-006',
    pet_id: 'pet-001',
    scan_date: '2024-01-01T10:00:00Z',
    bcs_score: 4 as BCSScore,
    gait_score: 91.0,
    eye_clarity_score: 94.1,
    ai_comment: '첫 번째 스캔 결과입니다. 모든 지표가 정상 범위에 있습니다.',
    scan_types: ['BCS', 'GAIT', 'AGING'],
    created_at: '2024-01-21T10:05:00Z',
  },

  // 두부(pet-002) - 최근 3회 스캔
  {
    id: 'scan-007',
    pet_id: 'pet-002',
    scan_date: '2024-06-05T15:00:00Z',
    bcs_score: 6 as BCSScore,
    gait_score: 78.4,
    eye_clarity_score: 85.2,
    voice_emotion_score: 82.0,
    ai_comment:
      '두부의 체형이 약간 과체중(BCS 6) 범위에 있습니다. 하루 식사량을 10~15% 줄이고 고단백 사료로 전환을 고려하세요. 안구 투명도는 정상이나 경과 관찰이 필요합니다.',
    scan_types: ['BCS', 'AGING', 'VOICE'],
    created_at: '2024-06-05T15:10:00Z',
  },
  {
    id: 'scan-008',
    pet_id: 'pet-002',
    scan_date: '2024-04-10T11:00:00Z',
    bcs_score: 5 as BCSScore,
    gait_score: 80.1,
    eye_clarity_score: 87.0,
    ai_comment: '체형은 정상 범위이나 약간 증가 추세입니다.',
    scan_types: ['BCS'],
    created_at: '2024-04-10T11:05:00Z',
  },
  {
    id: 'scan-009',
    pet_id: 'pet-002',
    scan_date: '2024-02-15T09:00:00Z',
    bcs_score: 5 as BCSScore,
    gait_score: 82.5,
    eye_clarity_score: 89.3,
    ai_comment: '전반적으로 건강한 상태입니다.',
    scan_types: ['BCS', 'GAIT'],
    created_at: '2024-02-15T09:05:00Z',
  },
]

/**
 * BCS 점수에 대한 설명 반환
 */
export function getBCSDescription(score: BCSScore): { label: string; color: string; description: string } {
  const descriptions: Record<BCSScore, { label: string; color: string; description: string }> = {
    1: { label: '극도 저체중', color: 'text-error-600', description: '갈비뼈, 척추, 골반이 명확히 돌출됨' },
    2: { label: '매우 저체중', color: 'text-error-500', description: '갈비뼈가 쉽게 만져짐, 근육 손실 있음' },
    3: { label: '저체중', color: 'text-warning-600', description: '갈비뼈가 적은 압력으로 만져짐' },
    4: { label: '이상적', color: 'text-secondary-600', description: '이상적인 체형 유지 중' },
    5: { label: '이상적 (약간 과체중)', color: 'text-secondary-500', description: '갈비뼈는 만져지나 지방이 약간 있음' },
    6: { label: '과체중', color: 'text-warning-500', description: '갈비뼈 위 지방이 과다함' },
    7: { label: '비만', color: 'text-warning-600', description: '갈비뼈가 만져지지 않음, 명확한 비만' },
    8: { label: '심한 비만', color: 'text-error-500', description: '전신 지방 과다, 운동 제한됨' },
    9: { label: '극심한 비만', color: 'text-error-600', description: '대규모 지방 축적, 즉시 식이 조절 필요' },
  }
  return descriptions[score]
}

/**
 * 반려동물의 스캔 목록 조회
 * 실제 API 연동 시 GET /pets/{pet_id}/scans 으로 교체
 */
export function mockGetScansByPetId(petId: string): HealthScan[] {
  return MOCK_SCANS
    .filter(s => s.pet_id === petId)
    .sort((a, b) => new Date(b.scan_date).getTime() - new Date(a.scan_date).getTime())
}

/**
 * 스캔 ID로 상세 조회
 * 실제 API 연동 시 GET /scans/{scan_id} 으로 교체
 */
export function mockGetScanById(scanId: string): HealthScan | null {
  return MOCK_SCANS.find(s => s.id === scanId) ?? null
}

/**
 * 신규 스캔 결과 Mock 생성 (AI 분석 시뮬레이션)
 * 실제 API 연동 시 POST /pets/{pet_id}/scans 으로 교체
 */
export function mockCreateScan(petId: string): HealthScan {
  const bcsScores: BCSScore[] = [3, 4, 4, 5, 5, 6]
  const randomBCS = bcsScores[Math.floor(Math.random() * bcsScores.length)]

  const newScan: HealthScan = {
    id: `scan-${Date.now()}`,
    pet_id: petId,
    scan_date: new Date().toISOString(),
    bcs_score: randomBCS,
    gait_score: Math.round((Math.random() * 30 + 70) * 10) / 10,
    eye_clarity_score: Math.round((Math.random() * 20 + 80) * 10) / 10,
    voice_emotion_score: Math.round((Math.random() * 30 + 60) * 10) / 10,
    ai_comment: `AI 분석이 완료되었습니다. BCS ${randomBCS}점으로 ${getBCSDescription(randomBCS).label} 상태입니다. ${getBCSDescription(randomBCS).description}`,
    scan_types: ['BCS', 'GAIT'],
    created_at: new Date().toISOString(),
  }
  MOCK_SCANS.unshift(newScan)
  return newScan
}
