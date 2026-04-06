// ============================================================
// Pinia 스토어 - 관리자 (Admin Store)
// B2B/B2G 관리자 포털 전용 상태 관리
// ============================================================

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminPetListItem, Organization, PaginationMeta } from '@/types'
import { mockGetOrgPets, mockGetOrgById, MOCK_ORGANIZATIONS } from '@/mocks/organizations'
import { useAuthStore } from './authStore'

export const useAdminStore = defineStore('admin', () => {
  // ---- 상태 ----
  const organization = ref<Organization | null>(null)
  const petList = ref<AdminPetListItem[]>([])
  const selectedItem = ref<AdminPetListItem | null>(null)
  const isLoading = ref(false)

  // 페이지네이션
  const currentPage = ref(1)
  const pageLimit = ref(10)
  const paginationMeta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total_count: 0,
    total_pages: 1,
  })

  // 검색/필터
  const searchQuery = ref('')
  const statusFilter = ref<'ALL' | 'VERIFIED' | 'PENDING'>('ALL')

  // ---- 계산된 속성 ----
  const filteredList = computed(() => {
    let result = petList.value

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        item =>
          item.pet.name.toLowerCase().includes(q) ||
          item.owner.name.toLowerCase().includes(q) ||
          item.pet.breed.toLowerCase().includes(q) ||
          item.pet.id.toLowerCase().includes(q)
      )
    }

    if (statusFilter.value !== 'ALL') {
      result = result.filter(item => item.pet.registration_status === statusFilter.value)
    }

    return result
  })

  const pagedList = computed(() => {
    const start = (currentPage.value - 1) * pageLimit.value
    const end = start + pageLimit.value
    return filteredList.value.slice(start, end)
  })

  // ---- 액션 ----

  /**
   * 관리자 소속 기관 정보 불러오기
   * 실제 API 연동 시 적절한 엔드포인트로 교체
   */
  async function fetchOrganization(): Promise<void> {
    const authStore = useAuthStore()
    if (!authStore.user) return

    // 역할에 따라 기관 매핑 (데모)
    const orgMap: Record<string, string> = {
      'user-hospital-001': 'org-hospital-001',
      'user-gov-001': 'org-gov-001',
    }
    const orgId = orgMap[authStore.user.id] ?? MOCK_ORGANIZATIONS[0].id
    organization.value = mockGetOrgById(orgId)
  }

  /**
   * 기관 연동 환축 목록 조회 (페이지네이션/필터 포함)
   * 실제 API 연동 시 GET /organizations/{org_id}/pets 으로 교체
   */
  async function fetchOrgPets(): Promise<void> {
    if (!organization.value) return

    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      const allPets = mockGetOrgPets(organization.value.id)
      petList.value = allPets

      paginationMeta.value = {
        page: currentPage.value,
        limit: pageLimit.value,
        total_count: filteredList.value.length,
        total_pages: Math.ceil(filteredList.value.length / pageLimit.value),
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 환축 상세 선택
   */
  function selectPetItem(item: AdminPetListItem | null): void {
    selectedItem.value = item
  }

  /**
   * 페이지 변경
   */
  function setPage(page: number): void {
    currentPage.value = page
    paginationMeta.value = {
      ...paginationMeta.value,
      page,
    }
  }

  /**
   * 검색어 변경
   */
  function setSearch(query: string): void {
    searchQuery.value = query
    currentPage.value = 1
  }

  /**
   * 필터 변경
   */
  function setStatusFilter(status: 'ALL' | 'VERIFIED' | 'PENDING'): void {
    statusFilter.value = status
    currentPage.value = 1
  }

  /**
   * 스토어 초기화
   */
  function reset(): void {
    organization.value = null
    petList.value = []
    selectedItem.value = null
    currentPage.value = 1
    searchQuery.value = ''
    statusFilter.value = 'ALL'
  }

  return {
    organization,
    petList,
    selectedItem,
    isLoading,
    currentPage,
    pageLimit,
    paginationMeta,
    searchQuery,
    statusFilter,
    filteredList,
    pagedList,
    fetchOrganization,
    fetchOrgPets,
    selectPetItem,
    setPage,
    setSearch,
    setStatusFilter,
    reset,
  }
})
