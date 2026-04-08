<template>
  <!-- 음성 녹음 전체 화면 -->
  <div class="fixed inset-0 bg-slate-900 flex flex-col">
    <!-- 상단 헤더 -->
    <div class="flex items-center justify-between px-4 pt-safe-top py-3 z-10">
      <button
        class="p-2 rounded-full bg-white/10 text-white"
        @click="handleBack"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="text-center">
        <p class="text-white text-sm font-semibold">음성 감정 분석</p>
        <p class="text-white/60 text-xs">{{ petName }} 건강 스캔</p>
      </div>

      <div class="w-9 h-9" />
    </div>

    <!-- 메인 영역 -->
    <div class="flex-1 flex flex-col items-center justify-center gap-8 px-8">

      <!-- 마이크 아이콘 / 파동 애니메이션 -->
      <div class="relative flex items-center justify-center">
        <!-- 파동 링 (녹음 중에만 표시) -->
        <template v-if="recorder.isRecording.value">
          <div class="absolute w-40 h-40 rounded-full bg-primary-500/20 animate-ping" />
          <div class="absolute w-32 h-32 rounded-full bg-primary-500/30 animate-pulse" />
        </template>

        <!-- 마이크 버튼 -->
        <div
          :class="[
            'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 relative z-10',
            recorder.isRecording.value
              ? 'bg-error-500 shadow-lg shadow-error-500/40'
              : 'bg-primary-600 shadow-lg shadow-primary-600/30'
          ]"
        >
          <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
          </svg>
        </div>
      </div>

      <!-- 상태 텍스트 -->
      <div class="text-center">
        <template v-if="recorder.isLoading.value">
          <p class="text-white text-lg font-semibold">마이크 권한 요청 중...</p>
          <p class="text-white/50 text-sm mt-1">잠시만 기다려 주세요</p>
        </template>

        <template v-else-if="recorder.hasPermission.value === false">
          <p class="text-error-400 text-lg font-semibold">마이크 접근이 거부되었습니다</p>
          <p class="text-white/50 text-sm mt-1 leading-relaxed">
            브라우저 설정에서 마이크 접근을<br />허용해 주세요
          </p>
        </template>

        <template v-else-if="recorder.isRecording.value">
          <p class="text-white text-4xl font-mono font-bold tracking-widest">
            {{ formatDuration(recorder.duration.value) }}
          </p>
          <p class="text-white/60 text-sm mt-2">녹음 중 · 아래 버튼을 눌러 완료</p>
        </template>

        <template v-else-if="qualityError">
          <p class="text-error-400 text-base font-semibold">{{ qualityError }}</p>
          <p class="text-white/50 text-sm mt-1">다시 녹음해 주세요</p>
        </template>

        <template v-else>
          <p class="text-white text-lg font-semibold">반려동물의 소리를 녹음하세요</p>
          <p class="text-white/50 text-sm mt-1 leading-relaxed">
            짖는 소리, 울음소리 등 10초 이상<br />자연스러운 소리를 녹음해 주세요
          </p>
        </template>
      </div>

      <!-- 녹음 시간 팁 (대기 상태) -->
      <div
        v-if="!recorder.isRecording.value && recorder.hasPermission.value !== false && !qualityError"
        class="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-2xl"
      >
        <svg class="w-4 h-4 text-white/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-white/60 text-xs leading-relaxed">
          AI가 음성 패턴을 분석하여 반려동물의<br />정서 상태와 건강 이상 여부를 파악합니다
        </p>
      </div>
    </div>

    <!-- 하단 제어 영역 -->
    <div class="bg-black/40 backdrop-blur-sm px-6 py-8 flex flex-col items-center gap-4">

      <!-- 권한 없을 때: 다시 시도 -->
      <button
        v-if="recorder.hasPermission.value === false"
        class="w-full bg-primary-600 text-white py-4 rounded-2xl font-semibold text-base"
        @click="initMicrophone"
      >
        다시 시도
      </button>

      <!-- 녹음 토글 버튼 -->
      <template v-else>
        <button
          :class="[
            'w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all',
            recorder.isRecording.value
              ? 'bg-error-600 scale-90'
              : 'bg-white/10 hover:bg-white/20',
            (recorder.isLoading.value || isProcessing) && 'opacity-50 cursor-not-allowed'
          ]"
          :disabled="recorder.isLoading.value || isProcessing"
          @click="toggleRecording"
        >
          <!-- 정지 아이콘 (녹음 중) / 마이크 아이콘 (대기) -->
          <div
            :class="[
              'transition-all duration-200',
              recorder.isRecording.value ? 'w-7 h-7 bg-white rounded-sm' : 'w-12 h-12 bg-white rounded-full'
            ]"
          />
        </button>

        <p class="text-white/40 text-xs">
          {{ recorder.isRecording.value ? '버튼을 눌러 녹음 완료' : '버튼을 눌러 녹음 시작' }}
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAudioRecorder } from '@/composables/useAudioRecorder'
import { useScanStore } from '@/stores/scanStore'
import { usePetStore } from '@/stores/petStore'

const router = useRouter()
const recorder = useAudioRecorder()
const scanStore = useScanStore()
const petStore = usePetStore()

const isProcessing = ref(false)
const qualityError = ref<string | null>(null)

const MIN_DURATION_SECONDS = 10

const scanSession = computed(() => scanStore.currentSession)
const petName = computed(() => {
  const petId = scanSession.value?.petId
  return petStore.pets.find(p => p.id === petId)?.name ?? '반려동물'
})

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

async function initMicrophone(): Promise<void> {
  await recorder.startMicrophone()
}

async function toggleRecording(): Promise<void> {
  if (recorder.isRecording.value) {
    const blob = await recorder.stopRecording()

    if (recorder.duration.value < MIN_DURATION_SECONDS) {
      qualityError.value = `최소 ${MIN_DURATION_SECONDS}초 이상 녹음해 주세요. (현재 ${recorder.duration.value}초)`
      return
    }

    qualityError.value = null
    scanStore.setCapturedBlob(blob)
    recorder.stopMicrophone()
    isProcessing.value = true
    router.push('/scan/loading')
  } else {
    qualityError.value = null
    recorder.startRecording()
  }
}

function handleBack(): void {
  recorder.stopMicrophone()
  router.back()
}

onMounted(async () => {
  if (!scanSession.value) {
    router.replace('/scan')
    return
  }
  await initMicrophone()
})

onUnmounted(() => {
  recorder.stopMicrophone()
})
</script>
