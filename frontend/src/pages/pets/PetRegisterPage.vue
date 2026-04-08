<template>
  <div class="px-4 py-6 flex flex-col gap-6">
    <!-- 단계 표시 -->
    <div class="flex items-center gap-2">
      <div
        v-for="(step, i) in steps"
        :key="step.label"
        class="flex items-center gap-2"
      >
        <div
          :class="[
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
            currentStep > i
              ? 'bg-secondary-500 text-white'
              : currentStep === i
              ? 'bg-primary-600 text-white'
              : 'bg-slate-200 text-slate-500',
          ]"
        >
          <svg v-if="currentStep > i" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <span :class="['text-xs font-medium', currentStep === i ? 'text-primary-700' : 'text-slate-400']">
          {{ step.label }}
        </span>
        <div v-if="i < steps.length - 1" class="flex-1 h-px bg-slate-200 min-w-4" />
      </div>
    </div>

    <!-- Step 1: 기본 정보 입력 -->
    <div v-show="currentStep === 0" class="flex flex-col gap-5 animate-fade-in">
      <div>
        <h2 class="text-xl font-bold text-slate-900">반려동물 정보 입력</h2>
        <p class="text-sm text-slate-500 mt-1">기본 정보를 입력해 주세요</p>
      </div>

      <BaseInput v-model="form.name" label="이름" placeholder="예) 뭉치" :error="errors.name" required />

      <!-- 종 선택 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-slate-700">종 <span class="text-error-500">*</span></label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="opt in speciesOptions"
            :key="opt.value"
            :class="[
              'flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all',
              form.species === opt.value
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300',
            ]"
            @click="form.species = opt.value"
          >
            <span class="text-2xl">{{ opt.emoji }}</span>
            <span class="text-xs font-medium">{{ opt.label }}</span>
          </button>
        </div>
      </div>

      <BaseInput v-model="form.breed" label="품종" placeholder="예) 말티즈, 코리안숏헤어" :error="errors.breed" required />

      <BaseInput v-model="form.birth_date" label="생년월일" type="date" :error="errors.birth_date" required />

      <!-- 성별 선택 -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-slate-700">성별 <span class="text-error-500">*</span></label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="opt in genderOptions"
            :key="opt.value"
            :class="[
              'py-3 rounded-xl border-2 text-sm font-medium transition-all',
              form.gender === opt.value
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300',
            ]"
            @click="form.gender = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- 중성화 여부 -->
      <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
        <div>
          <p class="text-sm font-medium text-slate-700">중성화 여부</p>
          <p class="text-xs text-slate-500">중성화 수술을 받았나요?</p>
        </div>
        <button
          :class="[
            'relative w-12 h-6 rounded-full transition-colors duration-200',
            form.is_neutered ? 'bg-primary-600' : 'bg-slate-300',
          ]"
          @click="form.is_neutered = !form.is_neutered"
        >
          <span
            :class="[
              'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
              form.is_neutered ? 'translate-x-6' : 'translate-x-0.5',
            ]"
          />
        </button>
      </div>

      <BaseInput
        v-model="weightStr"
        label="체중 (kg)"
        type="number"
        placeholder="예) 3.5"
        hint="선택 사항"
      />

      <BaseButton @click="goToStep(1)" fullWidth size="lg">
        다음 단계: 생체 인식 스캔
        <template #icon-right>
          <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </template>
      </BaseButton>
    </div>

    <!-- Step 2: 생체 인식 스캔 안내 -->
    <div v-show="currentStep === 1" class="flex flex-col gap-5 animate-fade-in">
      <div>
        <h2 class="text-xl font-bold text-slate-900">생체 인식 스캔</h2>
        <p class="text-sm text-slate-500 mt-1">반려동물의 안면을 촬영하여 디지털 신분증을 발급합니다</p>
      </div>

      <!-- 스캔 가이드 안내 -->
      <div class="bg-primary-50 rounded-2xl p-5 border border-primary-100">
        <h3 class="font-bold text-primary-800 mb-3">📸 촬영 가이드</h3>
        <ul class="flex flex-col gap-2.5">
          <li v-for="tip in scanTips" :key="tip" class="flex items-start gap-2.5 text-sm text-primary-700">
            <svg class="w-4 h-4 text-primary-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            {{ tip }}
          </li>
        </ul>
      </div>

      <!-- 카메라 프리뷰 / 가이드 오버레이 -->
      <div class="relative bg-slate-900 rounded-2xl overflow-hidden aspect-[4/3]">
        <video
          ref="videoEl"
          autoplay
          playsinline
          muted
          class="w-full h-full object-cover"
          :class="{ 'opacity-0': !cameraActive }"
        />

        <!-- 카메라 미활성 상태 -->
        <div v-if="!cameraActive" class="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
          <svg class="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p class="text-sm text-slate-300">카메라를 활성화해 주세요</p>
        </div>

        <!-- 타원형 오버레이 가이드 -->
        <div v-if="cameraActive" class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg class="w-full h-full" viewBox="0 0 400 300">
            <defs>
              <mask id="oval-mask">
                <rect width="400" height="300" fill="white" />
                <ellipse cx="200" cy="150" rx="130" ry="110" fill="black" />
              </mask>
            </defs>
            <rect width="400" height="300" fill="rgba(0,0,0,0.45)" mask="url(#oval-mask)" />
            <ellipse cx="200" cy="150" rx="130" ry="110" fill="none" stroke="white" stroke-width="2.5" stroke-dasharray="8,4" opacity="0.9" />
            <!-- 십자선 마커 -->
            <line x1="195" y1="150" x2="205" y2="150" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" />
            <line x1="200" y1="145" x2="200" y2="155" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" />
          </svg>
          <div class="absolute bottom-4 left-0 right-0 text-center">
            <p class="text-white text-xs bg-black/40 inline-block px-3 py-1 rounded-full">
              반려동물의 얼굴을 타원 안에 맞춰주세요
            </p>
          </div>
        </div>

        <!-- 카메라 전환 버튼 -->
        <button
          v-if="cameraActive"
          class="absolute top-3 right-3 p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
          @click="switchCamera"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <!-- 카메라 제어 버튼 -->
      <div class="flex gap-3">
        <BaseButton
          v-if="!cameraActive"
          @click="activateCamera"
          :loading="camera.isLoading.value"
          fullWidth
          size="lg"
        >
          📷 카메라 시작
        </BaseButton>
        <template v-else>
          <BaseButton variant="outline" @click="stopCamera" class="flex-1">
            취소
          </BaseButton>
          <BaseButton @click="captureAndRegister" :loading="isRegistering" class="flex-2 flex-1" size="md">
            {{ isRegistering ? '등록 중...' : '📸 촬영 및 등록' }}
          </BaseButton>
        </template>
      </div>

      <!-- 권한 거부 안내 -->
      <div
        v-if="camera.hasPermission.value === false"
        class="p-4 bg-error-50 rounded-xl border border-error-200"
      >
        <p class="text-sm font-semibold text-error-800 mb-1">카메라 권한이 필요합니다</p>
        <p class="text-xs text-error-700">
          스캔을 위해 브라우저 설정에서 카메라 접근을 허용해 주세요.
          설정 → 개인정보 및 보안 → 사이트 설정 → 카메라
        </p>
      </div>

      <BaseButton variant="ghost" @click="skipBiometric" color="primary" class="text-slate-500">
        생체 스캔 없이 기본 정보만 등록 →
      </BaseButton>
    </div>

    <!-- Step 3: 완료 (폭죽 애니메이션) -->
    <div v-show="currentStep === 2" class="relative flex flex-col items-center gap-5 py-6 animate-fade-in text-center overflow-hidden">
      <!-- 폭죽 파티클 -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          v-for="(particle, i) in confettiParticles"
          :key="i"
          class="absolute w-3 h-3 rounded-sm animate-confetti"
          :style="{
            left: particle.x + '%',
            top: '-12px',
            backgroundColor: particle.color,
            animationDelay: particle.delay + 's',
            animationDuration: particle.duration + 's',
          }"
        />
      </div>

      <div class="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center animate-confetti-pop">
        <span class="text-5xl">🎉</span>
      </div>
      <div>
        <h2 class="text-2xl font-black text-slate-900 mb-2">등록 완료!</h2>
        <p class="text-slate-500">{{ form.name }}의 프로필이 성공적으로 등록되었습니다</p>
      </div>

      <div v-if="createdPet" class="w-full bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-left">
        <div class="flex items-center gap-3 mb-3">
          <BaseAvatar :name="createdPet.name" size="lg" />
          <div>
            <p class="font-bold text-slate-900">{{ createdPet.name }}</p>
            <BaseBadge :color="createdPet.registration_status === 'VERIFIED' ? 'success' : 'warning'" dot>
              {{ createdPet.registration_status === 'VERIFIED' ? '생체 인식 완료' : '기본 등록 완료' }}
            </BaseBadge>
          </div>
        </div>
      </div>

      <!-- 자동 이동 카운트다운 -->
      <p class="text-xs text-slate-400">{{ countdown }}초 후 대시보드로 이동합니다...</p>

      <BaseButton fullWidth size="lg" @click="router.push('/dashboard')">
        메인 대시보드로 이동
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePetStore } from '@/stores/petStore'
import { useCamera } from '@/composables/useCamera'
import { useToast } from '@/composables/useToast'
import type { Pet, PetSpecies, PetGender } from '@/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

