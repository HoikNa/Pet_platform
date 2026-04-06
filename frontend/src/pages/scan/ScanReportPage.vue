<template>
  <div v-if="scan" class="flex flex-col gap-0">
    <!-- 헤더 배경 -->
    <div class="bg-gradient-to-br from-primary-800 to-primary-600 px-6 pt-6 pb-12 text-white">
      <div class="flex items-center gap-3 mb-4">
        <BaseAvatar :src="pet?.profile_image_url" :name="pet?.name" size="md" />
        <div>
          <p class="font-bold">{{ pet?.name }}</p>
          <p class="text-xs text-primary-300">{{ formatDate(scan.scan_date) }}</p>
        </div>
        <BaseBadge color="secondary" class="ml-auto">리포트 완료</BaseBadge>
      </div>

      <!-- 종합 점수 -->
      <div class="text-center">
        <p class="text-primary-300 text-xs mb-1">종합 건강 점수</p>
        <p class="text-5xl font-black">{{ overallScore }}<span class="text-2xl font-normal text-primary-300">/100</span></p>
        <p :class="['text-sm font-semibold mt-1', overallGradeColor]">{{ overallGrade }}</p>
      </div>
    </div>

    <!-- 콘텐츠 -->
    <div class="-mt-6 bg-slate-50 rounded-t-3xl px-4 pt-6 flex flex-col gap-5">
      <!-- 스캔 결과 차트 -->
      <ScanResultChart :scan="scan" />

      <!-- 맞춤 케어 추천 -->
      <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 class="text-sm font-bold text-slate-900 mb-4">🌿 맞춤 케어 추천</h3>
        <div class="flex flex-col gap-3">
          <div
            v-for="rec in careRecommendations"
            :key="rec.title"
            class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl"
          >
            <span class="text-xl shrink-0">{{ rec.emoji }}</span>
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ rec.title }}</p>
              <p class="text-xs text-slate-600 mt-0.5">{{ rec.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- B2B/IR CTA -->
      <div class="bg-gradient-to-br from-primary-900 to-primary-700 rounded-2xl p-5 text-white">
        <h3 class="font-bold mb-1">보험사/병원 연동 서비스</h3>
        <p class="text-sm text-primary-300 mb-4">이 리포트를 파트너 병원 및 보험사와 안전하게 공유하세요</p>
        <div class="flex gap-2">
          <button class="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-sm font-medium transition-colors">
            병원 공유
          </button>
          <button class="flex-1 bg-secondary-500 hover:bg-secondary-600 py-2.5 rounded-xl text-sm font-medium transition-colors">
            보험 연동
          </button>
        </div>
      </div>

      <!-- 이전/다음 리포트 네비게이션 -->
      <div class="flex gap-3">
        <BaseButton variant="outline" fullWidth @click="router.back()">
          ← 이전
        </BaseButton>
        <BaseButton variant="outline" fullWidth @click="startNewScan">
          새 스캔 시작 →
        </BaseButton>
      </div>

      <div class="h-4" />
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
import { useScanStore } from '@/stores/scanStore'
import { usePetStore } from '@/stores/petStore'
import type { HealthScan } from '@/types'
import ScanResultChart from '@/components/scan/ScanResultChart.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

const route = useRoute()
const router = useRouter()
const scanStore = useScanStore()
const petStore = usePetStore()

const scan = ref<HealthScan | null>(null)
const pet = computed(() => petStore.pets.find(p => p.id === scan.value?.pet_id))

const overallScore = computed(() => {
  if (!scan.value) return 0
  const bcsScore = scan.value.bcs_score >= 4 && scan.value.bcs_score <= 5
    ? 100
    : Math.max(0, 100 - Math.abs(scan.value.bcs_score - 4.5) * 20)
  return Math.round((bcsScore + scan.value.gait_score + scan.value.eye_clarity_score) / 3)
})

const overallGrade = computed(() => {
  const score = overallScore.value
  if (score >= 90) return '매우 건강함 ✨'
  if (score >= 75) return '건강함 😊'
  if (score >= 60) return '양호함 🙂'
  return '관리 필요 ⚠️'
})

const overallGradeColor = computed(() => {
  const score = overallScore.value
  if (score >= 90) return 'text-secondary-300'
  if (score >= 75) return 'text-white'
  if (score >= 60) return 'text-warning-300'
  return 'text-error-300'
})

const careRecommendations = computed(() => {
  if (!scan.value) return []
  const recs = []
  const bcs = scan.value.bcs_score

  if (bcs >= 6) {
    recs.push({ emoji: '🥗', title: '식이 조절 권장', desc: '하루 식사량을 10~15% 줄이고 고단백 저지방 사료로 전환을 고려하세요.' })
    recs.push({ emoji: '🏃', title: '운동량 증가', desc: '하루 30분 이상의 활발한 산책이나 놀이 시간을 늘려주세요.' })
  } else if (bcs <= 3) {
    recs.push({ emoji: '🍖', title: '칼로리 증가 필요', desc: '영양이 풍부한 사료로 교체하고 급여량을 10~20% 늘려보세요.' })
  } else {
    recs.push({ emoji: '✅', title: '이상적인 체형 유지', desc: '현재 식이 관리와 운동 루틴을 유지하세요. 잘 하고 있어요!' })
  }

  if (scan.value.gait_score < 75) {
    recs.push({ emoji: '🩺', title: '보행 이상 소견', desc: '관절 건강 검진을 권장합니다. 가까운 동물병원에 방문해 보세요.' })
  }

  recs.push({ emoji: '📅', title: '다음 스캔 예약', desc: '4~8주 후 재스캔으로 변화를 추적하세요.' })
  return recs
})

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr))
}

function startNewScan(): void {
  router.push('/scan')
}

onMounted(async () => {
  const scanId = route.params.id as string
  const loaded = await scanStore.fetchScanById(scanId)
  scan.value = loaded

  if (loaded && !pet.value) {
    await petStore.fetchPetById(loaded.pet_id)
  }
})
</script>
