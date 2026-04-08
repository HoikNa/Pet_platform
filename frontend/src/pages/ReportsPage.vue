<template>
  <MobileLayout>
    <div class="flex flex-col gap-4 pb-6">
      <!-- 헤더 -->
      <div class="px-4 pt-4">
        <h1 class="text-xl font-bold text-slate-800">스캔 기록</h1>
        <p class="text-sm text-slate-500 mt-1">모든 반려동물의 AI 건강 스캔 이력</p>
      </div>

      <!-- 반려동물 필터 -->
      <div class="px-4">
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            :class="[
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              selectedPetId === null
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
            @click="selectedPetId = null"
          >
            전체
          </button>
          <button
            v-for="pet in pets"
            :key="pet.id"
            :class="[
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              selectedPetId === pet.id
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
            @click="selectedPetId = pet.id"
          >
            {{ pet.name }}
          </button>
        </div>
      </div>

      <!-- 요약 카드 -->
      <div class="grid grid-cols-3 gap-3 px-4">
        <div class="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
          <p class="text-2xl font-bold text-primary-600">{{ filteredScans.length }}</p>
          <p class="text-xs text-slate-500 mt-0.5">총 스캔</p>
        </div>
        <div class="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
          <p class="text-2xl font-bold text-secondary-600">{{ avgBCS }}</p>
          <p class="text-xs text-slate-500 mt-0.5">평균 BCS</p>
        </div>
        <div class="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
          <p class="text-2xl font-bold text-warning-600">{{ lastScanDaysAgo }}</p>
          <p class="text-xs text-slate-500 mt-0.5">마지막 스캔</p>
        </div>
      </div>

      <!-- 스캔 목록 -->
      <div v-if="filteredScans.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-400">
        <svg class="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-sm">스캔 기록이 없습니다</p>
      </div>

      <div v-else class="flex flex-col gap-3 px-4">
        <div
          v-for="scan in filteredScans"
          :key="scan.id"
          class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          @click="router.push(`/scan/report/${scan.id}`)"
        >
          <!-- 카드 헤더 -->
          <div class="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                <img
                  v-if="getPetById(scan.pet_id)?.profile_image_url"
                  :src="getPetById(scan.pet_id)!.profile_image_url"
                  :alt="getPetById(scan.pet_id)?.name"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-xs font-bold text-primary-600">{{ getPetById(scan.pet_id)?.name?.charAt(0) }}</span>
              </div>
              <span class="text-sm font-semibold text-slate-700">{{ getPetById(scan.pet_id)?.name ?? '알 수 없음' }}</span>
            </div>
            <span class="text-xs text-slate-400">{{ formatDate(scan.scan_date) }}</span>
          </div>

          <!-- 카드 내용 -->
          <div class="px-4 py-3">
            <!-- 스캔 유형 배지 -->
            <div class="flex gap-1.5 flex-wrap mb-3">
              <span
                v-for="type in scan.scan_types"
                :key="type"
                class="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
              >
                {{ scanTypeLabel(type) }}
              </span>
            </div>

            <!-- 점수 -->
            <div class="grid grid-cols-3 gap-2">
              <div v-if="scan.bcs_score" class="text-center">
                <p class="text-sm font-bold" :class="bcsColor(scan.bcs_score)">{{ scan.bcs_score }}/9</p>
                <p class="text-xs text-slate-400">BCS</p>
              </div>
              <div v-if="scan.gait_score" class="text-center">
                <p class="text-sm font-bold text-slate-700">{{ scan.gait_score.toFixed(1) }}</p>
                <p class="text-xs text-slate-400">보행</p>
              </div>
              <div v-if="scan.eye_clarity_score" class="text-center">
                <p class="text-sm font-bold text-slate-700">{{ scan.eye_clarity_score.toFixed(1) }}</p>
                <p class="text-xs text-slate-400">안구</p>
              </div>
            </div>

            <!-- AI 코멘트 -->
            <p class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{{ scan.ai_comment }}</p>
          </div>
        </div>
      </div>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePetStore } from '@/stores/petStore'
import { mockGetScansByPetId } from '@/mocks/scans'
import type { HealthScan, Pet, BCSScore } from '@/types'
import MobileLayout from '@/layouts/MobileLayout.vue'

const router = useRouter()
const petStore = usePetStore()

const pets = computed(() => petStore.pets)
const selectedPetId = ref<string | null>(null)

const allScans = ref<HealthScan[]>([])

onMounted(async () => {
  await petStore.fetchPets()
  allScans.value = pets.value.flatMap(pet => mockGetScansByPetId(pet.id))
    .sort((a, b) => new Date(b.scan_date).getTime() - new Date(a.scan_date).getTime())
})

const filteredScans = computed<HealthScan[]>(() => {
  if (!selectedPetId.value) return allScans.value
  return allScans.value.filter(s => s.pet_id === selectedPetId.value)
})

const avgBCS = computed<string>(() => {
  const scansWithBCS = filteredScans.value.filter(s => s.bcs_score)
  if (!scansWithBCS.length) return '-'
  const avg = scansWithBCS.reduce((sum, s) => sum + (s.bcs_score ?? 0), 0) / scansWithBCS.length
  return avg.toFixed(1)
})

const lastScanDaysAgo = computed<string>(() => {
  if (!filteredScans.value.length) return '-'
  const latest = new Date(filteredScans.value[0].scan_date)
  const diffDays = Math.floor((Date.now() - latest.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '오늘'
  return `${diffDays}일 전`
})

function getPetById(petId: string): Pet | undefined {
  return pets.value.find(p => p.id === petId)
}

function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}

function scanTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    BCS: 'BCS 체형',
    GAIT: '보행 분석',
    AGING: '노화 지수',
    VOICE: '음성 감정',
  }
  return labels[type] ?? type
}

function bcsColor(score: BCSScore): string {
  if (score <= 3) return 'text-warning-600'
  if (score <= 5) return 'text-secondary-600'
  if (score <= 6) return 'text-warning-500'
  return 'text-error-500'
}
</script>