const router = useRouter()
const petStore = usePetStore()
const camera = useCamera()
const { success, error: toastError } = useToast()

const currentStep = ref(0)
const videoEl = ref<HTMLVideoElement | null>(null)
const cameraActive = ref(false)
const isRegistering = ref(false)
const createdPet = ref<Pet | null>(null)
const countdown = ref(5)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// 폭죽 파티클 데이터 생성
const confettiColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
const confettiParticles = Array.from({ length: 20 }, () => ({
  x: Math.random() * 100,
  color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
  delay: Math.random() * 0.8,
  duration: 1.2 + Math.random() * 0.8,
}))

function startCountdown(): void {
  countdown.value = 5
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownTimer) clearInterval(countdownTimer)
      router.push('/dashboard')
    }
  }, 1000)
}

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

const steps = [
  { label: '기본 정보' },
  { label: '생체 스캔' },
  { label: '완료' },
]

const form = reactive({
  name: '',
  species: 'DOG' as PetSpecies,
  breed: '',
  birth_date: '',
  gender: 'MALE' as PetGender,
  is_neutered: false,
})

const weightStr = ref('')
const errors = reactive({ name: '', breed: '', birth_date: '' })

const speciesOptions = [
  { value: 'DOG' as PetSpecies, label: '강아지', emoji: '🐶' },
  { value: 'CAT' as PetSpecies, label: '고양이', emoji: '🐱' },
  { value: 'OTHER' as PetSpecies, label: '기타', emoji: '🐾' },
]

