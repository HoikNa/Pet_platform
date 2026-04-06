// ============================================================
// HTTP 클라이언트 (Axios 싱글톤)
// 실제 API 연동 시 아래 주석을 해제하고 Mock 스토어 호출 제거
// ============================================================

import axios from 'axios'
// import { useAuthStore } from '@/stores/authStore'
// import { useToast } from '@/composables/useToast'
// import router from '@/router'

/**
 * Axios 인스턴스 생성
 * VITE_API_BASE_URL 환경 변수를 기반으로 베이스 URL 설정
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ============================================================
// 실제 API 연동 시 아래 interceptor 주석 해제
// ============================================================

/**
 * Request Interceptor: 인증 토큰 주입
 * 실제 API 연동 시 활성화
 */
// http.interceptors.request.use(
//   config => {
//     const authStore = useAuthStore()
//     if (authStore.token) {
//       config.headers.Authorization = `Bearer ${authStore.token}`
//     }
//     return config
//   },
//   error => Promise.reject(error)
// )

/**
 * Response Interceptor: 공통 에러 핸들링
 * - success: false 응답 시 전역 Toast 에러 팝업
 * - 401 만료 토큰 시 강제 로그아웃
 * 실제 API 연동 시 활성화
 */
// http.interceptors.response.use(
//   response => {
//     // 표준 응답 구조에서 success: false 처리
//     if (response.data && response.data.success === false) {
//       const { showToast } = useToast()
//       showToast({
//         type: 'error',
//         title: '오류가 발생했습니다',
//         message: response.data.error?.message ?? '알 수 없는 오류입니다.',
//       })
//       return Promise.reject(new Error(response.data.error?.code))
//     }
//     return response
//   },
//   async error => {
//     const { showToast } = useToast()
//
//     if (error.response?.status === 401) {
//       const authStore = useAuthStore()
//       await authStore.logout()
//       router.push('/login')
//       showToast({ type: 'error', title: '세션이 만료되었습니다', message: '다시 로그인해 주세요.' })
//     } else if (error.code === 'ECONNABORTED') {
//       showToast({ type: 'error', title: '네트워크 오류', message: '인터넷 연결을 확인해 주세요.' })
//     } else {
//       showToast({ type: 'error', title: '서버 오류', message: error.message })
//     }
//
//     return Promise.reject(error)
//   }
// )

export default http
