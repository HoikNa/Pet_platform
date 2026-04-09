<template>
  <div class="flex flex-col gap-6">
    <!-- KPI -->
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 월별 등록 추이 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 mb-4">월별 신규 등록 추이 (2026)</h2>
        <div class="flex items-end gap-2 h-40">
          <div
            v-for="m in monthlyRegistrations"
            :key="m.month"
            class="flex-1 flex flex-col items-center gap-1"
          >
            <span class="text-xs font-semibold text-primary-700">{{ m.count }}</span>
            <div
              class="w-full bg-primary-400 rounded-t-md transition-all"
              :style="{ height: `${(m.count / maxMonthlyCount) * 120}px` }"
            />
            <span class="text-[10px] text-slate-400">{{ m.month }}월</span>
          </div>
        </div>
      </div>

      <!-- 품종별 통계 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 mb-4">품종별 등록 현황 (상위 5개)</h2>
        <div class="space-y-3">
          <div v-for="(breed, idx) in topBreeds" :key="breed.name" class="flex items-center gap-3">
            <span class="text-xs font-bold text-slate-400 w-4 shrink-0">{{ idx + 1 }}</span>
            <span class="text-xs font-semibold text-slate-700 w-24 shrink-0 truncate">{{ breed.name }}</span>
            <div class="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-secondary-400 rounded-full"
                :style="{ width: `${(breed.count / topBreeds[0].count) * 100}%` }"
              />
            </div>
            <span class="text-sm font-bold w-8 text-right text-slate-700">{{ breed.count }}</span>
          </div>
        </div>
      </div>

      <!-- 접종률 현황 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 mb-4">백신별 접종 현황</h2>
        <div class="space-y-4">
          <div v-for="vac in vaccinationStats" :key="vac.name">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-semibold text-slate-700">{{ vac.name }}</span>
              <span :class="['text-xs font-bold', vac.rate >= 80 ? 'text-success-600' : vac.rate >= 50 ? 'text-warning-600' : 'text-error-600']">
                {{ vac.rate }}%
              </span>
            </div>
            <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                :class="['h-full rounded-full transition-all', vac.rate >= 80 ? 'bg-success-400' : vac.rate >= 50 ? 'bg-warning-400' : 'bg-error-400']"
                :style="{ width: `${vac.rate}%` }"
              />
            </div>
            <p class="text-[10px] text-slate-400 mt-0.5">{{ vac.count }}마리 / {{ totalPets }}마리</p>
          </div>
        </div>
      </div>

      <!-- 유기동물 현황 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 mb-4">유기동물 처리 현황</h2>
        <div class="space-y-3">
          <div v-for="item in shelterStats" :key="item.status" class="flex items-center gap-3">
            <div :class="['w-3 h-3 rounded-full shrink-0', item.dot]" />
            <span class="text-sm font-semibold text-slate-700 w-20 shrink-0">{{ item.label }}</span>
            <div class="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                :class="['h-full rounded-full', item.bar]"
                :style="{ width: `${totalReports ? (item.count / totalReports) * 100 : 0}%` }"
              />
            </div>
            <span class="text-sm font-bold w-8 text-right text-slate-700">{{ item.count }}</span>
          </div>
        </div>
        <div class="mt-4 p-3 bg-slate-50 rounded-xl text-center">
          <p class="text-xs text-slate-500">입양률</p>
          <p class="text-2xl font-black text-success-600">
            {{ totalReports ? Math.round((shelterStats.find(s => s.status === 'ADOPTED')?.count ?? 0) / totalReports * 100) : 0 }}%
          </p>
        </div>
      </div>
    </div>

    <!-- 주의 지표 -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h2 class="text-base font-bold text-slate-900 mb-4">관리 주의 지표</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 bg-error-50 rounded-xl border border-error-100">
          <p class="text-xs font-semibold text-error-700 mb-1">광견병 미접종</p>
          <p class="text-2xl font-black text-error-700">{{ rabiesUnvaccinated }}마리</p>
          <p class="text-xs text-error-600 mt-1">즉시 접종 권고 대상</p>
        </div>
        <div class="p-4 bg-warning-50 rounded-xl border border-warning-100">
          <p class="text-xs font-semibold text-warning-700 mb-1">등록 미완료</p>
          <p class="text-2xl font-black text-warning-700">{{ unregisteredCount }}마리</p>
          <p class="text-xs text-warning-600 mt-1">생체 인증 필요</p>
        </div>
        <div class="p-4 bg-primary-50 rounded-xl border border-primary-100">
          <p class="text-xs font-semibold text-primary-700 mb-1">신규 신청 대기</p>
          <p class="text-2xl font-black text-primary-700">{{ pendingAppsCount }}건</p>
          <p class="text-xs text-primary-600 mt-1">처리 필요</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mockGetAllApplications, mockGetAllShelterReports } from '@/mocks/shelter'
