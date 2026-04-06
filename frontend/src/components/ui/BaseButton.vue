<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    v-bind="$attrs"
  >
    <!-- 로딩 스피너 -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- 앞 아이콘 슬롯 -->
    <slot name="icon-left" />

    <!-- 기본 콘텐츠 -->
    <slot />

    <!-- 뒤 아이콘 슬롯 -->
    <slot name="icon-right" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 버튼 크기 */
  size?: 'sm' | 'md' | 'lg'
  /** 버튼 변형 */
  variant?: 'solid' | 'outline' | 'ghost'
  /** 색상 테마 */
  color?: 'primary' | 'secondary' | 'error' | 'warning'
  /** 로딩 상태 */
  loading?: boolean
  /** 비활성화 */
  disabled?: boolean
  /** 전체 너비 */
  fullWidth?: boolean
  /** 버튼 타입 */
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'solid',
  color: 'primary',
  loading: false,
  disabled: false,
  fullWidth: false,
  type: 'button',
})

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

const variantColorClasses = computed(() => {
  const map = {
    solid: {
      primary:
        'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800',
      secondary:
        'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-400 active:bg-secondary-700',
      error:
        'bg-error-500 text-white hover:bg-error-600 focus:ring-error-400 active:bg-error-700',
      warning:
        'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-400 active:bg-warning-700',
    },
    outline: {
      primary:
        'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
      secondary:
        'border border-secondary-500 text-secondary-600 hover:bg-secondary-50 focus:ring-secondary-400',
      error:
        'border border-error-500 text-error-600 hover:bg-error-50 focus:ring-error-400',
      warning:
        'border border-warning-500 text-warning-600 hover:bg-warning-50 focus:ring-warning-400',
    },
    ghost: {
      primary:
        'text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
      secondary:
        'text-secondary-600 hover:bg-secondary-50 focus:ring-secondary-400',
      error:
        'text-error-600 hover:bg-error-50 focus:ring-error-400',
      warning:
        'text-warning-600 hover:bg-warning-50 focus:ring-warning-400',
    },
  }
  return map[props.variant][props.color]
})

const buttonClasses = computed(() => [
  // 기본 공통 스타일
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  // 크기
  sizeClasses[props.size],
  // 변형 + 색상
  variantColorClasses.value,
  // 전체 너비
  props.fullWidth ? 'w-full' : '',
  // 비활성화
  props.disabled || props.loading
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer',
])
</script>
