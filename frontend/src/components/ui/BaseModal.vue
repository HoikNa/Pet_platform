<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        role="dialog"
        :aria-label="title"
        aria-modal="true"
        @keydown.esc="onClose"
      >
        <!-- 오버레이 -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="closeOnOverlay && onClose()"
        />

        <!-- 모달 패널 -->
        <div
          ref="panelRef"
          :class="[
            'relative bg-white rounded-2xl shadow-xl w-full z-10',
            'animate-slide-up',
            sizeMap[size],
          ]"
        >
          <!-- 헤더 -->
          <div v-if="title || $slots.header" class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <slot name="header">
              <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
            </slot>
            <button
              v-if="showClose"
              class="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              @click="onClose"
              aria-label="닫기"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 본문 -->
          <div class="px-6 py-5">
            <slot />
          </div>

          <!-- 푸터 -->
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  showClose?: boolean
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showClose: true,
  closeOnOverlay: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-full mx-0 rounded-none',
}

function onClose() {
  emit('update:modelValue', false)
  emit('close')
}

// 모달 열릴 때 body 스크롤 잠금
watch(
  () => props.modelValue,
  open => {
    if (open) {
      document.body.style.overflow = 'hidden'
      // 포커스 트랩 (접근성)
      setTimeout(() => panelRef.value?.focus(), 50)
    } else {
      document.body.style.overflow = ''
    }
  }
)

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
