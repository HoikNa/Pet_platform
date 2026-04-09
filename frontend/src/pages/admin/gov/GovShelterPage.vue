<template>
  <div class="flex flex-col gap-6">
    <!-- 필터 -->
    <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchInput"
            type="text"
            placeholder="품종, 발견 장소로 검색..."
            class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
          />
        </div>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="f in statusFilters"
            :key="f.value"
            :class="[
              'px-3 py-2 rounded-xl text-xs font-semibold transition-all border',
              activeFilter === f.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
            ]"
            @click="activeFilter = f.value"
          >
            {{ f.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 유기동물 목록 -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900">유기동물 신고 목록</h2>
        <p class="text-sm text-slate-500">총 {{ filteredReports.length }}건</p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">종/품종</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">발견 장소</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">상태</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">보호소</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">신고자 연락처</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">등록 연동</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">신고일</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">설명</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="report in pagedReports"
              :key="report.id"
              class="hover:bg-primary-50 transition-colors"
            >
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <span class="text-base">{{ report.species === 'DOG' ? '🐕' : report.species === 'CAT' ? '🐈' : '🐾' }}</span>
                  <div>
                    <p class="font-semibold text-slate-900">{{ report.breed ?? '미상' }}</p>
                    <p class="text-xs text-slate-500">{{ report.species === 'DOG' ? '강아지' : report.species === 'CAT' ? '고양이' : '기타' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-700 max-w-[160px] truncate">{{ report.location }}</td>
              <td class="px-5 py-3.5">
                <BaseBadge :color="getShelterStatusColor(report.status)">
                  {{ getShelterStatusLabel(report.status) }}
                </BaseBadge>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ report.shelter_name ?? '-' }}</td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ report.contact }}</td>
              <td class="px-5 py-3.5">
                <button
                  v-if="report.pet_id"
                  class="text-xs text-primary-600 font-semibold hover:text-primary-700"
                  @click="router.push(`/admin/pets/${report.pet_id}`)"
                >
                  등록 동물 →
                </button>
                <span v-else class="text-xs text-slate-400">미등록</span>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ formatDate(report.report_date) }}</td>
              <td class="px-5 py-3.5 text-xs text-slate-500 max-w-[160px] truncate">{{ report.description ?? '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="filteredReports.length > pageLimit" class="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
        <p class="text-xs text-slate-500">{{ filteredReports.length }}건 중 {{ (currentPage - 1) * pageLimit + 1 }}~{{ Math.min(currentPage * pageLimit, filteredReports.length) }}건</p>
        <div class="flex items-center gap-1">
          <button class="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors" :disabled="currentPage <= 1" @click="currentPage--">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span class="text-sm px-2 font-medium text-slate-700">{{ currentPage }} / {{ totalPages }}</span>
          <button class="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors" :disabled="currentPage >= totalPages" @click="currentPage++">
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { mockGetAllShelterReports } from '@/mocks/shelter'
import type { ShelterStatus } from '@/types'

const router = useRouter()
const allReports = mockGetAllShelterReports()

const searchInput = ref('')
const activeFilter = ref<ShelterStatus | 'ALL'>('ALL')
const currentPage = ref(1)
const pageLimit = 10

const statusFilters: { value: ShelterStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'REPORTED', label: '신고 접수' },
  { value: 'SHELTERED', label: '보호 중' },
  { value: 'ADOPTED', label: '입양' },
  { value: 'RETURNED', label: '반환' },
]

const filteredReports = computed(() => {
  let list = allReports
  if (activeFilter.value !== 'ALL') {
    list = list.filter(r => r.status === activeFilter.value)
  }
  if (searchInput.value.trim()) {
    const q = searchInput.value.toLowerCase()
    list = list.filter(r =>
      (r.breed ?? '').toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredReports.value.length / pageLimit))
const pagedReports = computed(() => {
  const start = (currentPage.value - 1) * pageLimit
  return filteredReports.value.slice(start, start + pageLimit)
})

watch([searchInput, activeFilter], () => { currentPage.value = 1 })

function formatDate(d: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(d))
}

function getShelterStatusLabel(status: ShelterStatus): string {
  const map: Record<ShelterStatus, string> = { REPORTED: '신고 접수', SHELTERED: '보호 중', ADOPTED: '입양', EUTHANIZED: '안락사', RETURNED: '반환' }
  return map[status]
}

function getShelterStatusColor(status: ShelterStatus): 'primary' | 'success' | 'error' | 'warning' {
  const map: Record<ShelterStatus, 'primary' | 'success' | 'error' | 'warning'> = {
    REPORTED: 'error', SHELTERED: 'warning', ADOPTED: 'success', EUTHANIZED: 'error', RETURNED: 'primary',
  }
  return map[status]
}
</script>
