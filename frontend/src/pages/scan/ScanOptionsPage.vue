<template>
  <div class="px-4 py-6 flex flex-col gap-6">
    <div>
      <h2 class="text-xl font-bold text-slate-900">건강 스캔 시작</h2>
      <p class="text-sm text-slate-500 mt-1">분석 항목을 선택하고 스캔을 시작하세요</p>
    </div>

    <!-- 반려동물 선택 -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold text-slate-700">어떤 친구를 스캔할까요?</label>
      <div class="flex flex-col gap-2">
        <button
          v-for="pet in petStore.pets"
          :key="pet.id"
          :class="[
            'flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all',
            selectedPetId === pet.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-slate-200 bg-white hover:border-slate-300',
          ]"
          @click="selectedPetId = pet.id"
        >
          <BaseAvatar :src="pet.profile_image_url" :name="pet.name" size="sm" />
          <div class="flex-1 text-left">
            <p class="font-semibold text-slate-900 text-sm">{{ pet.name }}</p>
            <p class="text-xs text-slate-500">{{ pet.breed }}</p>
          </div>
          <div
            v-if="selectedPetId === pet.id"
            class="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center"
          >
            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- 스캔 항목 선택 -->
    <div class="flex flex-col gap-2">
      <label class="text-sm font-semibold text-slate-700">분석 항목 선택 (복수 선택 가능)</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="opt in scanTypeOptions"
          :key="opt.value"
          :class="[
            'flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition-all',
            selectedScanTypes.includes(opt.value)
              ? 'border-primary-500 bg-primary-50'
              : 'border-slate-200 bg-white hover:border-slate-300',
          ]"
          @click="toggleScanType(opt.value)"
        >
          <div class="flex items-center justify-between">
            <span class="text-2xl">{{ opt.emoji }}</span>
            <div
              :class="[
                'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                selectedScanTypes.includes(opt.value)
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-slate-300',
              ]"
            >
              <svg v-if="selectedScanTypes.includes(opt.value)" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
          <div>
            <p class="font-bold text-slate-900 text-sm">{{ opt.label }}</p>
            <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">{{ opt.desc }}</p>
          </div>
          <BaseBadge :color="opt.badgeColor" size="sm">{{ opt.badge }}</BaseBadge>
        </button>
      </div>
    </div>

    <!-- 가이드 영상 안내 -->
    <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200">
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-semibold text-slate-700">촬영 팁</p>
      </div>
      <ul class="flex flex-col gap-1.5 text-xs text-slate-600">
        <li>• BCS 분석: 측면과 위에서 전신이 보이도록 촬영하세요</li>
        <li>• 보행 분석: 4초 이상 자연스럽게 걷는 모습을 촬영하세요</li>
        <li>• 노화 지표: 눈 부분이 선명하게 나오도록 촬영하세요</li>
      </ul>
    </div>

    <!-- 시작 버튼 -->
    <BaseButton
      size="lg"
      fullWidth
      :disabled="!selectedPetId || selectedScanTypes.length === 0"
      @click="startScan"
    >
      <template #icon-left>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        </svg>
      </template>
      스캔 시작 ({{ selectedScanTypes.length }}개 항목)
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePetStore } from '@/stores/petStore'
import { useScanStore } from '@/stores/scanStore'
import type { ScanType } from '@/types'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

const router = useRouter()
const petStore = usePetStore()
const scanStore = useScanStore()

const selectedPetId = ref<string>(petStore.selectedPetId ?? '')
const selectedScanTypes = ref<ScanType[]>(['BCS', 'GAIT'])

const scanTypeOptions: {
  value: ScanType
  label: string
  emoji: string
  desc: string
  badge: string
  badgeColor: 'primary' | 'secondary' | 'warning'
}[] = [
  {
    value: 'BCS',
    label: 'BCS 체형 분석',
    emoji: '⚖️',
    desc: '9단계 비만도 판정',
    badge: '필수 권장',
    badgeColor: 'primary',
  },
  {
    value: 'GAIT',
    label: '보행 분석',
    emoji: '🚶',
    desc: 'AI 보행 패턴 수치화',
    badge: 'AI 분석',
    badgeColor: 'secondary',
  },
  {
    value: 'AGING',
    label: '노화 지표',
    emoji: '👁️',
    desc: '안구 혼탁도 분석',
    badge: '노화 추적',
    badgeColor: 'warning',
  },
  {
    value: 'VOICE',
    label: '음성 감정',
    emoji: '🎵',
    desc: '울음소리 파형 분석',
    badge: '감정 인식',
    badgeColor: 'secondary',
  },
]

function toggleScanType(type: ScanType): void {
  const idx = selectedScanTypes.value.indexOf(type)
  if (idx >= 0) {
    selectedScanTypes.value.splice(idx, 1)
  } else {
    selectedScanTypes.value.push(type)
  }
}

function startScan(): void {
  if (!selectedPetId.value || selectedScanTypes.value.length === 0) return
  petStore.selectPet(selectedPetId.value)
  scanStore.startSession(selectedPetId.value, selectedScanTypes.value)
  // VOICE 전용 스캔이면 음성 녹음 페이지로, 그 외는 카메라 페이지로
  const isVoiceOnly = selectedScanTypes.value.length === 1 && selectedScanTypes.value[0] === 'VOICE'
  router.push(isVoiceOnly ? '/scan/voice' : '/scan/camera')
}

onMounted(async () => {
  if (petStore.pets.length === 0) {
    await petStore.fetchPets()
  }
  if (petStore.selectedPetId) {
    selectedPetId.value = petStore.selectedPetId
  } else if (petStore.pets.length > 0) {
    selectedPetId.value = petStore.pets[0].id
  }
})
</script>
