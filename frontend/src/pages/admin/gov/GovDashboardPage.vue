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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 등록 신청 대기 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">등록 신청 대기</h2>
          <RouterLink to="/admin/gov/registrations" class="text-xs text-primary-600 font-semibold hover:text-primary-700">
            전체 보기 →
          </RouterLink>
        </div>
        <ul class="divide-y divide-slate-100">
          <li
            v-for="app in pendingApps"
            :key="app.id"
            class="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
            @click="router.push('/admin/gov/registrations')"
          >
            <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 shrink-0">
              {{ getPetName(app.pet_id).slice(0, 1) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-900">{{ getPetName(app.pet_id) }}</p>
              <p class="text-xs text-slate-500">신청인: {{ getOwnerName(app.owner_id) }} · {{ app.district }}</p>
            </div>
            <div class="text-right shrink-0">
              <BaseBadge :color="getAppStatusColor(app.status)">{{ getAppStatusLabel(app.status) }}</BaseBadge>
              <p class="text-xs text-slate-400 mt-1">{{ formatDate(app.applied_at) }}</p>
            </div>
          </li>
          <li v-if="pendingApps.length === 0" class="px-5 py-8 text-center text-slate-400 text-sm">
            처리 대기 신청이 없습니다
          </li>
        </ul>
      </div>

      <!-- 유기동물 신고 현황 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">유기동물 최근 신고</h2>
          <RouterLink to="/admin/gov/shelter" class="text-xs text-primary-600 font-semibold hover:text-primary-700">
            전체 보기 →
          </RouterLink>
        </div>
        <ul class="divide-y divide-slate-100">
          <li
            v-for="report in recentReports"
            :key="report.id"
            class="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
            @click="router.push('/admin/gov/shelter')"
          >
            <div class="w-9 h-9 rounded-full bg-warning-100 flex items-center justify-center text-base shrink-0">
              {{ report.species === 'DOG' ? '🐕' : '🐈' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-900">{{ report.breed ?? report.species }}</p>
              <p class="text-xs text-slate-500 truncate">{{ report.location }}</p>
            </div>
            <div class="text-right shrink-0">
              <BaseBadge :color="getShelterStatusColor(report.status)">{{ getShelterStatusLabel(report.status) }}</BaseBadge>
              <p class="text-xs text-slate-400 mt-1">{{ formatDate(report.report_date) }}</p>
            </div>
          </li>
          <li v-if="recentReports.length === 0" class="px-5 py-8 text-center text-slate-400 text-sm">
            최근 신고 없음
          </li>
        </ul>
      </div>
    </div>

    <!-- 등록 현황 요약 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 동물 등록 상태 분포 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 mb-4">관할 동물 등록 현황</h2>
        <div class="space-y-3">
          <div v-for="item in registrationDistribution" :key="item.label" class="flex items-center gap-3">
            <span class="text-xs text-slate-500 w-20 shrink-0">{{ item.label }}</span>
            <div class="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div :class="['h-full rounded-full', item.barColor]" :style="{ width: `${(item.count / totalPets) * 100}%` }" />
            </div>
            <span class="text-sm font-bold w-10 text-right text-slate-700">{{ item.count }}</span>
          </div>
        </div>
        <div class="mt-4 p-3 bg-primary-50 rounded-xl">
          <p class="text-xs text-primary-700 font-semibold">
            등록 인증률: {{ Math.round((verifiedCount / totalPets) * 100) }}%
            ({{ verifiedCount }} / {{ totalPets }}마리)
          </p>
        </div>
      </div>

      <!-- 종별 분포 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 mb-4">종별 분포</h2>
        <div class="space-y-3">
          <div v-for="item in speciesDistribution" :key="item.label" class="flex items-center gap-3">
            <span class="text-lg shrink-0">{{ item.emoji }}</span>
            <span class="text-xs text-slate-600 w-16 shrink-0 font-semibold">{{ item.label }}</span>
            <div class="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full bg-primary-400 rounded-full" :style="{ width: `${(item.count / totalPets) * 100}%` }" />
            </div>
            <span class="text-sm font-bold w-10 text-right text-slate-700">{{ item.count }}</span>
            <span class="text-xs text-slate-400 w-10 text-right">{{ Math.round((item.count / totalPets) * 100) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { mockGetAllApplications, mockGetAllShelterReports } from '@/mocks/shelter'
import { mockGetOrgPets } from '@/mocks/organizations'
import { MOCK_ORG_PETS } from '@/mocks/pets'
import type { ApplicationStatus, ShelterStatus } from '@/types'

const router = useRouter()

const allApps = mockGetAllApplications()
const allReports = mockGetAllShelterReports()
const orgPets = mockGetOrgPets('org-gov-001')

const OWNERS: Record<string, string> = {
  'user-b2c-001': '김반려',
  'user-b2c-002': '이견주',
  'user-b2c-003': '박고양',
  'user-b2c-004': '최강아',
}

const pendingApps = computed(() => allApps.filter(a => a.status === 'PENDING' || a.status === 'ADDITIONAL_REQUIRED'))
const recentReports = computed(() => allReports.slice(0, 5))
const totalPets = orgPets.length
const verifiedCount = orgPets.filter(i => i.pet.registration_status === 'VERIFIED').length

const registrationDistribution = computed(() => [
  { label: '인증 완료', barColor: 'bg-success-500', count: verifiedCount },
  { label: '대기 중', barColor: 'bg-warning-400', count: orgPets.filter(i => i.pet.registration_status === 'PENDING').length },
])

const speciesDistribution = computed(() => [
  { label: '강아지', emoji: '🐕', count: orgPets.filter(i => i.pet.species === 'DOG').length },
  { label: '고양이', emoji: '🐈', count: orgPets.filter(i => i.pet.species === 'CAT').length },
  { label: '기타', emoji: '🐾', count: orgPets.filter(i => i.pet.species === 'OTHER').length },
])

const kpiStats = computed(() => [
  { label: '관할 등록 동물', value: totalPets, emoji: '🐾', iconBg: 'bg-primary-50', sub: '강남구 전체', subColor: 'text-slate-500' },
  { label: '등록 신청 대기', value: pendingApps.value.length, emoji: '📋', iconBg: 'bg-warning-50', sub: '처리 필요', subColor: 'text-warning-600' },
  { label: '유기동물 신고', value: allReports.filter(r => r.status === 'REPORTED' || r.status === 'SHELTERED').length, emoji: '🏠', iconBg: 'bg-error-50', sub: '처리 중', subColor: 'text-error-600' },
  { label: '인증 완료율', value: Math.round((verifiedCount / totalPets) * 100) + '%', emoji: '✅', iconBg: 'bg-success-50', sub: `${verifiedCount}/${totalPets}마리`, subColor: 'text-success-600' },
])

function getPetName(petId: string): string {
  return MOCK_ORG_PETS.find(p => p.id === petId)?.name ?? petId
}

function getOwnerName(ownerId: string): string {
  return OWNERS[ownerId] ?? ownerId
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
