<template>
  <!-- B2C 모바일 앱 레이아웃 (최대 너비 600px) -->
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- 전역 헤더 -->
    <AppHeader
      :title="pageTitle"
      :show-back="showBack"
      :show-notification="showNotification"
    />

    <!-- 페이지 콘텐츠 영역 -->
    <main class="flex-1 max-w-mobile mx-auto w-full pb-20">
      <RouterView v-slot="{ Component, route: currentRoute }">
        <Transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="currentRoute.path" />
        </Transition>
      </RouterView>
    </main>

    <!-- 하단 네비게이션 바 -->
    <AppNavigation v-if="showNavigation" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppNavigation from '@/components/common/AppNavigation.vue'

const route = useRoute()

const pageTitle = computed(() => route.meta?.title as string | undefined)
const showBack = computed(() => !!route.meta?.showBack)
const showNotification = computed(() => route.meta?.showNotification !== false)

/** 하단 네비게이션 숨김 처리 (카메라 뷰, 로딩 뷰 등) */
const showNavigation = computed(() =>
  !route.meta?.hideNavigation
)

const transitionName = computed(() =>
  route.meta?.transition as string ?? 'fade'
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.25s ease;
}
.slide-left-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
