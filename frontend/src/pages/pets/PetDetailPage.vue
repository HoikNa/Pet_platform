<template>
  <div v-if="pet" class="flex flex-col">
    <!-- 히어로 이미지 -->
    <div class="relative h-64 bg-slate-100">
      <img
        v-if="pet.profile_image_url"
        :src="pet.profile_image_url"
        :alt="pet.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="text-7xl">{{ pet.species === 'DOG' ? '🐶' : '🐱' }}</span>
      </div>

      <!-- 등록 상태 배지 -->
      <div class="absolute top-4 right-4">
        <BaseBadge :color="pet.registration_status === 'VERIFIED' ? 'success' : 'warning'" dot>
          {{ pet.registration_status === 'VERIFIED' ? '생체 인식 인증 완료' : '등록 대기 중' }}
        </BaseBadge>
      </div>
    </div>

    <!-- 정보 영역 -->
    <div class="px-4 py-5 bg-white border-b border-slate-100 flex flex-col gap-4">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900">{{ pet.name }}</h1>
          <p class="text-sm text-slate-500">{{ pet.breed }} · {{ speciesLabel }} · {{ ageText }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-400">성별</p>
          <p class="font-semibold text-slate-700">{{ genderLabel }}{{ pet.is_neutered ? ' (중성화)' : '' }}</p>
        </div>
      </div>

      <!-- 기본 정보 그리드 -->
      <div class="grid grid-cols-3 gap-3">
        <div
          v-for="info in petInfoItems"
          :key="info.label"
          class="bg-slate-50 rounded-xl p-3 text-center"
        >
          <p class="text-xs text-slate-400 mb-1">{{ info.label }}</p>
          <p class="font-bold text-slate-800 text-sm">{{ info.value }}</p>
        </div>
      </div>
    </div>

    <!-- 헬스 스캔 히스토리 -->
    <div class="px-4 py-5 bg-slate-50 flex-1">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-bold text-slate-900">건강 스캔 기록</h2>
        <p class="text-xs text-slate-400">{{ scans.length }}회</p>
      </div>

      <!-- 로딩 -->
      <div v-if="scanStore.isLoading" class="flex justify-center py-8">
        <svg class="w-7 h-7 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <!-- 스캔 없음 -->
      <div v-else-if="scans.length === 0" class="text-center py-10">
        <p class="text-3xl mb-3">🔬</p>
        <p class="text-sm font-medium text-slate-700 mb-1">아직 건강 스캔이 없어요</p>
        <p class="text-xs text-slate-500">아래 버튼을 눌러 첫 번째 AI 건강 스캔을 시작해 보세요</p>
      </div>

      <!-- 스캔 목록 -->
      <div v-else class="flex flex-col gap-3">
        <!-- BCS 트렌드 미니 차트 -->
        <div class="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <p class="text-xs font-semibold text-slate-500 mb-3">BCS 추이 (최근 6회)</p>
          <div class="flex items-end gap-1.5 h-16">
            <div
              v-for="scan in recentScansForChart"
              :key="scan.id"
              class="flex-1 flex flex-col items-center gap-1"
            >
              <span class="text-[10px] text-slate-500 font-medium">{{ scan.bcs_score }}</span>
              <div
                :class="['w-full rounded-t transition-all', getBCSBarColor(scan.bcs_score)]"
                :style="{ height: `${(scan.bcs_score / 9) * 48}px` }"
              />
              <span class="text-[9px] text-slate-400 rotate-0">{{ formatShortDate(scan.scan_date) }}</span>
            </div>
          </div>
        </div>

        <!-- 스캔 리스트 -->
        <div
          v-for="scan in scans"
          :key="scan.id"
          class="bg-white rounded-xl p-4 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all"
          @click="router.push(`/scans/${scan.id}`)"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="text-xs text-slate-400">{{ formatDate(scan.scan_date) }}</p>
              <p class="text-sm font-semibold text-slate-800 mt-0.5">BCS {{ scan.bcs_score }}점 · {{ bcsLabel(scan.bcs_score) }}</p>
            </div>
            <BaseBadge :color="getBCSBadgeColor(scan.bcs_score)">
              {{ bcsLabel(scan.bcs_score) }}
            </BaseBadge>
          </div>
          <p class="text-xs text-slate-500 line-clamp-2">{{ scan.ai_comment }}</p>
          <div class="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
            <span class="text-[11px] text-slate-400">보행 {{ scan.gait_score.toFixed(0) }}점</span>
            <span class="text-slate-200">·</span>
            <span class="text-[11px] text-slate-400">안구 {{ scan.eye_clarity_score.toFixed(0) }}점</span>
            <div class="flex gap-1 ml-auto">
              <BaseBadge
                v-for="type in scan.scan_types"
                :key="type"
                color="slate"
                size="sm"
              >{{ type }}</BaseBadge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB 버튼 (새 스캔 시작) -->
    <div class="fixed bottom-20 right-4 z-30">
      <button
        class="flex items-center gap-2 bg-primary-600 text-white px-5 py-3.5 rounded-2xl shadow-lg hover:bg-primary-700 active:bg-primary-800 transition-all font-semibold text-sm"
        @click="startNewScan"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        새로운 건강 스캔
      </button>
    </div>
  </div>

  <!-- 로딩 -->
  <div v-else class="flex items-center justify-center min-h-screen">
    <svg class="w-8 h-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePetStore } from '@/stores/petStore'
import { useScanStore } from '@/stores/scanStore'
import type { HealthScan, BCSScore } from '@/types'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const route = useRoute()
const router = useRouter()
const petStore = usePetStore()
const scanStore = useScanStore()

const petId = route.params.id as string
const pet = computed(() => petStore.pets.find(p => p.id === petId) ?? null)
const scans = ref<HealthScan[]>([])

const speciesLabel = computed(() => {
  const map = { DOG: '강아지', CAT: '고양이', OTHER: '기타' }
  return pet.value ? map[pet.value.species] : ''
})

const genderLabel = computed(() => pet.value?.gender === 'MALE' ? '수컷' : '암컷')

const ageText = computed(() => {
  if (!pet.value) return ''
  const birth = new Date(pet.value.birth_date)
  const months = (new Date().getFullYear() - birth.getFullYear()) * 12 + (new Date().getMonth() - birth.getMonth())
  return months < 12 ? `${months}개월` : `${Math.floor(months / 12)}살`
})

const petInfoItems = computed(() => [
  { label: '나이', value: ageText.value },
  { label: '체중', value: pet.value?.weight ? `${pet.value.weight}kg` : '-' },
  { label: '스캔 횟수', value: `${scans.value.length}회` },
])

const recentScansForChart = computed(() => scans.value.slice(0, 6).reverse())

function bcsLabel(score: BCSScore | number): string {
  if (score <= 3) return '저체중'
  if (score <= 5) return '이상적'
  if (score <= 7) return '과체중'
  return '비만'
}

function getBCSBadgeColor(score: BCSScore | number): 'success' | 'warning' | 'error' {
  if (score >= 4 && score <= 5) return 'success'
  if (score === 3 || (score >= 6 && score <= 7)) return 'warning'
  return 'error'
}

function getBCSBarColor(score: BCSScore | number): string {
  if (score <= 3) return 'bg-warning-300'
  if (score <= 5) return 'bg-secondary-400'
  if (score <= 7) return 'bg-warning-400'
  return 'bg-error-400'
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr))
}

function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(new Date(dateStr))
}

function startNewScan(): void {
  petStore.selectPet(petId)
  router.push('/scan')
}

onMounted(async () => {
  // 반려동물 정보 로드
  if (!pet.value) {
    await petStore.fetchPetById(petId)
  }
  // 스캔 기록 로드
  scans.value = await scanStore.fetchScansByPetId(petId)
})
</script>
