<template>
  <span :class="badgeClasses">
    <!-- 상태 점 -->
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full', dotColorMap[color]]" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'slate'

interface Props {
  color?: BadgeColor
  size?: 'sm' | 'md'
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  size: 'md',
  dot: false,
})

const colorMap: Record<BadgeColor, string> = {
  primary: 'bg-primary-50 text-primary-700 ring-primary-100',
  secondary: 'bg-secondary-50 text-secondary-700 ring-secondary-100',
  success: 'bg-success-50 text-success-700 ring-success-100',
  warning: 'bg-warning-50 text-warning-700 ring-warning-100',
  error: 'bg-error-50 text-error-700 ring-error-100',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const dotColorMap: Record<BadgeColor, string> = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  slate: 'bg-slate-400',
}

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

const badgeClasses = computed(() => [
  'inline-flex items-center gap-1 rounded-full font-medium ring-1 ring-inset',
  colorMap[props.color],
  sizeMap[props.size],
])
</script>
