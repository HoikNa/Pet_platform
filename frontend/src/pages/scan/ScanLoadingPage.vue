<template>
  <!-- 전체 화면 로딩 (네비게이션 숨김) -->
  <div class="fixed inset-0 bg-gradient-to-br from-primary-900 to-primary-700 flex flex-col items-center justify-center text-white px-8">
    <!-- 로딩 애니메이션 -->
    <div class="relative mb-8">
      <div class="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center">
        <div class="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
          <svg
            class="w-10 h-10 animate-spin-slow text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
          </svg>
        </div>
      </div>
      <!-- 외부 회전 링 -->
      <div class="absolute inset-0 rounded-full border-4 border-white/20 border-t-white animate-spin" />
    </div>

    <!-- 단계별 상태 텍스트 -->
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold mb-2">{{ currentStepText }}</h2>
      <p class="text-primary-300 text-sm">{{ currentStepSubText }}</p>
    </div>

    <!-- 진행 단계 표시 -->
    <div class="flex flex-col gap-3 w-full max-w-xs">
      <div
        v-for="(step, i) in processSteps"
        :key="step.label"
        :class="[
          'flex items-center gap-3 p-3 rounded-xl transition-all duration-500',
          i < currentStepIndex ? 'bg-white/10' : i === currentStepIndex ? 'bg-white/20' : 'opacity-40',
        ]"
      >
        <div
          :class="[
            'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
            i < currentStepIndex
              ? 'bg-secondary-400'
              : i === currentStepIndex
              ? 'bg-white'
              : 'bg-white/20',
          ]"
        >
          <svg
            v-if="i < currentStepIndex"
            class="w-3.5 h-3.5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          <div v-else-if="i === currentStepIndex" class="w-2.5 h-2.5 bg-primary-600 rounded-full animate-pulse" />
        </div>
        <span
          :class="[
            'text-sm font-medium',
            i <= currentStepIndex ? 'text-white' : 'text-white/50',
          ]"
        >
          {{ step.label }}
        </span>
      </div>
    </div>

    <!-- 재치 있는 로딩 멘트 -->
    <div class="mt-10 text-center">
      <p class="text-primary-300 text-sm italic">{{ funnyText }}</p>
    </div>

    <!-- 백그라운드 안내 (긴 처리 시) -->
    <div v-if="showBackgroundNotice" class="mt-6 bg-white/10 rounded-2xl p-5 w-full max-w-xs text-center">
      <p class="text-sm font-semibold mb-2">분석에 시간이 더 필요해요</p>
      <p class="text-xs text-primary-300 mb-4">완료되면 알림을 드릴게요. 다른 기능을 먼저 사용하셔도 됩니다.</p>
      <button
        class="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-medium transition-colors"
        @click="goToDashboard"
      >
        대시보드로 돌아가기
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScanStore } from '@/stores/scanStore'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const scanStore = useScanStore()
const { success } = useToast()

const currentStepIndex = ref(0)
const showBackgroundNotice = ref(false)

const processSteps = [
  { label: 'S3 업로드 중...', subText: '촬영 데이터를 안전하게 전송하고 있어요' },
  { label: 'AI 분석 대기 중...', subText: 'AI 분석 큐에 등록되었어요' },
  { label: 'BCS 체형 분석 중...', subText: '비만도 지표를 계산하고 있어요' },
  { label: '보행 패턴 분석 중...', subText: '걸음걸이 데이터를 처리하고 있어요' },
  { label: '리포트 생성 중...', subText: 'AI 종합 분석 코멘트를 작성하고 있어요' },
]

const funnyTexts = [
  '🐾 강아지가 열심히 뛰고 있어요...',
  '🧠 AI가 밥먹고 분석 중이에요...',
  '📊 건강 데이터를 꼼꼼히 살펴보는 중...',
  '🔬 최고의 분석을 위해 노력하고 있어요...',
  '⚡ 세계 최고 수준의 AI가 작동 중이에요!',
]

const funnyText = computed(() => funnyTexts[currentStepIndex.value % funnyTexts.length])

const currentStepText = computed(() => processSteps[currentStepIndex.value]?.label ?? '처리 완료!')
const currentStepSubText = computed(() => processSteps[currentStepIndex.value]?.subText ?? '')

function goToDashboard(): void {
  router.push('/dashboard')
}

onMounted(async () => {
  const session = scanStore.currentSession
  if (!session) {
    router.replace('/scan')
    return
  }

  try {
    // Step 0: 업로드 시뮬레이션
    currentStepIndex.value = 0
    await scanStore.simulateUpload()

    // Step 1: 큐 등록
    currentStepIndex.value = 1
    await new Promise(resolve => setTimeout(resolve, 800))

    // Step 2~4: AI 분석
    currentStepIndex.value = 2
    await new Promise(resolve => setTimeout(resolve, 900))

    currentStepIndex.value = 3
    await new Promise(resolve => setTimeout(resolve, 900))

    // 5초 이상 걸리면 백그라운드 안내
    setTimeout(() => {
      if (currentStepIndex.value < processSteps.length - 1) {
        showBackgroundNotice.value = true
      }
    }, 5000)

    currentStepIndex.value = 4
    const newScan = await scanStore.requestScan(session.petId, session.scanTypes)

    // 완료 → 리포트 페이지 이동
    success('분석 완료!', '건강 리포트가 생성되었습니다 🎉')
    scanStore.clearSession()
    router.replace(`/scans/${newScan.id}`)
  } catch {
    router.replace('/scan')
  }
})
</script>
