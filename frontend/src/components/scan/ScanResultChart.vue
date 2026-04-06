<template>
  <div class="flex flex-col gap-6">
    <!-- BCS 게이지 -->
    <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <h3 class="text-sm font-semibold text-slate-500 mb-4">체형 상태 점수 (BCS)</h3>
      <div class="flex items-center gap-4 mb-3">
        <div :class="['w-16 h-16 rounded-2xl flex items-center justify-center shrink-0', bcsStyle.bg]">
          <span :class="['text-3xl font-black', bcsStyle.text]">{{ scan.bcs_score }}</span>
        </div>
        <div>
          <p :class="['text-lg font-bold', bcsStyle.text]">{{ bcsInfo.label }}</p>
          <p class="text-sm text-slate-500">{{ bcsInfo.description }}</p>
        </div>
      </div>

      <!-- BCS 슬라이더 바 -->
      <div class="relative">
        <div class="flex h-2.5 rounded-full overflow-hidden gap-px">
          <div v-for="i in 9" :key="i" :class="getBCSSegmentClass(i)" class="flex-1 rounded-sm" />
        </div>
        <!-- 인디케이터 -->
        <div
          class="absolute -top-1 w-4 h-4 bg-white border-2 border-primary-600 rounded-full shadow-md transition-all duration-500"
          :style="{ left: `calc(${((scan.bcs_score - 1) / 8) * 100}% - 8px)` }"
        />
        <div class="flex justify-between mt-2 text-[10px] text-slate-400">
          <span>저체중 (1)</span>
          <span>이상적 (4-5)</span>
          <span>비만 (9)</span>
        </div>
      </div>
    </div>

    <!-- 세부 지표 카드들 -->
    <div class="grid grid-cols-2 gap-3">
      <!-- 보행 점수 -->
      <div class="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p class="text-xs font-medium text-slate-500">보행 분석</p>
        </div>
        <p class="text-2xl font-black text-slate-900">{{ scan.gait_score.toFixed(1) }}<span class="text-sm font-normal text-slate-400">점</span></p>
        <ScoreBar :value="scan.gait_score" :max="100" color="primary" class="mt-2" />
        <p class="text-[10px] text-slate-400 mt-1">{{ getScoreLabel(scan.gait_score) }}</p>
      </div>

      <!-- 안구 투명도 -->
      <div class="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 rounded-lg bg-secondary-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p class="text-xs font-medium text-slate-500">안구 투명도</p>
        </div>
        <p class="text-2xl font-black text-slate-900">{{ scan.eye_clarity_score.toFixed(1) }}<span class="text-sm font-normal text-slate-400">점</span></p>
        <ScoreBar :value="scan.eye_clarity_score" :max="100" color="secondary" class="mt-2" />
        <p class="text-[10px] text-slate-400 mt-1">{{ getScoreLabel(scan.eye_clarity_score) }}</p>
      </div>

      <!-- 음성 감정 (있을 경우) -->
      <div v-if="scan.voice_emotion_score !== undefined" class="bg-white rounded-xl p-4 border border-slate-100 shadow-sm col-span-2">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-7 h-7 rounded-lg bg-warning-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p class="text-xs font-medium text-slate-500">음성 감정 분석</p>
        </div>
        <div class="flex items-center gap-4">
          <p class="text-2xl font-black text-slate-900">{{ scan.voice_emotion_score.toFixed(1) }}<span class="text-sm font-normal text-slate-400">점</span></p>
          <div class="flex-1">
            <ScoreBar :value="scan.voice_emotion_score" :max="100" color="warning" />
            <p class="text-[10px] text-slate-400 mt-1">{{ getEmotionLabel(scan.voice_emotion_score) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 코멘트 -->
    <div class="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-5 border border-primary-100">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
          <span class="text-white text-sm font-bold">AI</span>
        </div>
        <h3 class="text-sm font-semibold text-primary-800">AI 종합 분석</h3>
      </div>
      <p class="text-sm text-slate-700 leading-relaxed">{{ scan.ai_comment }}</p>
      <p class="text-[10px] text-slate-400 mt-3">분석일: {{ formatDate(scan.scan_date) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import type { HealthScan, BCSScore } from '@/types'
import { getBCSDescription } from '@/mocks/scans'

interface Props {
  scan: HealthScan
}

const props = defineProps<Props>()

// BCS 스타일
const bcsInfo = computed(() => getBCSDescription(props.scan.bcs_score as BCSScore))

const bcsStyle = computed(() => {
  const score = props.scan.bcs_score
  if (score <= 3) return { bg: 'bg-warning-50', text: 'text-warning-700' }
  if (score <= 5) return { bg: 'bg-secondary-50', text: 'text-secondary-700' }
  if (score <= 7) return { bg: 'bg-warning-50', text: 'text-warning-700' }
  return { bg: 'bg-error-50', text: 'text-error-700' }
})

function getBCSSegmentClass(index: number): string {
  const score = props.scan.bcs_score
  const isActive = index <= score

  if (!isActive) return 'bg-slate-100'
  if (index <= 3) return 'bg-warning-300'
  if (index <= 5) return 'bg-secondary-400'
  if (index <= 7) return 'bg-warning-400'
  return 'bg-error-400'
}

function getScoreLabel(score: number): string {
  if (score >= 90) return '매우 우수'
  if (score >= 80) return '우수'
  if (score >= 70) return '양호'
  if (score >= 60) return '보통'
  return '주의 필요'
}

function getEmotionLabel(score: number): string {
  if (score >= 80) return '매우 안정적'
  if (score >= 65) return '안정적'
  if (score >= 50) return '보통'
  return '스트레스 주의'
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

// 점수 바 컴포넌트
const ScoreBar = defineComponent({
  props: {
    value: { type: Number, required: true },
    max: { type: Number, default: 100 },
    color: { type: String, default: 'primary' },
  },
  setup(props) {
    const colorMap: Record<string, string> = {
      primary: 'bg-primary-500',
      secondary: 'bg-secondary-500',
      warning: 'bg-warning-500',
      error: 'bg-error-500',
    }
    const pct = computed(() => Math.min(100, (props.value / props.max) * 100))
    return { pct, colorMap }
  },
  render() {
    return h('div', { class: 'h-1.5 bg-slate-100 rounded-full overflow-hidden' }, [
      h('div', {
        class: `h-full rounded-full transition-all duration-700 ${this.colorMap[this.color]}`,
        style: { width: `${this.pct}%` },
      }),
    ])
  },
})
</script>
