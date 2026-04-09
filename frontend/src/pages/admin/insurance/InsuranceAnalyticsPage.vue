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
      <!-- 리스크 등급 분포 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 mb-4">AI 리스크 등급 분포</h2>
        <div class="space-y-4">
          <div v-for="tier in riskTiers" :key="tier.label" class="flex items-center gap-3">
            <div :class="['w-3 h-3 rounded-full shrink-0', tier.dot]" />
            <span class="text-sm font-semibold w-16 shrink-0" :class="tier.textColor">{{ tier.label }}</span>
            <div class="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                :class="['h-full rounded-full transition-all', tier.bar]"
                :style="{ width: `${(tier.count / allClaims.length) * 100}%` }"
              />
            </div>
            <span class="text-sm font-bold w-12 text-right text-slate-700">{{ tier.count }}건</span>
            <span class="text-xs text-slate-400 w-10 text-right">
              {{ Math.round((tier.count / allClaims.length) * 100) }}%
            </span>
          </div>
        </div>
        <div class="mt-5 p-4 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed">
          <p class="font-semibold text-slate-700 mb-1">리스크 산출 기준</p>
          <p>AI 건강 스캔(BCS, 보행, 안구 선명도) + 진료 이력 + 품종별 유전 질환 통계를 종합하여 0~100점으로 산출합니다.</p>
        </div>
      </div>

      <!-- 청구 금액대 분포 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 mb-4">청구 금액대 분포</h2>
        <div class="space-y-4">
          <div v-for="tier in amountTiers" :key="tier.label" class="flex items-center gap-3">
            <span class="text-xs text-slate-500 w-24 shrink-0">{{ tier.label }}</span>
            <div class="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-400 rounded-full transition-all"
                :style="{ width: `${(tier.count / allClaims.length) * 100}%` }"
              />
            </div>
            <span class="text-sm font-bold w-10 text-right text-slate-700">{{ tier.count }}건</span>
          </div>
        </div>
        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="bg-slate-50 rounded-xl p-3 text-center">
            <p class="text-xs text-slate-500">평균 청구액</p>
            <p class="text-lg font-bold text-slate-900">{{ avgAmount.toLocaleString() }}원</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-3 text-center">
            <p class="text-xs text-slate-500">최고 청구액</p>
            <p class="text-lg font-bold text-slate-900">{{ maxAmount.toLocaleString() }}원</p>
          </div>
        </div>
      </div>

      <!-- 진단명별 청구 현황 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 mb-4">진단명별 청구 현황</h2>
        <div class="space-y-3">
          <div
            v-for="diag in diagnosisStats"
            :key="diag.name"
            class="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-900 truncate">{{ diag.name }}</p>
              <p class="text-xs text-slate-500">{{ diag.count }}건 · 평균 {{ diag.avgAmount.toLocaleString() }}원</p>
            </div>
            <span :class="['text-xs font-bold px-2 py-1 rounded-lg ml-3 shrink-0', diag.riskClass]">
              리스크 {{ diag.avgRisk }}점
            </span>
          </div>
        </div>
      </div>

      <!-- 반려동물별 청구 현황 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 class="text-base font-bold text-slate-900 mb-4">반려동물별 누적 청구</h2>
        <div class="space-y-3">
          <div
            v-for="pet in petClaimStats"
            :key="pet.petId"
            class="flex items-center gap-3"
          >
            <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 shrink-0">
              {{ pet.name.slice(0, 1) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-slate-900">{{ pet.name }}</p>
                <p class="text-sm font-bold text-slate-900">{{ pet.totalAmount.toLocaleString() }}원</p>
              </div>
              <div class="flex items-center justify-between mt-0.5">
                <p class="text-xs text-slate-500">{{ pet.count }}건 청구</p>
                <p :class="['text-xs font-semibold', getRiskTextClass(pet.avgRisk)]">
                  평균 리스크 {{ pet.avgRisk }}점
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mockGetAllClaims } from '@/mocks/insurance'
import { MOCK_ORG_PETS } from '@/mocks/pets'

const allClaims = mockGetAllClaims()

const riskTiers = computed(() => [
  { label: '저위험', dot: 'bg-success-500', bar: 'bg-success-400', textColor: 'text-success-700', count: allClaims.filter(c => (c.risk_score ?? 0) < 30).length },
  { label: '중위험', dot: 'bg-warning-500', bar: 'bg-warning-400', textColor: 'text-warning-700', count: allClaims.filter(c => (c.risk_score ?? 0) >= 30 && (c.risk_score ?? 0) < 60).length },
  { label: '고위험', dot: 'bg-error-500', bar: 'bg-error-400', textColor: 'text-error-700', count: allClaims.filter(c => (c.risk_score ?? 0) >= 60).length },
])

const amountTiers = computed(() => [
  { label: '5만원 미만', count: allClaims.filter(c => c.claimed_amount < 50000).length },
  { label: '5~10만원', count: allClaims.filter(c => c.claimed_amount >= 50000 && c.claimed_amount < 100000).length },
  { label: '10~50만원', count: allClaims.filter(c => c.claimed_amount >= 100000 && c.claimed_amount < 500000).length },
  { label: '50만원 이상', count: allClaims.filter(c => c.claimed_amount >= 500000).length },
])

const avgAmount = computed(() =>
  Math.round(allClaims.reduce((s, c) => s + c.claimed_amount, 0) / allClaims.length)
)

const maxAmount = computed(() =>
  Math.max(...allClaims.map(c => c.claimed_amount))
)

const diagnosisStats = computed(() => {
  const map = new Map<string, { count: number; totalAmount: number; totalRisk: number }>()
  allClaims.forEach(c => {
    const key = c.diagnosis
    const prev = map.get(key) ?? { count: 0, totalAmount: 0, totalRisk: 0 }
    map.set(key, {
      count: prev.count + 1,
      totalAmount: prev.totalAmount + c.claimed_amount,
      totalRisk: prev.totalRisk + (c.risk_score ?? 0),
    })
  })
  return Array.from(map.entries())
    .map(([name, v]) => ({
      name,
      count: v.count,
      avgAmount: Math.round(v.totalAmount / v.count),
      avgRisk: Math.round(v.totalRisk / v.count),
      riskClass: getRiskBg(Math.round(v.totalRisk / v.count)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
})

const petClaimStats = computed(() => {
  const map = new Map<string, { count: number; totalAmount: number; totalRisk: number }>()
  allClaims.forEach(c => {
    const prev = map.get(c.pet_id) ?? { count: 0, totalAmount: 0, totalRisk: 0 }
    map.set(c.pet_id, {
      count: prev.count + 1,
      totalAmount: prev.totalAmount + c.claimed_amount,
      totalRisk: prev.totalRisk + (c.risk_score ?? 0),
    })
  })
  return Array.from(map.entries())
    .map(([petId, v]) => ({
      petId,
      name: MOCK_ORG_PETS.find(p => p.id === petId)?.name ?? petId,
      count: v.count,
      totalAmount: v.totalAmount,
      avgRisk: Math.round(v.totalRisk / v.count),
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
})

const kpiStats = computed(() => {
  const highRisk = allClaims.filter(c => (c.risk_score ?? 0) >= 60).length
  const approvedRate = Math.round((allClaims.filter(c => c.status === 'APPROVED').length / allClaims.length) * 100)
  return [
    { label: '전체 분석 건수', value: allClaims.length, emoji: '📊', iconBg: 'bg-primary-50', sub: '누적', subColor: 'text-slate-500' },
    { label: '고위험 (60점↑)', value: highRisk, emoji: '🚨', iconBg: 'bg-error-50', sub: '집중 모니터링 필요', subColor: 'text-error-600' },
    { label: '평균 청구액', value: (avgAmount.value / 1000).toFixed(0) + '천원', emoji: '💰', iconBg: 'bg-success-50', sub: '전체 평균', subColor: 'text-success-600' },
    { label: '승인율', value: approvedRate + '%', emoji: '✅', iconBg: 'bg-secondary-50', sub: '전체 청구 대비', subColor: 'text-secondary-600' },
  ]
})

function getRiskBg(score?: number): string {
  if (score === undefined || score === null) return 'bg-slate-100 text-slate-600'
  if (score >= 60) return 'bg-error-100 text-error-700'
  if (score >= 30) return 'bg-warning-100 text-warning-700'
  return 'bg-success-100 text-success-700'
}

function getRiskTextClass(score?: number): string {
  if (score === undefined || score === null) return 'text-slate-500'
  if (score >= 60) return 'text-error-600'
  if (score >= 30) return 'text-warning-600'
  return 'text-success-600'
}
</script>