import { mockGetOrgPets } from '@/mocks/organizations'
import { MOCK_VACCINATIONS } from '@/mocks/medicalRecords'

const orgPets = mockGetOrgPets('org-gov-001')
const allApps = mockGetAllApplications()
const allReports = mockGetAllShelterReports()

const totalPets = orgPets.length
const totalReports = allReports.length
const unregisteredCount = orgPets.filter(i => i.pet.registration_status === 'PENDING').length
const pendingAppsCount = allApps.filter(a => a.status === 'PENDING' || a.status === 'ADDITIONAL_REQUIRED').length

const rabiesUnvaccinated = computed(() => {
  const vaccinatedPetIds = new Set(
    MOCK_VACCINATIONS
      .filter(v => v.vaccination_type === 'RABIES')
      .map(v => v.pet_id)
  )
  return orgPets.filter(i => !vaccinatedPetIds.has(i.pet.id)).length
})

// 월별 신규 등록 (데모 데이터)
const monthlyRegistrations = [
  { month: 1, count: 2 },
  { month: 2, count: 3 },
  { month: 3, count: 1 },
  { month: 4, count: 2 },
  { month: 5, count: 0 },
  { month: 6, count: 0 },
]
const maxMonthlyCount = Math.max(...monthlyRegistrations.map(m => m.count), 1)

// 품종별 분포
const topBreeds = computed(() => {
  const map = new Map<string, number>()
  orgPets.forEach(i => {
    map.set(i.pet.breed, (map.get(i.pet.breed) ?? 0) + 1)
  })
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

// 백신 접종률
const vaccinationStats = computed(() => {
  const vaccines = [
    { name: '광견병 백신', type: 'RABIES' as const },
    { name: '종합 백신 (DHPPL/FVRCP)', type: 'CORE' as const },
    { name: '비핵심 백신', type: 'NON_CORE' as const },
  ]
  return vaccines.map(v => {
    const vaccinatedIds = new Set(
      MOCK_VACCINATIONS.filter(vac => vac.vaccination_type === v.type).map(vac => vac.pet_id)
    )
    const count = orgPets.filter(i => vaccinatedIds.has(i.pet.id)).length
    return {
      name: v.name,
      count,
      rate: totalPets ? Math.round((count / totalPets) * 100) : 0,
    }
  })
})

// 유기동물 통계
const shelterStats = computed(() => [
  { status: 'REPORTED', label: '신고 접수', dot: 'bg-error-500', bar: 'bg-error-400', count: allReports.filter(r => r.status === 'REPORTED').length },
  { status: 'SHELTERED', label: '보호 중', dot: 'bg-warning-500', bar: 'bg-warning-400', count: allReports.filter(r => r.status === 'SHELTERED').length },
  { status: 'ADOPTED', label: '입양', dot: 'bg-success-500', bar: 'bg-success-400', count: allReports.filter(r => r.status === 'ADOPTED').length },
  { status: 'RETURNED', label: '반환', dot: 'bg-primary-500', bar: 'bg-primary-400', count: allReports.filter(r => r.status === 'RETURNED').length },
])

const kpiStats = computed(() => [
  { label: '관할 등록 동물', value: totalPets, emoji: '🐾', iconBg: 'bg-primary-50', sub: '강남구 전체', subColor: 'text-slate-500' },
  { label: '등록 완료율', value: Math.round(((totalPets - unregisteredCount) / totalPets) * 100) + '%', emoji: '✅', iconBg: 'bg-success-50', sub: `${totalPets - unregisteredCount}/${totalPets}마리`, subColor: 'text-success-600' },
  { label: '누적 유기동물 신고', value: totalReports, emoji: '🏠', iconBg: 'bg-warning-50', sub: '전체 기간', subColor: 'text-warning-600' },
  { label: '광견병 미접종', value: rabiesUnvaccinated.value, emoji: '💉', iconBg: 'bg-error-50', sub: '접종 권고 필요', subColor: 'text-error-600' },
])
</script>
