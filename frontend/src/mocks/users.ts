// ============================================================
// Mock 데이터 - 사용자 (Users)
// 실제 API 연동 시 services/authService.ts로 교체
// ============================================================

import type { User, AuthTokens } from '@/types'

/** 데모용 사용자 목록 */
export const MOCK_USERS: User[] = [
  {
    id: 'user-b2c-001',
    email: 'demo@petid.kr',
    name: '김반려',
    phone: '010-1234-5678',
    role: 'B2C',
    avatar_url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=user001',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-06-01T12:00:00Z',
  },
  {
    id: 'user-hospital-001',
    email: 'hospital@petid.kr',
    name: '박수의',
    phone: '02-9876-5432',
    role: 'B2B_HOSPITAL',
    avatar_url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=hospital001',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-06-01T12:00:00Z',
  },
  {
    id: 'user-insurance-001',
    email: 'insurance@petid.kr',
    name: '최보험',
    phone: '02-2222-3333',
    role: 'B2B_INSURANCE',
    avatar_url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=insurance001',
    created_at: '2024-03-15T09:00:00Z',
    updated_at: '2024-06-01T12:00:00Z',
  },
  {
    id: 'user-gov-001',
    email: 'gov@petid.kr',
    name: '이지자체',
    phone: '02-1111-2222',
    role: 'B2G',
    avatar_url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=gov001',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-06-01T12:00:00Z',
  },
]

/** 데모 계정 자격증명 (로컬 스토리지 기반 인증) */
export const DEMO_CREDENTIALS: Record<string, { password: string; userId: string }> = {
  'demo@petid.kr': { password: 'demo1234', userId: 'user-b2c-001' },
  'hospital@petid.kr': { password: 'hospital1234', userId: 'user-hospital-001' },
  'insurance@petid.kr': { password: 'insurance1234', userId: 'user-insurance-001' },
  'gov@petid.kr': { password: 'gov1234', userId: 'user-gov-001' },
}

/**
 * 데모 로그인 처리 (로컬 스토리지 기반)
 * 실제 API 연동 시 POST /auth/login 으로 교체
 */
export function mockLogin(email: string, _password: string): AuthTokens | null {
  const cred = DEMO_CREDENTIALS[email]
  if (!cred) return null

  const user = MOCK_USERS.find(u => u.id === cred.userId)
  if (!user) return null

  return {
    access_token: `mock-token-${user.id}-${Date.now()}`,
    token_type: 'Bearer',
    user,
  }
}

/**
 * 사용자 ID로 사용자 조회
 * 실제 API 연동 시 GET /users/me 으로 교체
 */
export function mockGetUserById(userId: string): User | null {
  return MOCK_USERS.find(u => u.id === userId) ?? null
}
