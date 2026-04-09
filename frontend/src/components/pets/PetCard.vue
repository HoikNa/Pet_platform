<template>
  <div
    :class="[
      'bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden',
      'cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
      compact ? 'flex items-center gap-4 p-4' : '',
    ]"
    @click="$emit('click', pet)"
  >
    <!-- 카드 뷰 (기본) -->
    <template v-if="!compact">
      <!-- 반려동물 이미지 -->
      <div class="relative h-48 bg-slate-100">
        <img
          v-if="pet.profile_image_url"
          :src="pet.profile_image_url"
          :alt="pet.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
          <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>

        <!-- 등록 상태 배지 -->
        <div class="absolute top-3 right-3">
          <BaseBadge :color="pet.registration_status === 'VERIFIED' ? 'success' : 'warning'" dot>
            {{ pet.registration_status === 'VERIFIED' ? '인증 완료' : '등록 중' }}
          </BaseBadge>
        </div>

        <!-- 긴급 알림 뱃지 (이미지 위) -->
        <div v-if="urgentAlertCount > 0" class="absolute top-3 left-3">
          <span class="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
            🚨 {{ urgentAlertCount }}건 주의
          </span>
        </div>
      </div>

      <!-- 정보 영역 -->
      <div class="p-4">
        <div class="flex items-center justify-between mb-1">
          <h3 class="text-lg font-bold text-slate-900">{{ pet.name }}</h3>
          <span class="text-xs text-slate-400">{{ speciesLabel }}</span>
        </div>
        <p class="text-sm text-slate-500 mb-3">
          {{ pet.breed }} · {{ ageText }} · {{ genderLabel }}
          <span v-if="pet.is_neutered" class="ml-1 text-secondary-600">중성화</span>
        </p>

        <!-- 헬스 스코어 미리보기 -->
        <div v-if="latestScan" class="flex items-center gap-3 pt-3 border-t border-slate-100">
          <div class="flex items-center gap-1.5">
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold', bcsColorClass]">
              {{ latestScan.bcs_score }}
            </div>
            <div>
              <p class="text-[10px] text-slate-400 leading-none">BCS</p>
              <p class="text-xs font-medium text-slate-700">{{ bcsLabel }}</p>
            </div>
          </div>
          <div class="h-8 w-px bg-slate-100" />
          <div class="flex items-center gap-1.5">
            <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-sm font-bold text-primary-700">
              {{ latestScan.gait_score.toFixed(0) }}
            </div>
            <div>
              <p class="text-[10px] text-slate-400 leading-none">보행</p>
              <p class="text-xs font-medium text-slate-700">점수</p>
            </div>
          </div>
          <p class="ml-auto text-[10px] text-slate-400">{{ lastScanDate }}</p>
        </div>
        <div v-else class="pt-3 border-t border-slate-100">
          <p class="text-xs text-slate-400 text-center">첫 번째 건강 스캔을 시작해 보세요</p>
        </div>

        <!-- 건강 알림 섹션 -->
        <div v-if="healthAlerts.length > 0" class="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
          <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">건강 알림</p>
          <div
            v-for="alert in healthAlerts"
            :key="alert.key"
            :class="['flex items-center gap-2 rounded-lg px-2.5 py-1.5', alertBgClass(alert.level)]"
          >
            <span class="text-sm shrink-0">{{ alert.icon }}</span>
            <p :class="['text-xs font-medium flex-1', alertTextClass(alert.level)]">{{ alert.message }}</p>
            <span :class="['text-[10px] font-bold px-1.5 py-0.5 rounded-full', alertBadgeClass(alert.level)]">
              {{ alertLevelLabel(alert.level) }}
            </span>
          </div>
        </div>
        <div v-else-if="latestScan || vaccinations.length > 0" class="mt-3 pt-3 border-t border-slate-100">
          <div class="flex items-center gap-1.5 text-secondary-600">
            <span class="text-sm">✅</span>
            <p class="text-xs font-medium">건강 상태 양호 · 알림 없음</p>
          </div>
        </div>
      </div>
    </template>

    <!-- 컴팩트 뷰 -->
    <template v-else>
      <BaseAvatar :src="pet.profile_image_url" :name="pet.name" size="md" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <p class="font-semibold text-slate-900 truncate">{{ pet.name }}</p>
          <BaseBadge :color="pet.registration_status === 'VERIFIED' ? 'success' : 'warning'" size="sm" dot>
            {{ pet.registration_status === 'VERIFIED' ? '인증' : '대기' }}
          </BaseBadge>
        </div>
        <p class="text-xs text-slate-500">{{ pet.breed }} · {{ ageText }}</p>
      </div>
      <svg class="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Pet, HealthScan, Vaccination, MedicalVisit } from '@/types'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

type AlertLevel = 'urgent' | 'warning' | 'info'

interface HealthAlert {
  key: string
  level: AlertLevel
  icon: string
  message: string
}

interface Props {
  pet: Pet
  latestScan?: HealthScan
  compact?: boolean
  vaccinations?: Vaccination[]
  medicalVisits?: MedicalVisit[]
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  vaccinations: () => [],
  medicalVisits: () => [],
})
defineEmits<{ click: [pet: Pet] }>()

const speciesLabel = computed(() => {
  const map = { DOG: '강아지', CAT: '고양이', OTHER: '기타' }
  return map[props.pet.species] ?? props.pet.species
})

const genderLabel = computed(() => props.pet.gender === 'MALE' ? '수컷' : '암컷')

const ageText = computed(() => {
  const birth = new Date(props.pet.birth_date)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (months < 12) return `${months}개월`
  return `${Math.floor(months / 12)}살`
})

