<template>
  <div class="flex flex-col gap-6">
    <!-- KPI 카드 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in kpiStats"
        :key="stat.label"
        class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"
      >
        <div class="flex items-center justify-between mb-3">
          <p class="text-xs font-semibold text-slate-500">{{ stat.label }}</p>
          <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-sm', stat.iconBg]">{{ stat.emoji }}</div>
        </div>
        <p class="text-2xl font-black text-slate-900">{{ stat.value }}</p>
        <p :class="['text-xs mt-1', stat.subColor]">{{ stat.sub }}</p>
      </div>
    </div>

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
            placeholder="동물명, 백신명으로 검색..."
            class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
          />
        </div>
        <div class="flex gap-2">
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

    <!-- 접종 테이블 -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900">접종 이력</h2>
        <p class="text-sm text-slate-500">총 {{ filteredVaccinations.length }}건</p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">동물</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">백신명</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">종류</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">접종일</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">다음 접종 예정일</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">상태</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">제조사</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">담당의</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="vac in pagedVaccinations"
              :key="vac.id"
              class="hover:bg-primary-50 cursor-pointer transition-colors"
              @click="goToPetDetail(vac.pet_id)"
            >
              <td class="px-5 py-3.5 font-semibold text-slate-900">{{ getPetName(vac.pet_id) }}</td>
              <td class="px-5 py-3.5 text-slate-700">{{ vac.vaccine_name }}</td>
              <td class="px-5 py-3.5">
                <BaseBadge :color="getVacTypeColor(vac.vaccination_type)">
                  {{ getVacTypeLabel(vac.vaccination_type) }}
                </BaseBadge>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ formatDate(vac.vaccinated_date) }}</td>
              <td class="px-5 py-3.5 text-xs">
                <span v-if="vac.next_due_date" :class="getDueDateClass(vac.next_due_date)">
                  {{ formatDate(vac.next_due_date) }}
                  <span v-if="getDaysLeft(vac.next_due_date) !== null" class="ml-1 text-[10px]">
                    ({{ getDaysLeft(vac.next_due_date)! >= 0 ? 'D-' + getDaysLeft(vac.next_due_date) : '경과' }})
                  </span>
                </span>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="px-5 py-3.5">
                <BaseBadge :color="getStatusColor(vac.next_due_date)">
                  {{ getStatusLabel(vac.next_due_date) }}
                </BaseBadge>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ vac.manufacturer ?? '-' }}</td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ vac.vet_name ?? '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="filteredVaccinations.length > pageLimit" class="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
        <p class="text-xs text-slate-500">{{ filteredVaccinations.length }}건 중 {{ (currentPage - 1) * pageLimit + 1 }}~{{ Math.min(currentPage * pageLimit, filteredVaccinations.length) }}건</p>
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
import { MOCK_VACCINATIONS } from '@/mocks/medicalRecords'
import { MOCK_ORG_PETS } from '@/mocks/pets'
import type { VaccinationType } from '@/types'

const router = useRouter()
const NOW = new Date('2026-04-09')

const searchInput = ref('')
const activeFilter = ref<'ALL' | 'UPCOMING' | 'OVERDUE' | 'OK'>('ALL')
const currentPage = ref(1)
const pageLimit = 10

const statusFilters = [
  { value: 'ALL' as const, label: '전체' },
  { value: 'UPCOMING' as const, label: '만기 임박' },
  { value: 'OVERDUE' as const, label: '만기 경과' },
  { value: 'OK' as const, label: '정상' },
]

const allVaccinations = computed(() =>
  [...MOCK_VACCINATIONS].sort((a, b) => new Date(b.vaccinated_date).getTime() - new Date(a.vaccinated_date).getTime())
)

const filteredVaccinations = computed(() => {
  let list = allVaccinations.value
  if (searchInput.value.trim()) {
    const q = searchInput.value.toLowerCase()
    list = list.filter(v =>
      getPetName(v.pet_id).toLowerCase().includes(q) ||
      v.vaccine_name.toLowerCase().includes(q)
    )
  }
  if (activeFilter.value !== 'ALL') {
    list = list.filter(v => {
      const days = getDaysLeft(v.next_due_date)
      if (activeFilter.value === 'UPCOMING') return days !== null && days >= 0 && days <= 30
      if (activeFilter.value === 'OVERDUE') return days !== null && days < 0
      if (activeFilter.value === 'OK') return days === null || days > 30
      return true
    })
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredVaccinations.value.length / pageLimit))
const pagedVaccinations = computed(() => {
  const start = (currentPage.value - 1) * pageLimit
  return filteredVaccinations.value.slice(start, start + pageLimit)
})

watch([searchInput, activeFilter], () => { currentPage.value = 1 })

const kpiStats = computed(() => {
  const total = MOCK_VACCINATIONS.length
  const upcoming = MOCK_VACCINATIONS.filter(v => { const d = getDaysLeft(v.next_due_date); return d !== null && d >= 0 && d <= 30 }).length
  const overdue = MOCK_VACCINATIONS.filter(v => { const d = getDaysLeft(v.next_due_date); return d !== null && d < 0 }).length
  const core = MOCK_VACCINATIONS.filter(v => v.vaccination_type === 'CORE').length

  return [
    { label: '전체 접종 기록', value: total, emoji: '💉', iconBg: 'bg-primary-50', sub: '누적', subColor: 'text-slate-500' },
    { label: '만기 임박 (30일)', value: upcoming, emoji: '⏰', iconBg: 'bg-warning-50', sub: '알림 필요', subColor: 'text-warning-600' },
    { label: '만기 경과', value: overdue, emoji: '❗', iconBg: 'bg-error-50', sub: '재접종 권장', subColor: 'text-error-600' },
    { label: '핵심 백신', value: core, emoji: '✅', iconBg: 'bg-success-50', sub: 'CORE 접종', subColor: 'text-success-600' },
  ]
})

function getPetName(petId: string): string {
  return MOCK_ORG_PETS.find(p => p.id === petId)?.name ?? petId
}

function goToPetDetail(petId: string): void {
  router.push(`/admin/pets/${petId}`)
}

function formatDate(d: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(d))
}

function getDaysLeft(dueDate?: string): number | null {
  if (!dueDate) return null
  return Math.ceil((new Date(dueDate).getTime() - NOW.getTime()) / 86400000)
}

function getDueDateClass(dueDate: string): string {
  const d = getDaysLeft(dueDate)
  if (d === null) return 'text-slate-600'
  if (d < 0) return 'text-error-600 font-semibold'
  if (d <= 30) return 'text-warning-600 font-semibold'
  return 'text-slate-600'
}

function getStatusLabel(dueDate?: string): string {
  const d = getDaysLeft(dueDate)
  if (d === null) return '상시'
  if (d < 0) return '만기 경과'
  if (d <= 30) return '만기 임박'
  return '정상'
}

function getStatusColor(dueDate?: string): 'primary' | 'success' | 'error' | 'warning' {
  const d = getDaysLeft(dueDate)
  if (d === null) return 'primary'
  if (d < 0) return 'error'
  if (d <= 30) return 'warning'
  return 'success'
}

function getVacTypeLabel(type: VaccinationType): string {
  const map: Record<VaccinationType, string> = { CORE: '핵심', NON_CORE: '비핵심', RABIES: '광견병' }
  return map[type]
}

function getVacTypeColor(type: VaccinationType): 'primary' | 'success' | 'error' | 'warning' {
  const map: Record<VaccinationType, 'primary' | 'success' | 'error' | 'warning'> = {
    CORE: 'success', NON_CORE: 'primary', RABIES: 'warning',
  }
  return map[type]
}
</script>
