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
            placeholder="동물명, 진단명, 담당의로 검색..."
            class="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
          />
        </div>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="f in typeFilters"
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

    <!-- 진료 기록 테이블 -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900">진료/예약 목록</h2>
        <p class="text-sm text-slate-500">총 {{ filteredVisits.length }}건</p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">동물/보호자</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">진료 유형</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">주訴 / 진단</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">진료일</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">담당의</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">재내원 예정</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">비용</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="visit in pagedVisits"
              :key="visit.id"
              class="hover:bg-primary-50 cursor-pointer transition-colors"
              @click="goToPetDetail(visit.pet_id)"
            >
              <td class="px-5 py-3.5">
                <p class="font-semibold text-slate-900">{{ getPetName(visit.pet_id) }}</p>
                <p class="text-xs text-slate-500">{{ getOwnerName(visit.pet_id) }}</p>
              </td>
              <td class="px-5 py-3.5">
                <BaseBadge :color="getVisitTypeColor(visit.visit_type)">
                  {{ getVisitTypeLabel(visit.visit_type) }}
                </BaseBadge>
              </td>
              <td class="px-5 py-3.5 max-w-[200px]">
                <p class="text-slate-700 truncate">{{ visit.chief_complaint }}</p>
                <p class="text-xs text-slate-500 truncate">→ {{ visit.diagnosis }}</p>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ formatDate(visit.visit_date) }}</td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ visit.vet_name ?? '-' }}</td>
              <td class="px-5 py-3.5 text-xs">
                <span v-if="visit.follow_up_date" :class="isOverdue(visit.follow_up_date) ? 'text-error-600 font-semibold' : 'text-slate-600'">
                  {{ formatDate(visit.follow_up_date) }}
                  <span v-if="isOverdue(visit.follow_up_date)"> (경과)</span>
                </span>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600">
                {{ visit.cost ? visit.cost.toLocaleString() + '원' : '-' }}
              </td>
              <td class="px-5 py-3.5">
                <button
                  class="text-xs text-primary-600 font-semibold hover:text-primary-700"
                  @click.stop="goToPetDetail(visit.pet_id)"
                >
                  EMR →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="filteredVisits.length > pageLimit" class="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
        <p class="text-xs text-slate-500">{{ filteredVisits.length }}건 중 {{ (currentPage - 1) * pageLimit + 1 }}~{{ Math.min(currentPage * pageLimit, filteredVisits.length) }}건</p>
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
import { MOCK_MEDICAL_VISITS } from '@/mocks/medicalRecords'
import { MOCK_ORG_PETS } from '@/mocks/pets'
import { mockGetOrgPets } from '@/mocks/organizations'
import type { MedicalVisitType } from '@/types'

const router = useRouter()
const orgPets = mockGetOrgPets('org-hospital-001')

const searchInput = ref('')
const activeFilter = ref<MedicalVisitType | 'ALL'>('ALL')
const currentPage = ref(1)
const pageLimit = 10

const typeFilters: { value: MedicalVisitType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'CHECK_UP', label: '정기 검진' },
  { value: 'TREATMENT', label: '치료' },
  { value: 'SURGERY', label: '수술' },
  { value: 'EMERGENCY', label: '응급' },
]

const allVisits = computed(() =>
  [...MOCK_MEDICAL_VISITS].sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
)

const filteredVisits = computed(() => {
  let list = allVisits.value
  if (activeFilter.value !== 'ALL') {
    list = list.filter(v => v.visit_type === activeFilter.value)
  }
  if (searchInput.value.trim()) {
    const q = searchInput.value.toLowerCase()
    list = list.filter(v =>
      getPetName(v.pet_id).toLowerCase().includes(q) ||
      v.diagnosis.toLowerCase().includes(q) ||
      (v.vet_name ?? '').toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredVisits.value.length / pageLimit))

const pagedVisits = computed(() => {
  const start = (currentPage.value - 1) * pageLimit
  return filteredVisits.value.slice(start, start + pageLimit)
})

watch([searchInput, activeFilter], () => { currentPage.value = 1 })

function getPetName(petId: string): string {
  return MOCK_ORG_PETS.find(p => p.id === petId)?.name ?? petId
}

function getOwnerName(petId: string): string {
  return orgPets.find(i => i.pet.id === petId)?.owner.name ?? '-'
}

function goToPetDetail(petId: string): void {
  router.push(`/admin/pets/${petId}`)
}

function formatDate(d: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(d))
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date('2026-04-09')
}

function getVisitTypeLabel(type: MedicalVisitType): string {
  const map: Record<MedicalVisitType, string> = { CHECK_UP: '정기 검진', TREATMENT: '치료', SURGERY: '수술', EMERGENCY: '응급' }
  return map[type]
}

function getVisitTypeColor(type: MedicalVisitType): 'primary' | 'success' | 'error' | 'warning' {
  const map: Record<MedicalVisitType, 'primary' | 'success' | 'error' | 'warning'> = {
    CHECK_UP: 'success', TREATMENT: 'primary', SURGERY: 'warning', EMERGENCY: 'error',
  }
  return map[type]
}
</script>
