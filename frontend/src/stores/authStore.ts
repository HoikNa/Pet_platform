// ============================================================
// Pinia 스토어 - 인증 (Auth Store)
// 유저 세션 토큰, 사용자 권한, 로그인/로그아웃 로직 전역 관리
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from '@/types'
import { mockLogin, mockGetUserById } from '@/mocks/users'

const AUTH_TOKEN_KEY = 'pet_id_access_token'
const AUTH_USER_KEY = 'pet_id_user'

export const useAuthStore = defineStore('auth', () => {
  // ---- 상태 ----
  const token = ref<string | null>(localStorage.getItem(AUTH_TOKEN_KEY))
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // ---- 초기화: 로컬 스토리지에서 사용자 복원 ----
  const savedUser = localStorage.getItem(AUTH_USER_KEY)
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser) as User
    } catch {
      localStorage.removeItem(AUTH_USER_KEY)
    }
  }

  // ---- 계산된 속성 ----
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed<UserRole | null>(() => user.value?.role ?? null)

  /** B2B(병원/보험사) 또는 B2G(지자체) 관리자 여부 */
  const isAdmin = computed(() =>
    user.value?.role === 'B2B_HOSPITAL' ||
    user.value?.role === 'B2B_INSURANCE' ||
    user.value?.role === 'B2G' ||
    user.value?.role === 'ADMIN'
  )

  /** B2C 일반 반려인 여부 */
  const isB2CUser = computed(() => user.value?.role === 'B2C')

  // ---- 액션 ----

  /**
   * 이메일/비밀번호 데모 로그인 (로컬 스토리지 기반)
   * 실제 API 연동 시 authService.socialLogin() 으로 교체
   */
  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true
    try {
      // 데모: API 호출 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 0))

      const result = mockLogin(email, password)
      if (!result) return false

      token.value = result.access_token
      user.value = result.user

      localStorage.setItem(AUTH_TOKEN_KEY, result.access_token)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user))

      return true
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 카카오 소셜 로그인 (데모 버전)
   * 실제 API 연동 시 POST /auth/login 으로 교체
   */
  async function kakaoLogin(): Promise<boolean> {
    // 데모: B2C 계정으로 자동 로그인
    return login('demo@petid.kr', 'demo1234')
  }

  /**
   * 로그아웃
   * 실제 API 연동 시 POST /auth/logout 으로 교체
   */
  async function logout(): Promise<void> {
    // 실제 API: await authService.logout()
    token.value = null
    user.value = null
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  }

  /**
   * 토큰으로 세션 복원
   * 실제 API 연동 시 GET /users/me 으로 교체
   */
  async function restoreSession(): Promise<void> {
    if (!token.value) return
    const savedUserId = user.value?.id
    if (!savedUserId) return

    const freshUser = mockGetUserById(savedUserId)
    if (freshUser) {
      user.value = freshUser
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(freshUser))
    } else {
      await logout()
    }
  }

  /**
   * 특정 역할 보유 여부 확인
   */
  function hasRole(role: UserRole): boolean {
    return user.value?.role === role
  }

  return {
    token,
    user,
    isLoading,
    isAuthenticated,
    userRole,
    isAdmin,
    isB2CUser,
    login,
    kakaoLogin,
    logout,
    restoreSession,
    hasRole,
  }
})
