// ============================================================
// Composable - 전역 Toast 알림 관리 (useToast)
// ============================================================

import { ref } from 'vue'
import type { ToastMessage, ToastType } from '@/types'

/** 전역 Toast 목록 (싱글톤 패턴) */
const toasts = ref<ToastMessage[]>([])

let idCounter = 0

export function useToast() {
  /**
   * Toast 메시지 추가
   */
  function showToast(options: {
    type: ToastType
    title: string
    message?: string
    duration?: number
  }): string {
    const id = `toast-${++idCounter}`
    const duration = options.duration ?? 4000

    const toast: ToastMessage = {
      id,
      type: options.type,
      title: options.title,
      message: options.message,
      duration,
    }

    toasts.value.push(toast)

    // 자동 제거
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }

    return id
  }

  /** 성공 Toast */
  function success(title: string, message?: string): string {
    return showToast({ type: 'success', title, message })
  }

  /** 오류 Toast */
  function error(title: string, message?: string): string {
    return showToast({ type: 'error', title, message, duration: 6000 })
  }

  /** 경고 Toast */
  function warning(title: string, message?: string): string {
    return showToast({ type: 'warning', title, message })
  }

  /** 정보 Toast */
  function info(title: string, message?: string): string {
    return showToast({ type: 'info', title, message })
  }

  /**
   * 특정 Toast 제거
   */
  function removeToast(id: string): void {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) toasts.value.splice(index, 1)
  }

  /**
   * 모든 Toast 초기화
   */
  function clearAll(): void {
    toasts.value = []
  }

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    removeToast,
    clearAll,
  }
}
