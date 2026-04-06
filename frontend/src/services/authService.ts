// ============================================================
// Service - 인증 (Auth Service)
// 실제 API 연동 시 주석 해제 후 스토어에서 호출
// 현재: stores/authStore.ts의 Mock 함수로 대체됨
// ============================================================

// import http from './http'
// import type { SocialLoginRequest, AuthTokens, User } from '@/types'

/**
 * 소셜 로그인 (카카오 토큰 검증 및 JWT 발급)
 * 실제 API: POST /auth/login
 */
// export async function socialLogin(payload: SocialLoginRequest): Promise<AuthTokens> {
//   const res = await http.post<{ success: true; data: AuthTokens }>('/auth/login', payload)
//   return res.data.data
// }

/**
 * 로그아웃 (토큰 블랙리스트 등록)
 * 실제 API: POST /auth/logout
 */
// export async function logout(): Promise<void> {
//   await http.post('/auth/logout')
// }

/**
 * 내 정보 조회
 * 실제 API: GET /users/me
 */
// export async function getMe(): Promise<User> {
//   const res = await http.get<{ success: true; data: User }>('/users/me')
//   return res.data.data
// }

/**
 * 내 정보 수정
 * 실제 API: PATCH /users/me
 */
// export async function updateMe(payload: Partial<{ name: string; phone: string }>): Promise<User> {
//   const res = await http.patch<{ success: true; data: User }>('/users/me', payload)
//   return res.data.data
// }

export {}