const genderOptions = [
  { value: 'MALE' as PetGender, label: '수컷 ♂' },
  { value: 'FEMALE' as PetGender, label: '암컷 ♀' },
]

const scanTips = [
  '밝은 곳에서 반려동물의 정면 얼굴이 보이도록 해주세요',
  '카메라와 약 30~50cm 거리를 유지해 주세요',
  '반려동물이 움직이지 않을 때 촬영하면 더 정확합니다',
  '비문(코) 부위가 선명하게 나오면 인식 정확도가 높아집니다',
]

function validateStep1(): boolean {
  errors.name = form.name ? '' : '이름을 입력해 주세요'
  errors.breed = form.breed ? '' : '품종을 입력해 주세요'
  errors.birth_date = form.birth_date ? '' : '생년월일을 입력해 주세요'
  return !errors.name && !errors.breed && !errors.birth_date
}

function goToStep(step: number): void {
  if (step === 1 && !validateStep1()) return
  currentStep.value = step
  if (step === 1) activateCamera()
}

async function activateCamera(): Promise<void> {
  const stream = await camera.startCamera('environment')
  if (stream && videoEl.value) {
    videoEl.value.srcObject = stream
    cameraActive.value = true
  }
}

function stopCamera(): void {
  camera.stopCamera()
  cameraActive.value = false
}

async function switchCamera(): Promise<void> {
  await camera.switchCamera()
  if (camera.stream.value && videoEl.value) {
    videoEl.value.srcObject = camera.stream.value
  }
}

async function captureAndRegister(): Promise<void> {
  isRegistering.value = true
  try {
    // 이미지 캡처
    if (videoEl.value) {
      camera.captureImage(videoEl.value)
    }

    // 반려동물 등록
    const pet = await petStore.createPet({
      ...form,
      weight: weightStr.value ? parseFloat(weightStr.value) : undefined,
    })

    // Mock: POST /pets/{pet_id}/biometrics — 생체 인식 데이터 업로드 및 처리
    // 실제 API: await biometricService.uploadBiometric(pet.id, capturedBlob)
    await new Promise(resolve => setTimeout(resolve, 1500))
    // Mock: AI 품질 검사 통과 시 VERIFIED 처리
    petStore.markPetAsVerified(pet.id)
    pet.registration_status = 'VERIFIED'

    createdPet.value = pet
    camera.stopCamera()
    currentStep.value = 2
    success('등록 완료!', `${pet.name}의 생체 인식 등록이 완료되었습니다 🎉`)
    startCountdown()
  } catch (err) {
    toastError('등록 실패', '다시 시도해 주세요')
  } finally {
    isRegistering.value = false
  }
}

async function skipBiometric(): Promise<void> {
  isRegistering.value = true
  try {
    const pet = await petStore.createPet({
      ...form,
      weight: weightStr.value ? parseFloat(weightStr.value) : undefined,
    })
    createdPet.value = pet
    camera.stopCamera()
    currentStep.value = 2
    success('등록 완료', `${pet.name}의 기본 정보가 등록되었습니다`)
    startCountdown()
  } finally {
    isRegistering.value = false
  }
}
</script>
