<template>
  <div :class="wrapperClasses">
    <img
      v-if="src && !imgError"
      :src="src"
      :alt="alt"
      class="w-full h-full object-cover"
      @error="imgError = true"
    />
    <!-- 이미지 없을 때 이니셜 표시 -->
    <span v-else :class="['font-semibold text-white', initialSizeMap[size]]">
      {{ initials }}
    </span>

    <!-- 상태 배지 (온라인/오프라인) -->
    <span
      v-if="status"
      :class="[
        'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
        statusSizeMap[size],
        status === 'online' ? 'bg-success-500' : 'bg-slate-300',
      ]"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  src?: string
  alt?: string
  name?: string
  size?: AvatarSize
  status?: 'online' | 'offline'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  alt: '프로필 이미지',
})

const imgError = ref(false)

const sizeMap: Record<AvatarSize, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
}

const initialSizeMap: Record<AvatarSize, string> = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-xl',
}

const statusSizeMap: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
}

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name.charAt(0).toUpperCase()
})

const wrapperClasses = computed(() => [
  'relative inline-flex items-center justify-center rounded-full overflow-hidden',
  'bg-primary-500 shrink-0',
  sizeMap[props.size],
])
</script>