const bcsLabel = computed(() => {
  if (!props.latestScan) return ''
  const score = props.latestScan.bcs_score
  if (score <= 3) return '저체중'
  if (score <= 5) return '이상적'
  if (score <= 7) return '과체중'
  return '비만'
})

const bcsColorClass = computed(() => {
  if (!props.latestScan) return 'bg-slate-100 text-slate-500'
  const score = props.latestScan.bcs_score
  if (score <= 3) return 'bg-warning-50 text-warning-700'
  if (score <= 5) return 'bg-secondary-50 text-secondary-700'
  if (score <= 7) return 'bg-warning-50 text-warning-700'
  return 'bg-error-50 text-error-700'
})

const lastScanDate = computed(() => {
  if (!props.latestScan) return ''
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(
    new Date(props.latestScan.scan_date)
  )
})

/** 건강 알림 목록 계산 */
const healthAlerts = computed<HealthAlert[]>(() => {
  const alerts: HealthAlert[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // ── 1. 접종 만료 / 예정 알림 ──
  for (const vac of props.vaccinations) {
    if (!vac.next_due_date) continue
    const due = new Date(vac.next_due_date)
    due.setHours(0, 0, 0, 0)
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      alerts.push({
        key: `vac-overdue-${vac.id}`,
        level: 'urgent',
        icon: '💉',
        message: `${vac.vaccine_name} 접종 기간 ${Math.abs(diffDays)}일 초과`,
      })
    } else if (diffDays <= 14) {
      alerts.push({
        key: `vac-soon-${vac.id}`,
        level: 'urgent',
        icon: '💉',
        message: `${vac.vaccine_name} 접종 D-${diffDays}`,
      })
    } else if (diffDays <= 30) {
      alerts.push({
        key: `vac-upcoming-${vac.id}`,
        level: 'warning',
        icon: '💉',
        message: `${vac.vaccine_name} 접종 D-${diffDays}`,
      })
    }
  }

  // ── 2. BCS 기반 체중 상태 알림 ──
  if (props.latestScan) {
    const bcs = props.latestScan.bcs_score
    if (bcs <= 2) {
      alerts.push({
        key: 'bcs-underweight',
        level: 'urgent',
        icon: '⚖️',
        message: '심각한 저체중 — 수의사 상담 권장',
      })
    } else if (bcs === 3) {
      alerts.push({
        key: 'bcs-slightly-under',
        level: 'warning',
        icon: '⚖️',
        message: '저체중 — 식이 및 체중 관리 필요',
      })
    } else if (bcs === 7) {
      alerts.push({
        key: 'bcs-overweight',
        level: 'warning',
        icon: '⚖️',
        message: '과체중 — 식이 조절 및 운동 필요',
      })
    } else if (bcs >= 8) {
      alerts.push({
        key: 'bcs-obese',
        level: 'urgent',
        icon: '⚖️',
        message: '비만 — 즉시 수의사 상담 권장',
      })
    }
  }

  // ── 3. 정기 진료 예약 알림 ──
  for (const visit of props.medicalVisits) {
    if (!visit.follow_up_date) continue
    const followUp = new Date(visit.follow_up_date)
    followUp.setHours(0, 0, 0, 0)
    const diffDays = Math.ceil((followUp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0 && diffDays >= -7) {
      alerts.push({
        key: `followup-overdue-${visit.id}`,
        level: 'urgent',
        icon: '🏥',
        message: `재진 예약 ${Math.abs(diffDays)}일 지남 — 내원 필요`,
      })
    } else if (diffDays >= 0 && diffDays <= 7) {
      alerts.push({
        key: `followup-soon-${visit.id}`,
        level: 'warning',
        icon: '🏥',
        message: `재진 예약 D-${diffDays} (${visit.hospital_name})`,
      })
    }
  }

  // ── 4. 보행 점수 이상 알림 ──
  if (props.latestScan && props.latestScan.gait_score < 60) {
    alerts.push({
      key: 'gait-low',
      level: props.latestScan.gait_score < 40 ? 'urgent' : 'warning',
      icon: '🦮',
      message: `보행 점수 낮음 (${props.latestScan.gait_score.toFixed(0)}점) — 관절 상태 확인 권장`,
    })
  }

  // ── 5. 눈 건강 알림 ──
  if (props.latestScan && props.latestScan.eye_clarity_score < 60) {
    alerts.push({
      key: 'eye-low',
      level: props.latestScan.eye_clarity_score < 40 ? 'urgent' : 'warning',
      icon: '👁️',
      message: `안구 투명도 낮음 (${props.latestScan.eye_clarity_score.toFixed(0)}점) — 안과 검진 권장`,
    })
  }

  // urgent 먼저, 최대 4개만 표시
  return alerts
    .sort((a, b) => {
      const order: Record<AlertLevel, number> = { urgent: 0, warning: 1, info: 2 }
      return order[a.level] - order[b.level]
    })
    .slice(0, 4)
})

const urgentAlertCount = computed(() =>
  healthAlerts.value.filter(a => a.level === 'urgent').length
)

function alertBgClass(level: AlertLevel): string {
  if (level === 'urgent') return 'bg-red-50'
  if (level === 'warning') return 'bg-amber-50'
  return 'bg-blue-50'
}

function alertTextClass(level: AlertLevel): string {
  if (level === 'urgent') return 'text-red-700'
  if (level === 'warning') return 'text-amber-700'
  return 'text-blue-700'
}

function alertBadgeClass(level: AlertLevel): string {
  if (level === 'urgent') return 'bg-red-100 text-red-700'
  if (level === 'warning') return 'bg-amber-100 text-amber-700'
  return 'bg-blue-100 text-blue-700'
}

function alertLevelLabel(level: AlertLevel): string {
  if (level === 'urgent') return '긴급'
  if (level === 'warning') return '주의'
  return '안내'
}
</script>
