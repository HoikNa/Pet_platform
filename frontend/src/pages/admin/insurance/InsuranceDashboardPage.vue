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
      <!-- 심사 대기 목록 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">심사 대기 청구</h2>
          <RouterLink to="/admin/insurance/claims" class="text-xs text-primary-600 font-semibold hover:text-primary-700">
            전체 보기 →
          </RouterLink>
        </div>
        <ul class="divide-y divide-slate-100">
          <li
            v-for="claim in pendingClaims"
            :key="claim.id"
            class="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
            @click="goToClaimDetail(claim.id)"
          >
            <div :class="['w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0', getRiskBg(claim.risk_score)]">
              {{ claim.risk_score ?? '-' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-900">{{ getPetName(claim.pet_id) }}</p>
              <p class="text-xs text-slate-500 truncate">{{ claim.diagnosis }}</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold text-slate-900">{{ claim.claimed_amount.toLocaleString() }}원</p>
              <p class="text-xs text-slate-400">{{ formatDate(claim.claim_date) }}</p>
            </div>
          </li>
          <li v-if="pendingClaims.length === 0" class="px-5 py-8 text-center text-slate-400 text-sm">
            대기 중인 청구가 없습니다
          </li>
        </ul>
      </div>

      <!-- 청구 상태 분포 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="text-base font-bold text-slate-900">청구 상태 현황</h2>
        </div>
        <div class="p-5 flex flex-col gap-3">
          <div v-for="s in statusDistribution" :key="s.status" class="flex items-center gap-3">
            <div class="w-20 text-xs font-semibold text-slate-600 shrink-0">{{ s.label }}</div>
            <div class="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                :class="['h-full rounded-full transition-all', s.barColor]"
                :style="{ width: `${(s.count / totalClaims) * 100}%` }"
              />
            </div>
            <div class="w-14 text-right text-xs text-slate-600 font-semibold shrink-0">{{ s.count }}건</div>
          </div>
        </div>

        <!-- 이번달 통계 -->
        <div class="mx-5 mb-5 p-4 bg-slate-50 rounded-xl">
          <p class="text-xs font-semibold text-slate-500 mb-2">이번달 (2026년 4월)</p>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-xs text-slate-500">승인 금액</p>
              <p class="text-base font-bold text-success-600">{{ approvedAmount.toLocaleString() }}원</p>
            </div>
            <div>
              <p class="text-xs text-slate-500">평균 리스크 점수</p>
              <p class="text-base font-bold text-slate-900">{{ avgRiskScore }}점</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 최근 청구 내역 -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="text-base font-bold text-slate-900">최근 청구 내역</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">반려동물</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">진단명</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">청구 금액</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">리스크</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">상태</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500">청구일</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="claim in recentClaims"
              :key="claim.id"
              class="hover:bg-primary-50 cursor-pointer transition-colors"
              @click="goToClaimDetail(claim.id)"
            >
              <td class="px-5 py-3.5 font-semibold text-slate-900">{{ getPetName(claim.pet_id) }}</td>
              <td class="px-5 py-3.5 text-slate-700 max-w-[180px] truncate">{{ claim.diagnosis }}</td>
              <td class="px-5 py-3.5 font-semibold text-slate-900">{{ claim.claimed_amount.toLocaleString() }}원</td>
              <td class="px-5 py-3.5">
                <span :class="['text-xs font-bold px-2 py-1 rounded-lg', getRiskBg(claim.risk_score)]">
                  {{ claim.risk_score ?? '-' }}점
                </span>
              </td>
              <td class="px-5 py-3.5">
                <BaseBadge :color="getStatusColor(claim.status)">{{ getStatusLabel(claim.status) }}</BaseBadge>
              </td>
              <td class="px-5 py-3.5 text-xs text-slate-600">{{ formatDate(claim.claim_date) }}</td>
              <td class="px-5 py-3.5">
                <button class="text-xs text-primary-600 font-semibold hover:text-primary-700" @click.stop="goToClaimDetail(claim.id)">
                  상세 →
                </button>
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
import { mockGetAllClaims } from '@/mocks/insurance'
import { MOCK_ORG_PETS } from '@/mocks/pets'
import type { ClaimStatus } from '@/types'

const router = useRouter()
const allClaims = mockGetAllClaims()

const pendingClaims = computed(() => allClaims.filter(c => c.status === 'PENDING' || c.status === 'REVIEWING'))
const recentClaims = computed(() => allClaims.slice(0, 6))
const totalClaims = allClaims.length

const approvedAmount = computed(() =>
  allClaims
    .filter(c => c.status === 'APPROVED' && c.approved_amount)
    .reduce((sum, c) => sum + (c.approved_amount ?? 0), 0)
)

const avgRiskScore = computed(() => {
  const scored = allClaims.filter(c => c.risk_score !== undefined)
  if (scored.length === 0) return 0
  return Math.round(scored.reduce((sum, c) => sum + (c.risk_score ?? 0), 0) / scored.length)
})

const statusDistribution = computed(() => [
  { status: 'PENDING', label: '접수 대기', count: allClaims.filter(c => c.status === 'PENDING').length, barColor: 'bg-slate-400' },
  { status: 'REVIEWING', label: '심사 중', count: allClaims.filter(c => c.status === 'REVIEWING').length, barColor: 'bg-primary-500' },
  { status: 'APPROVED', label: '승인', count: allClaims.filter(c => c.status === 'APPROVED').length, barColor: 'bg-success-500' },
  { status: 'REJECTED', label: '거부', count: allClaims.filter(c => c.status === 'REJECTED').length, barColor: 'bg-error-500' },
])

const kpiStats = computed(() => [
  { label: '전체 청구 건수', value: totalClaims, emoji: '📋', iconBg: 'bg-primary-50', sub: '누적', subColor: 'text-slate-500' },
  { label: '심사 대기', value: pendingClaims.value.length, emoji: '⏳', iconBg: 'bg-warning-50', sub: '처리 필요', subColor: 'text-warning-600' },
  { label: '승인 금액 합계', value: (approvedAmount.value / 10000).toFixed(0) + '만원', emoji: '✅', iconBg: 'bg-success-50', sub: '전체 기간', subColor: 'text-success-600' },
  { label: '평균 리스크 점수', value: avgRiskScore.value, emoji: '🔍', iconBg: 'bg-secondary-50', sub: 'AI 산출', subColor: 'text-secondary-600' },
])

function getPetName(petId: string): string {
  return MOCK_ORG_PETS.find(p => p.id === petId)?.name ?? petId
}

function goToClaimDetail(id: string): void {
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
