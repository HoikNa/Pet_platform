// ============================================================
// Composable - 페이지네이션 공통 상태 (usePagination)
// 목록형 페이지에서 공통으로 사용하는 Ref 반환
// ============================================================

import { ref, computed } from 'vue'
import type { PaginationMeta } from '@/types'

export function usePagination(defaultLimit = 10) {
  // ---- 상태 ----
  const currentPage = ref(1)
  const limit = ref(defaultLimit)
  const meta = ref<PaginationMeta>({
    page: 1,
    limit: defaultLimit,
    total_count: 0,
    total_pages: 1,
  })
  const isLoading = ref(false)

  // ---- 계산된 속성 ----
  const hasNextPage = computed(() => currentPage.value < meta.value.total_pages)
  const hasPrevPage = computed(() => currentPage.value > 1)

  /** 표시할 페이지 번호 목록 (최대 5개) */
  const pageNumbers = computed(() => {
    const total = meta.value.total_pages
    const current = currentPage.value
    const delta = 2

    const range: number[] = []
    const rangeWithDots: (number | '...')[] = []

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i)
    }

    if (current - delta > 2) rangeWithDots.push(1, '...')
    else rangeWithDots.push(1)

    rangeWithDots.push(...range)

    if (current + delta < total - 1) rangeWithDots.push('...', total)
    else if (total > 1) rangeWithDots.push(total)

    return rangeWithDots
  })

  // ---- 액션 ----

  /**
   * 페이지 변경
   */
  function goToPage(page: number): void {
    if (page < 1 || page > meta.value.total_pages) return
    currentPage.value = page
  }

  function nextPage(): void {
    if (hasNextPage.value) currentPage.value++
  }

  function prevPage(): void {
    if (hasPrevPage.value) currentPage.value--
  }

  /**
   * 메타 정보 업데이트 (API 응답 후 호출)
   */
  function updateMeta(newMeta: PaginationMeta): void {
    meta.value = newMeta
    currentPage.value = newMeta.page
  }

  /**
   * 페이지네이션 초기화
   */
  function reset(): void {
    currentPage.value = 1
    meta.value = { page: 1, limit: limit.value, total_count: 0, total_pages: 1 }
  }

  return {
    currentPage,
    limit,
    meta,
    isLoading,
    hasNextPage,
    hasPrevPage,
    pageNumbers,
    goToPage,
    nextPage,
    prevPage,
    updateMeta,
    reset,
  }
}
