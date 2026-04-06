<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="알림 목록"
    >
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
        <BaseToast
          v-for="toast in toasts"
          :key="toast.id"
          :toast="toast"
          @close="removeToast"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import BaseToast from '@/components/ui/BaseToast.vue'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
