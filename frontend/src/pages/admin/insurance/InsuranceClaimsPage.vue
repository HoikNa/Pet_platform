<template>
  <div class="flex flex-col gap-6">
    <!-- 필터 & 검색 -->
    <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchInput"
            type="text"
            placeholder="동물명, 진단명, 병원명으로 검색..."
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

    <!-- 청구 테이블 -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900">보험 청구 목록</h2>
        <p class="text-sm text-slate-500">총 {{ filteredClaims.length }}건</p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">반려동물</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">병원 / 진단</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">청구액</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">승인액</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">AI 리스크</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">상태</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">청구일</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="claim in pagedClaims"
              :key="claim.id"
              class="hover:bg-primary-50 cursor-pointer transition-colors"
              @click="goToDetail(claim.id)"
            >
              <td class="px-5 py-3.5">
                <p class="font-semibold text-slate-900">{{ getPetName(claim.pet_id) }}</p>
                <p class="text-xs text-slate-500">{{ getOwnerName(claim.owner_id) }}</p>
              </td>
              <td class="px-5 py-3.5 max-w-[180px]">
                <p class="text-slate-700 text-xs">{{ claim.hospital_name }}</p>
                <p class="text-slate-600 truncate">{{ claim.diagnosis }}</p>
              </td>
              <td class="px-5 py-3.5 font-semibold text-slate-900">
                {{ claim.claimed_amount.toLocaleString() }}원
              </td>
              <td class="px-5 py-3.5">
                <span v-if="claim.approved_amount !== undefined" class="text-success-600 font-semibold">
                  {{ claim.approved_amount.toLocaleString() }}원
                </span>
                <span v-else class="text-slate-400 text-xs">-</span>
              </td>
              <td class="px-5 py-3.5">
                <span :class="['text-xs font-bold px-2 py-1 rounded-lg', getRiskBg(claim.risk_score)]">
                  {{ claim.risk_score !== undefined ? claim.risk_score + '점' : '-' }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <BaseBadge :color="getStatusColor(claim.status)">{{ getStatusLabel(claim.status) }}</BaseBadge>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ formatDate(claim.claim_date) }}</td>
              <td class="px-5 py-3.5">
                <button class="text-xs text-primary-600 font-semibold hover:text-primary-700" @click.stop="goToDetail(claim.id)">
                  심사 →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="filteredClaims.length > pageLimit" class="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
        <p class="text-xs text-slate-500">{{ filteredClaims.length }}건 중 {{ (currentPage - 1) * pageLimit + 1 }}~{{ Math.min(currentPage * pageLimit, filteredClaims.length) }}건</p>
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
import { mockGetAllClaims } from '@/mocks/insurance'
import { MOCK_ORG_PETS } from '@/mocks/pets'
import type { ClaimStatus } from '@/types'

const router = useRouter()
const allClaims = mockGetAllClaims()

const OWNERS: Record<string, string> = {
  'user-b2c-001': '김반려',
  'user-b2c-002': '이견주',
  'user-b2c-003': '박고양',
  'user-b2c-004': '최강아',
}

const searchInput = ref('')
const activeFilter = ref<ClaimStatus | 'ALL'>('ALL')
const currentPage = ref(1)
const pageLimit = 10

const statusFilters: { value: ClaimStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '접수 대기' },
  { value: 'REVIEWING', label: '심사 중' },
  { value: 'APPROVED', label: '승인' },
  { value: 'REJECTED', label: '거부' },
]

const filteredClaims = computed(() => {
  let list = allClaims
  if (activeFilter.value !== 'ALL') {
    list = list.filter(c => c.status === activeFilter.value)
  }
  if (searchInput.value.trim()) {
    const q = searchInput.value.toLowerCase()
    list = list.filter(c =>
      getPetName(c.pet_id).toLowerCase().includes(q) ||
      c.diagnosis.toLowerCase().includes(q) ||
      c.hospital_name.toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredClaims.value.length / pageLimit))
const pagedClaims = computed(() => {
  const start = (currentPage.value - 1) * pageLimit
  return filteredClaims.value.slice(start, start + pageLimit)
})

watch([searchInput, activeFilter], () => { currentPage.value = 1 })

function getPetName(petId: string): string {
  return MOCK_ORG_PETS.find(p => p.id === petId)?.name ?? petId
}

function getOwnerName(ownerId: string): string {
  return OWNERS[ownerId] ?? ownerId
}

function goToDetail(id: string): void {
  router.push(`/admin/insurance/claims/${id}`)
}

function formatDate(d: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(d))
}

function getRiskBg(score?: number): string {
  if (score === undefined || score === null) return 'bg-slate-100 text-slate-600'
  if (score >= 60) return 'bg-error-100 text-error-700'
  if (score >= 30) return 'bg-warning-100 text-warning-700'
  return 'bg-success-100 text-success-700'
}

function getStatusLabel(status: ClaimStatus): string {
  const map: Record<ClaimStatus, string> = { PENDING: '접수 대기', REVIEWING: '심사 중', APPROVED: '승인', REJECTED: '거부' }
  return map[status]
}

function getStatusColor(status: ClaimStatus): 'primary' | 'success' | 'error' | 'warning' {
  const map: Record<ClaimStatus, 'primary' | 'success' | 'error' | 'warning'> = {
    PENDING: 'warning', REVIEWING: 'primary', APPROVED: 'success', REJECTED: 'error',
  }
  return map[status]
}
</script>
