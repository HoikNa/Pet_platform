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
import type { Pet, HealthScan } from '@/types'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

interface Props {
  pet: Pet
  latestScan?: HealthScan
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), { compact: false })
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
</script>
