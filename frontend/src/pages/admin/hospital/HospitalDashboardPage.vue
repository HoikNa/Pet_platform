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
          <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-sm', stat.iconBg]">
            {{ stat.emoji }}
          </div>
        </div>
        <p class="text-2xl font-black text-slate-900">{{ stat.value }}</p>
        <p :class="['text-xs mt-1', stat.subColor]">{{ stat.sub }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 오늘 진료 목록 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">오늘 진료 현황</h2>
          <RouterLink
            to="/admin/hospital/appointments"
            class="text-xs text-primary-600 font-semibold hover:text-primary-700"
          >
            전체 보기 →
          </RouterLink>
        </div>
        <ul class="divide-y divide-slate-100">
          <li
            v-for="visit in todayVisits"
            :key="visit.id"
            class="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors"
          >
            <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0 text-sm font-bold text-primary-700">
              {{ visit.petName.slice(0, 1) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-900">{{ visit.petName }}</p>
              <p class="text-xs text-slate-500 truncate">{{ visit.chief_complaint }}</p>
            </div>
            <div class="text-right shrink-0">
              <BaseBadge :color="getVisitTypeColor(visit.visit_type)" size="sm">
                {{ getVisitTypeLabel(visit.visit_type) }}
              </BaseBadge>
              <p class="text-xs text-slate-400 mt-1">{{ visit.vet_name }}</p>
            </div>
          </li>
          <li v-if="todayVisits.length === 0" class="px-5 py-8 text-center text-slate-400 text-sm">
            오늘 예정된 진료가 없습니다
          </li>
        </ul>
      </div>

      <!-- 접종 만기 임박 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">접종 만기 임박 (30일 이내)</h2>
          <RouterLink
            to="/admin/hospital/vaccinations"
            class="text-xs text-primary-600 font-semibold hover:text-primary-700"
          >
            전체 보기 →
          </RouterLink>
        </div>
        <ul class="divide-y divide-slate-100">
          <li
            v-for="vac in upcomingVaccinations"
            :key="vac.id"
            class="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors"
          >
            <div class="w-9 h-9 rounded-full bg-warning-100 flex items-center justify-center shrink-0 text-sm">
              💉
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-900">{{ vac.petName }}</p>
              <p class="text-xs text-slate-500 truncate">{{ vac.vaccine_name }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs font-bold text-warning-600">D-{{ vac.daysLeft }}</p>
              <p class="text-xs text-slate-400">{{ formatDate(vac.next_due_date!) }}</p>
            </div>
          </li>
          <li v-if="upcomingVaccinations.length === 0" class="px-5 py-8 text-center text-slate-400 text-sm">
            30일 이내 만기 예정 접종이 없습니다
          </li>
        </ul>
      </div>
    </div>

    <!-- 최근 진료 내역 -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="text-base font-bold text-slate-900">최근 진료 내역</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">동물/보호자</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">진료 유형</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">주訴</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">진단</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">진료일</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">담당의</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">비용</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="visit in recentVisits"
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
              <td class="px-5 py-3.5 text-slate-700 max-w-[160px] truncate">{{ visit.chief_complaint }}</td>
              <td class="px-5 py-3.5 text-slate-700 max-w-[160px] truncate">{{ visit.diagnosis }}</td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ formatDate(visit.visit_date) }}</td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ visit.vet_name ?? '-' }}</td>
              <td class="px-5 py-3.5 text-xs text-slate-600">
                {{ visit.cost ? visit.cost.toLocaleString() + '원' : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { MOCK_MEDICAL_VISITS, MOCK_VACCINATIONS } from '@/mocks/medicalRecords'
import { MOCK_ORG_PETS } from '@/mocks/pets'
import { mockGetOrgPets } from '@/mocks/organizations'
import type { MedicalVisitType } from '@/types'

const router = useRouter()

const orgPets = mockGetOrgPets('org-hospital-001')

// 오늘 날짜 (데모: 최신 진료 날짜로 대체)
const TODAY = '2026-03-20'

const todayVisits = computed(() =>
  MOCK_MEDICAL_VISITS
    .filter(v => v.visit_date === TODAY)
    .map(v => ({ ...v, petName: getPetName(v.pet_id) }))
)

const recentVisits = computed(() =>
  [...MOCK_MEDICAL_VISITS]
    .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
    .slice(0, 8)
)

const upcomingVaccinations = computed(() => {
  const now = new Date('2026-04-09')
  return MOCK_VACCINATIONS
    .filter(v => v.next_due_date)
    .map(v => {
      const due = new Date(v.next_due_date!)
      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / 86400000)
      return { ...v, daysLeft, petName: getPetName(v.pet_id) }
    })
    .filter(v => v.daysLeft >= 0 && v.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)
})

const kpiStats = computed(() => {
  const totalPets = orgPets.length
  const totalVisits = MOCK_MEDICAL_VISITS.length
  const todayCount = todayVisits.value.length
  const vacDue = upcomingVaccinations.value.length

  return [
    { label: '연동 환축 수', value: totalPets, emoji: '🐾', iconBg: 'bg-primary-50', sub: '기관 연동', subColor: 'text-slate-500' },
    { label: '오늘 진료 건수', value: todayCount, emoji: '🏥', iconBg: 'bg-secondary-50', sub: TODAY, subColor: 'text-secondary-600' },
    { label: '전체 진료 기록', value: totalVisits, emoji: '📋', iconBg: 'bg-success-50', sub: '누적 기록', subColor: 'text-success-600' },
    { label: '접종 만기 임박', value: vacDue, emoji: '⚠️', iconBg: 'bg-warning-50', sub: '30일 이내', subColor: 'text-warning-600' },
  ]
})

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

function getVisitTypeLabel(type: MedicalVisitType): string {
  const map: Record<MedicalVisitType, string> = {
    CHECK_UP: '정기 검진',
    TREATMENT: '치료',
    SURGERY: '수술',
    EMERGENCY: '응급',
  }
  return map[type]
}

function getVisitTypeColor(type: MedicalVisitType): 'primary' | 'success' | 'error' | 'warning' {
  const map: Record<MedicalVisitType, 'primary' | 'success' | 'error' | 'warning'> = {
    CHECK_UP: 'success',
    TREATMENT: 'primary',
    SURGERY: 'warning',
    EMERGENCY: 'error',
  }
  return map[type]
}
</script>
