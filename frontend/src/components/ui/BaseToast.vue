<template>
  <div
    :class="[
      'flex items-start gap-3 p-4 rounded-xl shadow-lg border max-w-sm w-full pointer-events-auto',
      'animate-slide-up',
      colorMap[toast.type].wrapper,
    ]"
    role="alert"
  >
    <!-- 아이콘 -->
    <div :class="['shrink-0 w-5 h-5 mt-0.5', colorMap[toast.type].icon]">
      <!-- Success -->
      <svg v-if="toast.type === 'success'" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      <!-- Error -->
      <svg v-else-if="toast.type === 'error'" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      <!-- Warning -->
      <svg v-else-if="toast.type === 'warning'" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <!-- Info -->
      <svg v-else fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <!-- 내용 -->
    <div class="flex-1 min-w-0">
      <p :class="['text-sm font-semibold', colorMap[toast.type].title]">{{ toast.title }}</p>
      <p v-if="toast.message" :class="['text-xs mt-0.5', colorMap[toast.type].message]">
        {{ toast.message }}
      </p>
    </div>

    <!-- 닫기 버튼 -->
    <button
      :class="['shrink-0 p-0.5 rounded transition-colors', colorMap[toast.type].close]"
      @click="$emit('close', toast.id)"
      aria-label="알림 닫기"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ToastMessage } from '@/types'

interface Props {
  toast: ToastMessage
}

defineProps<Props>()
defineEmits<{ close: [id: string] }>()

const colorMap = {
  success: {
    wrapper: 'bg-success-50 border-success-200',
    icon: 'text-success-500',
    title: 'text-success-800',
    message: 'text-success-700',
    close: 'text-success-500 hover:bg-success-100',
  },
  error: {
    wrapper: 'bg-error-50 border-error-200',
    icon: 'text-error-500',
    title: 'text-error-800',
    message: 'text-error-700',
    close: 'text-error-500 hover:bg-error-100',
  },
  warning: {
    wrapper: 'bg-warning-50 border-warning-200',
    icon: 'text-warning-500',
    title: 'text-warning-800',
    message: 'text-warning-700',
    close: 'text-warning-500 hover:bg-warning-100',
  },
  info: {
    wrapper: 'bg-primary-50 border-primary-200',
    icon: 'text-primary-500',
    title: 'text-primary-800',
    message: 'text-primary-700',
    close: 'text-primary-500 hover:bg-primary-100',
  },
}
</script>
