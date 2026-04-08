<template>
  <div class="flex flex-col gap-6">
    <!-- 상단 요약 카드 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in summaryStats"
        :key="stat.label"
        class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"
      >
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-semibold text-slate-500">{{ stat.label }}</p>
          <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', stat.iconBg]">
            <span class="text-sm">{{ stat.emoji }}</span>
          </div>
        </div>
        <p class="text-2xl font-black text-slate-900">{{ stat.value }}</p>
        <p :class="['text-xs mt-1', stat.changeColor]">{{ stat.change }}</p>
      </div>
    </div>

    <!-- 검색 & 필터 -->
    <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- 검색 -->
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchInput"
            type="text"
            placeholder="동물명, 보호자명, 품종으로 검색..."
            class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
            @input="onSearch"
          />
        </div>

        <!-- 상태 필터 -->
        <div class="flex gap-2">
          <button
            v-for="f in statusFilters"
            :key="f.value"
            :class="[
              'px-3 py-2 rounded-xl text-xs font-semibold transition-all border',
              adminStore.statusFilter === f.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
            ]"
            @click="adminStore.setStatusFilter(f.value)"
          >
            {{ f.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 데이터 테이블 -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900">환축 목록</h2>
        <p class="text-sm text-slate-500">총 {{ adminStore.filteredList.length }}건</p>
      </div>

      <!-- 로딩 -->
      <div v-if="adminStore.isLoading" class="flex justify-center py-16">
        <svg class="w-8 h-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <!-- 데이터 없음 -->
      <div v-else-if="adminStore.pagedList.length === 0" class="py-16 text-center text-slate-400">
        <p class="text-4xl mb-3">🔍</p>
        <p class="text-sm">검색 결과가 없습니다</p>
      </div>

      <!-- 테이블 -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th
                v-for="col in sortableColumns"
                :key="col.label"
                class="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 select-none"
                :class="col.sortable ? 'cursor-pointer hover:text-slate-700 hover:bg-slate-100 transition-colors' : ''"
                @click="col.sortable ? toggleSort(col.key) : undefined"
              >
                <div class="flex items-center gap-1">
                  {{ col.label }}
                  <template v-if="col.sortable">
                    <svg
                      v-if="sortColumn === col.key"
                      class="w-3.5 h-3.5 text-primary-500"
                      fill="currentColor" viewBox="0 0 20 20"
                    >
                      <path v-if="sortDir === 'asc'" d="M5 10l5-5 5 5H5z" />
                      <path v-else d="M15 10l-5 5-5-5h10z" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 8l5-5 5 5H5zm0 4l5 5 5-5H5z" />
                    </svg>
                  </template>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="item in sortedPagedList"
              :key="item.pet.id"
              class="hover:bg-primary-50 cursor-pointer transition-colors"
              @click="handleRowClick(item)"
            >
              <!-- 동물 정보 -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <BaseAvatar :src="item.pet.profile_image_url" :name="item.pet.name" size="sm" />
                  <div>
                    <p class="font-semibold text-slate-900">{{ item.pet.name }}</p>
                    <p class="text-xs text-slate-500">{{ item.pet.breed }} · {{ item.pet.species === 'DOG' ? '강아지' : '고양이' }}</p>
                  </div>
                </div>
              </td>

              <!-- 보호자 -->
              <td class="px-5 py-4">
                <p class="font-medium text-slate-800">{{ item.owner.name }}</p>
                <p class="text-xs text-slate-500">{{ item.owner.phone }}</p>
              </td>

              <!-- 등록 상태 -->
              <td class="px-5 py-4">
                <BaseBadge
                  :color="item.pet.registration_status === 'VERIFIED' ? 'success' : 'warning'"
                  dot
                >
                  {{ item.pet.registration_status === 'VERIFIED' ? '인증 완료' : '등록 대기' }}
                </BaseBadge>
              </td>

              <!-- 최신 BCS -->
              <td class="px-5 py-4">
                <div v-if="item.latest_scan" class="flex items-center gap-2">
                  <div :class="['w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold', getBCSClass(item.latest_scan.bcs_score)]">
                    {{ item.latest_scan.bcs_score }}
                  </div>
                  <span class="text-xs text-slate-500">{{ getBCSLabel(item.latest_scan.bcs_score) }}</span>
                </div>
                <span v-else class="text-xs text-slate-400">-</span>
              </td>

              <!-- 마지막 스캔 -->
              <td class="px-5 py-4">
                <p v-if="item.latest_scan" class="text-xs text-slate-600">
                  {{ formatDate(item.latest_scan.scan_date) }}
                </p>
                <p v-else class="text-xs text-slate-400">스캔 없음</p>
              </td>

              <!-- 작업 버튼 -->
              <td class="px-5 py-4">
                <button
                  class="text-xs text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  @click.stop="handleRowClick(item)"
                >
                  상세 보기 →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div
        v-if="adminStore.filteredList.length > adminStore.pageLimit"
        class="px-5 py-4 border-t border-slate-100 flex items-center justify-between"
      >
        <p class="text-xs text-slate-500">
          {{ sortedList.length }}건 중
          {{ (adminStore.currentPage - 1) * adminStore.pageLimit + 1 }}~{{ Math.min(adminStore.currentPage * adminStore.pageLimit, sortedList.length) }}건 표시
        </p>

        <div class="flex items-center gap-1">
          <button
            class="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            :disabled="adminStore.currentPage <= 1"
            @click="adminStore.setPage(adminStore.currentPage - 1)"
          >
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="text-sm text-slate-700 px-2 font-medium">{{ adminStore.currentPage }} / {{ totalPages }}</span>
          <button
            class="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            :disabled="adminStore.currentPage >= totalPages"
            @click="adminStore.setPage(adminStore.currentPage + 1)"
          >
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/adminStore'
import type { AdminPetListItem } from '@/types'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

const router = useRouter()
const adminStore = useAdminStore()
const searchInput = ref('')

// ---- 정렬 상태 ----
type SortColumn = 'name' | 'owner' | 'status' | 'bcs' | 'scan_date'
const sortColumn = ref<SortColumn | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

const sortableColumns: { key: SortColumn | null; label: string; sortable: boolean }[] = [
  { key: 'name', label: '동물 정보', sortable: true },
  { key: 'owner', label: '보호자', sortable: true },
  { key: 'status', label: '등록 상태', sortable: true },
  { key: 'bcs', label: '최신 BCS', sortable: true },
  { key: 'scan_date', label: '마지막 스캔', sortable: true },
  { key: null, label: '작업', sortable: false },
]

function toggleSort(col: SortColumn | null): void {
  if (!col) return
  if (sortColumn.value === col) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = col
    sortDir.value = 'asc'
  }
  adminStore.setPage(1)
}

const sortedList = computed<AdminPetListItem[]>(() => {
  const list = [...adminStore.filteredList]
  if (!sortColumn.value) return list

  return list.sort((a, b) => {
    let aVal: string | number = ''
    let bVal: string | number = ''

    switch (sortColumn.value) {
      case 'name':
        aVal = a.pet.name
        bVal = b.pet.name
        break
      case 'owner':
        aVal = a.owner.name
        bVal = b.owner.name
        break
      case 'status':
        aVal = a.pet.registration_status
        bVal = b.pet.registration_status
        break
      case 'bcs':
        aVal = a.latest_scan?.bcs_score ?? -1
        bVal = b.latest_scan?.bcs_score ?? -1
        break
      case 'scan_date':
        aVal = a.latest_scan?.scan_date ?? ''
        bVal = b.latest_scan?.scan_date ?? ''
        break
    }

    if (aVal < bVal) return sortDir.value === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
})

const sortedPagedList = computed<AdminPetListItem[]>(() => {
  const start = (adminStore.currentPage - 1) * adminStore.pageLimit
  return sortedList.value.slice(start, start + adminStore.pageLimit)
})

const totalPages = computed(() =>
  Math.ceil(sortedList.value.length / adminStore.pageLimit)
)

const statusFilters = [
  { value: 'ALL' as const, label: '전체' },
  { value: 'VERIFIED' as const, label: '인증 완료' },
  { value: 'PENDING' as const, label: '등록 대기' },
]

const summaryStats = computed(() => {
  const total = adminStore.petList.length
  const verified = adminStore.petList.filter(i => i.pet.registration_status === 'VERIFIED').length
  const scanned = adminStore.petList.filter(i => !!i.latest_scan).length
  const highBCS = adminStore.petList.filter(i => i.latest_scan && i.latest_scan.bcs_score >= 6).length

  return [
    { label: '전체 환축 수', value: total, emoji: '🐾', iconBg: 'bg-primary-50', change: '소속 기관 연동', changeColor: 'text-slate-500' },
    { label: '생체 인증 완료', value: verified, emoji: '✅', iconBg: 'bg-success-50', change: `${Math.round(verified / total * 100) || 0}% 완료`, changeColor: 'text-success-600' },
    { label: '스캔 완료', value: scanned, emoji: '📊', iconBg: 'bg-secondary-50', change: '건강 기록 보유', changeColor: 'text-secondary-600' },
    { label: '비만 주의 (BCS≥6)', value: highBCS, emoji: '⚠️', iconBg: 'bg-warning-50', change: '관리 권장', changeColor: 'text-warning-600' },
  ]
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
function onSearch(): void {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    adminStore.setSearch(searchInput.value)
  }, 300)
}

function handleRowClick(item: AdminPetListItem): void {
  adminStore.selectPetItem(item)
  router.push(`/admin/pets/${item.pet.id}`)
}

function getBCSLabel(score: number): string {
  if (score <= 3) return '저체중'
  if (score <= 5) return '이상적'
  if (score <= 7) return '과체중'
  return '비만'
}

function getBCSClass(score: number): string {
  if (score <= 3) return 'bg-warning-50 text-warning-700'
  if (score <= 5) return 'bg-secondary-50 text-secondary-700'
  if (score <= 7) return 'bg-warning-50 text-warning-700'
  return 'bg-error-50 text-error-700'
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(dateStr))
}

onMounted(async () => {
  await adminStore.fetchOrganization()
  await adminStore.fetchOrgPets()
})
</script>
