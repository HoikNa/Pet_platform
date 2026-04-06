<template>
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-100 shadow-sm">
    <div class="max-w-mobile mx-auto px-4 h-14 flex items-center justify-between">
      <!-- 로고 / 뒤로가기 -->
      <div class="flex items-center gap-3">
        <button
          v-if="showBack"
          class="p-1.5 -ml-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          @click="$router.back()"
          aria-label="뒤로 가기"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <RouterLink v-if="!showBack" to="/dashboard" class="flex items-center gap-2">
          <div class="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white text-xs font-bold">P</span>
          </div>
          <span class="text-base font-bold text-primary-900">Pet-ID</span>
        </RouterLink>

        <h1 v-if="title" class="text-base font-semibold text-slate-900">{{ title }}</h1>
      </div>

      <!-- 우측 액션 -->
      <div class="flex items-center gap-2">
        <slot name="actions" />

        <!-- 알림 버튼 -->
        <button
          v-if="showNotification"
          class="relative p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="알림"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <!-- 알림 뱃지 -->
          <span
            v-if="notificationCount > 0"
            class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {{ notificationCount > 9 ? '9+' : notificationCount }}
          </span>
        </button>

        <!-- 사용자 아바타 -->
        <RouterLink v-if="showUser && user" to="/profile">
          <BaseAvatar :src="user.avatar_url" :name="user.name" size="sm" />
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

interface Props {
  title?: string
  showBack?: boolean
  showNotification?: boolean
  showUser?: boolean
  notificationCount?: number
}

withDefaults(defineProps<Props>(), {
  showBack: false,
  showNotification: true,
  showUser: true,
  notificationCount: 0,
})

const authStore = useAuthStore()
const user = computed(() => authStore.user)
</script>
