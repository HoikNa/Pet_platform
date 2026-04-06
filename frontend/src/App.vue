<template>
  <!-- 레이아웃이 없는 경우 (랜딩, 로그인, 카메라 전체화면 등) -->
  <template v-if="layout === 'none'">
    <RouterView v-slot="{ Component, route: currentRoute }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="currentRoute.path" />
      </Transition>
    </RouterView>
  </template>

  <!-- B2C 모바일 레이아웃 -->
  <MobileLayout v-else-if="layout === 'mobile'" />

  <!-- B2B/B2G 관리자 데스크톱 레이아웃 -->
  <AdminLayout v-else-if="layout === 'admin'" />

  <!-- 전역 Toast 알림 컨테이너 -->
  <ToastContainer />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import ToastContainer from '@/components/common/ToastContainer.vue'
import MobileLayout from '@/layouts/MobileLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const route = useRoute()
const layout = computed(() => (route.meta?.layout as string | undefined) ?? 'mobile')
</script>
