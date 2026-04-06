<template>
  <!-- B2B/B2G 관리자 포털 레이아웃 (데스크톱 좌측 사이드바) -->
  <div class="min-h-screen bg-slate-100 flex">
    <!-- 좌측 사이드바 -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-primary-900 text-white transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16',
      ]"
    >
      <!-- 로고 영역 -->
      <div class="flex items-center gap-3 px-4 h-16 border-b border-primary-800 shrink-0">
        <div class="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center shrink-0">
          <span class="text-primary-900 text-sm font-bold">P</span>
        </div>
        <Transition name="fade">
          <div v-if="sidebarOpen">
            <p class="text-sm font-bold">Pet-ID</p>
            <p class="text-[10px] text-primary-300">관리자 포털</p>
          </div>
        </Transition>
      </div>

      <!-- 네비게이션 메뉴 -->
      <nav class="flex-1 py-4 overflow-y-auto">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-150 group',
            isActive(item.to)
              ? 'bg-primary-700 text-white'
              : 'text-primary-300 hover:bg-primary-800 hover:text-white',
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <Transition name="fade">
            <span v-if="sidebarOpen" class="text-sm font-medium">{{ item.label }}</span>
          </Transition>
        </RouterLink>
      </nav>

      <!-- 하단 사용자 정보 -->
      <div class="border-t border-primary-800 p-4 shrink-0">
        <div class="flex items-center gap-3">
          <BaseAvatar :name="user?.name" size="sm" />
          <Transition name="fade">
            <div v-if="sidebarOpen" class="min-w-0">
              <p class="text-sm font-medium truncate">{{ user?.name }}</p>
              <p class="text-[10px] text-primary-300">{{ roleLabel }}</p>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 사이드바 토글 버튼 -->
      <button
        class="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md text-slate-500 hover:text-slate-700 transition-colors"
        @click="sidebarOpen = !sidebarOpen"
        :aria-label="sidebarOpen ? '사이드바 접기' : '사이드바 펼치기'"
      >
        <svg
          :class="['w-3.5 h-3.5 transition-transform', sidebarOpen ? '' : 'rotate-180']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>

    <!-- 메인 콘텐츠 영역 -->
    <div :class="['flex-1 flex flex-col transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-16']">
      <!-- 상단 헤더 -->
      <header class="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div class="flex items-center justify-between px-6 h-16">
          <div>
            <h1 class="text-base font-semibold text-slate-900">{{ pageTitle }}</h1>
            <p v-if="organization" class="text-xs text-slate-500">{{ organization.name }}</p>
          </div>

          <div class="flex items-center gap-3">
            <!-- 알림 버튼 -->
            <button class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            <!-- 로그아웃 -->
            <button
              class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
              @click="handleLogout"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <!-- 페이지 콘텐츠 -->
      <main class="flex-1 p-6 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAdminStore } from '@/stores/adminStore'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const adminStore = useAdminStore()

const sidebarOpen = ref(true)
const user = computed(() => authStore.user)
const organization = computed(() => adminStore.organization)
const pageTitle = computed(() => route.meta?.title as string ?? '관리자 포털')

const roleLabel = computed(() => {
  const map = {
    B2B_HOSPITAL: '병원 관리자',
    B2B_INSURANCE: '보험사 관리자',
    B2G: '지자체 관리자',
    ADMIN: '시스템 관리자',
  }
  return map[user.value?.role as keyof typeof map] ?? '관리자'
})

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

async function handleLogout(): Promise<void> {
  await authStore.logout()
  router.push('/login')
}

// 사이드바 아이콘 컴포넌트들
const DashboardIcon = defineComponent({
  render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' }),
  ])
})

const PetsIcon = defineComponent({
  render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }),
  ])
})

const navItems = [
  { to: '/admin/dashboard', label: '대시보드', icon: DashboardIcon },
  { to: '/admin/pets', label: '환축 관리', icon: PetsIcon },
]
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
