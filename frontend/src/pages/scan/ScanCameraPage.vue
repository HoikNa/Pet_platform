<template>
  <!-- 카메라 전체 화면 (네비게이션 숨김) -->
  <div class="fixed inset-0 bg-black flex flex-col">
    <!-- 상단 헤더 -->
    <div class="flex items-center justify-between px-4 pt-safe-top py-3 z-10">
      <button
        class="p-2 rounded-full bg-black/30 text-white"
        @click="handleBack"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="text-center">
        <p class="text-white text-sm font-semibold">{{ scanSession?.scanTypes.join(' · ') }}</p>
        <p class="text-white/60 text-xs">{{ petName }} 건강 스캔</p>
      </div>

      <button
        class="p-2 rounded-full bg-black/30 text-white"
        @click="camera.switchCamera()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- 카메라 프리뷰 -->
    <div class="flex-1 relative">
      <video
        ref="videoEl"
        autoplay
        playsinline
        muted
        class="w-full h-full object-cover"
      />

      <!-- 스캔 가이드 오버레이 -->
      <div class="absolute inset-0 pointer-events-none">
        <svg class="w-full h-full" viewBox="0 0 390 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <mask id="scan-mask">
              <rect width="390" height="600" fill="white" />
              <ellipse cx="195" cy="280" rx="160" ry="200" fill="black" />
            </mask>
          </defs>
          <rect width="390" height="600" fill="rgba(0,0,0,0.4)" mask="url(#scan-mask)" />
          <!-- 스캔 프레임 -->
          <ellipse cx="195" cy="280" rx="160" ry="200" fill="none" stroke="white" stroke-width="2" stroke-dasharray="10,5" opacity="0.8" />
          <!-- 모서리 마커 -->
          <path d="M55 130 L55 100 L85 100" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M305 130 L305 100 L275 100" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M55 430 L55 460 L85 460" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M305 430 L305 460 L275 460" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" />
          <!-- 중심 십자선 -->
          <line x1="188" y1="280" x2="202" y2="280" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" />
          <line x1="195" y1="273" x2="195" y2="287" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" />
        </svg>

        <!-- 녹화 중 표시 -->
        <div v-if="camera.isRecording.value" class="absolute top-16 left-0 right-0 flex justify-center">
          <div class="flex items-center gap-2 bg-error-600/90 px-4 py-1.5 rounded-full">
            <span class="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span class="text-white text-xs font-bold">REC {{ recordingTime }}s</span>
          </div>
        </div>

        <!-- 안내 텍스트 -->
        <div class="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
          <p class="text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {{ guideText }}
          </p>
        </div>
      </div>
    </div>

    <!-- 하단 제어 영역 -->
    <div class="bg-black/80 backdrop-blur-sm px-6 py-6 flex items-center justify-between">
      <!-- 갤러리 버튼 (더미) -->
      <div class="w-12 h-12" />

      <!-- 촬영 버튼 -->
      <button
        :class="[
          'w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-all',
          camera.isRecording.value ? 'bg-error-600 scale-90' : 'bg-white/10 hover:bg-white/20',
        ]"
        @click="toggleRecording"
        :disabled="isProcessing"
      >
        <div
          :class="[
            'transition-all duration-200',
            camera.isRecording.value ? 'w-5 h-5 bg-white rounded-sm' : 'w-10 h-10 bg-white rounded-full',
          ]"
        />
      </button>

      <!-- 카메라 전환 -->
      <button
        class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white"
        @click="camera.switchCamera()"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- 권한 거부 화면 -->
    <div
      v-if="camera.hasPermission.value === false"
      class="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-white px-8 text-center gap-6"
    >
      <svg class="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3l18 18" />
      </svg>
      <div>
        <h3 class="text-xl font-bold mb-2">카메라 권한이 필요합니다</h3>
        <p class="text-slate-400 text-sm leading-relaxed">
          스캔을 위해 카메라 접근을 허용해 주세요.<br />
          브라우저 설정 → 개인정보 보호 → 카메라 → 허용
        </p>
      </div>
      <button
        class="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold"
        @click="retryCamera"
      >
        다시 시도
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCamera } from '@/composables/useCamera'
import { useScanStore } from '@/stores/scanStore'
import { usePetStore } from '@/stores/petStore'

const router = useRouter()
const camera = useCamera()
const scanStore = useScanStore()
const petStore = usePetStore()

const videoEl = ref<HTMLVideoElement | null>(null)
const isProcessing = ref(false)
const recordingTime = ref(0)
let recordingTimer: ReturnType<typeof setInterval> | null = null

const scanSession = computed(() => scanStore.currentSession)
const petName = computed(() => {
  const petId = scanSession.value?.petId
  return petStore.pets.find(p => p.id === petId)?.name ?? '반려동물'
})

const guideText = computed(() => {
  if (camera.isRecording.value) return `녹화 중... (최소 4초)`
  return '반려동물의 전신이 보이도록 맞춰주세요'
})

async function startCameraStream(): Promise<void> {
  const stream = await camera.startCamera('environment')
  if (stream && videoEl.value) {
    videoEl.value.srcObject = stream
  }
}

async function retryCamera(): Promise<void> {
  await startCameraStream()
}

async function toggleRecording(): Promise<void> {
  if (camera.isRecording.value) {
    // 녹화 중지
    if (recordingTimer) clearInterval(recordingTimer)
    const blob = await camera.stopRecording()
    scanStore.setCapturedBlob(blob)
    await proceedToUpload()
  } else {
    // 녹화 시작
    camera.startRecording()
    recordingTime.value = 0
    recordingTimer = setInterval(() => recordingTime.value++, 1000)
  }
}

async function proceedToUpload(): Promise<void> {
  isProcessing.value = true
  camera.stopCamera()
  router.push('/scan/loading')
}

function handleBack(): void {
  camera.stopCamera()
  if (camera.isRecording.value) {
    camera.stopRecording().catch(() => {})
  }
  router.back()
}

onMounted(async () => {
  if (!scanSession.value) {
    router.replace('/scan')
    return
  }
  await startCameraStream()
})

onUnmounted(() => {
  if (recordingTimer) clearInterval(recordingTimer)
})
</script>
