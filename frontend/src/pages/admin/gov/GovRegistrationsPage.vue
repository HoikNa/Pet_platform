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
            placeholder="동물명, 보호자명으로 검색..."
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

    <!-- 신청 테이블 -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900">동물 등록 신청 목록</h2>
        <p class="text-sm text-slate-500">총 {{ filteredApps.length }}건</p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">동물</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">보호자</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">관할구</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">생체 인증</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">신청일</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">처리일</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">상태</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">메모</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="app in pagedApps"
              :key="app.id"
              class="hover:bg-primary-50 transition-colors"
            >
              <td class="px-5 py-3.5">
                <p class="font-semibold text-slate-900">{{ getPetName(app.pet_id) }}</p>
                <p class="text-xs text-slate-500">{{ getPetBreed(app.pet_id) }}</p>
              </td>
              <td class="px-5 py-3.5">
                <p class="font-medium text-slate-800">{{ getOwnerName(app.owner_id) }}</p>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ app.district }}</td>
              <td class="px-5 py-3.5">
                <BaseBadge :color="getBiometricStatus(app.pet_id) ? 'success' : 'warning'">
                  {{ getBiometricStatus(app.pet_id) ? '인증 완료' : '미인증' }}
                </BaseBadge>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ formatDate(app.applied_at) }}</td>
              <td class="px-5 py-3.5 text-xs text-slate-600">
                {{ app.reviewed_at ? formatDate(app.reviewed_at) : '-' }}
              </td>
              <td class="px-5 py-3.5">
                <BaseBadge :color="getAppStatusColor(app.status)">{{ getAppStatusLabel(app.status) }}</BaseBadge>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-500 max-w-[120px] truncate">
                {{ app.reviewer_notes ?? '-' }}
              </td>
              <td class="px-5 py-3.5">
                <div v-if="app.status === 'PENDING' || app.status === 'ADDITIONAL_REQUIRED'" class="flex gap-1.5">
                  <button
                    class="px-2 py-1 bg-success-100 text-success-700 text-xs font-semibold rounded-lg hover:bg-success-200 transition-colors"
                    @click="handleApprove(app.id)"
                  >
                    승인
                  </button>
                  <button
                    class="px-2 py-1 bg-error-100 text-error-700 text-xs font-semibold rounded-lg hover:bg-error-200 transition-colors"
                    @click="handleReject(app.id)"
                  >
                    반려
                  </button>
                </div>
                <button
                  v-else
                  class="text-xs text-primary-600 font-semibold hover:text-primary-700"
                  @click="router.push(`/admin/pets/${app.pet_id}`)"
                >
                  EMR →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div v-if="filteredApps.length > pageLimit" class="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
        <p class="text-xs text-slate-500">{{ filteredApps.length }}건 중 {{ (currentPage - 1) * pageLimit + 1 }}~{{ Math.min(currentPage * pageLimit, filteredApps.length) }}건</p>
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
import { mockGetAllApplications } from '@/mocks/shelter'
import { mockGetOrgPets } from '@/mocks/organizations'
import { MOCK_ORG_PETS } from '@/mocks/pets'
import type { ApplicationStatus } from '@/types'

const router = useRouter()
const allApps = mockGetAllApplications()
const orgPets = mockGetOrgPets('org-gov-001')

const OWNERS: Record<string, string> = {
  'user-b2c-001': '김반려',
  'user-b2c-002': '이견주',
  'user-b2c-003': '박고양',
  'user-b2c-004': '최강아',
}

const searchInput = ref('')
const activeFilter = ref<ApplicationStatus | 'ALL'>('ALL')
const currentPage = ref(1)
const pageLimit = 10

const statusFilters: { value: ApplicationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '검토 대기' },
  { value: 'ADDITIONAL_REQUIRED', label: '추가 서류' },
  { value: 'APPROVED', label: '승인' },
  { value: 'REJECTED', label: '반려' },
]

const filteredApps = computed(() => {
  let list = allApps
  if (activeFilter.value !== 'ALL') {
    list = list.filter(a => a.status === activeFilter.value)
  }
  if (searchInput.value.trim()) {
    const q = searchInput.value.toLowerCase()
    list = list.filter(a =>
      getPetName(a.pet_id).toLowerCase().includes(q) ||
      getOwnerName(a.owner_id).toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredApps.value.length / pageLimit))
const pagedApps = computed(() => {
  const start = (currentPage.value - 1) * pageLimit
  return filteredApps.value.slice(start, start + pageLimit)
})

watch([searchInput, activeFilter], () => { currentPage.value = 1 })

function getPetName(petId: string): string {
  return MOCK_ORG_PETS.find(p => p.id === petId)?.name ?? petId
}

function getPetBreed(petId: string): string {
  const p = MOCK_ORG_PETS.find(p => p.id === petId)
  return p ? `${p.species === 'DOG' ? '강아지' : '고양이'} · ${p.breed}` : '-'
}

function getOwnerName(ownerId: string): string {
  return OWNERS[ownerId] ?? ownerId
}

function getBiometricStatus(petId: string): boolean {
  return orgPets.find(i => i.pet.id === petId)?.pet.registration_status === 'VERIFIED'
}

function formatDate(d: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(d))
}

function getAppStatusLabel(status: ApplicationStatus): string {
  const map: Record<ApplicationStatus, string> = { PENDING: '검토 대기', APPROVED: '승인', REJECTED: '반려', ADDITIONAL_REQUIRED: '추가 서류' }
  return map[status]
}

function getAppStatusColor(status: ApplicationStatus): 'primary' | 'success' | 'error' | 'warning' {
  const map: Record<ApplicationStatus, 'primary' | 'success' | 'error' | 'warning'> = {
    PENDING: 'warning', APPROVED: 'success', REJECTED: 'error', ADDITIONAL_REQUIRED: 'primary',
  }
  return map[status]
}

function handleApprove(id: string): void {
  alert(`신청 ${id} 승인 처리 (실제 API 연동 필요)`)
}

function handleReject(id: string): void {
  const reason = prompt('반려 사유를 입력해주세요:')
  if (reason) {
    alert(`신청 ${id} 반려 처리 (실제 API 연동 필요)\n사유: ${reason}`)
  }
}
</script>
