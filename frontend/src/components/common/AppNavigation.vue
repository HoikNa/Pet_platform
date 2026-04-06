<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-lg">
    <div class="max-w-mobile mx-auto">
      <div class="flex items-center justify-around h-16">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center gap-1 flex-1 py-2 transition-colors group"
          :class="isActive(item.to) ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'"
        >
          <!-- 아이콘 -->
          <div class="relative">
            <component :is="item.icon" :active="isActive(item.to)" class="w-6 h-6" />
            <!-- 뱃지 -->
            <span
              v-if="item.badge && item.badge > 0"
              class="absolute -top-1 -right-1 w-4 h-4 bg-error-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {{ item.badge }}
            </span>
          </div>
          <span class="text-[11px] font-medium">{{ item.label }}</span>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

function isActive(path: string): boolean {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}

// SVG 아이콘 컴포넌트들
const HomeIcon = defineComponent({
  props: { active: Boolean },
  render() {
    return h(
      'svg',
      { class: 'w-6 h-6', fill: this.active ? 'currentColor' : 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
      [
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
        }),
      ]
    )
  },
})

const PetIcon = defineComponent({
  props: { active: Boolean },
  render() {
    return h(
      'svg',
      { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
      [
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        }),
      ]
    )
  },
})

const ScanIcon = defineComponent({
  props: { active: Boolean },
  render() {
    return h(
      'div',
      {
        class: [
          'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg -mt-4',
          'bg-primary-600 text-white',
        ],
      },
      [
        h(
          'svg',
          { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          [
            h('path', {
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'stroke-width': '2',
              d: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
            }),
            h('path', {
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'stroke-width': '2',
              d: 'M15 13a3 3 0 11-6 0 3 3 0 016 0z',
            }),
          ]
        ),
      ]
    )
  },
})

const ReportIcon = defineComponent({
  props: { active: Boolean },
  render() {
    return h(
      'svg',
      { class: 'w-6 h-6', fill: this.active ? 'currentColor' : 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
      [
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        }),
      ]
    )
  },
})

const ProfileIcon = defineComponent({
  props: { active: Boolean },
  render() {
    return h(
      'svg',
      { class: 'w-6 h-6', fill: this.active ? 'currentColor' : 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
      [
        h('path', {
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'stroke-width': '2',
          d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        }),
      ]
    )
  },
})

const navItems = computed(() => [
  { to: '/dashboard', label: '홈', icon: HomeIcon, badge: 0 },
  { to: '/pets', label: '반려동물', icon: PetIcon, badge: 0 },
  { to: '/scan', label: '스캔', icon: ScanIcon, badge: 0 },
  { to: '/reports', label: '리포트', icon: ReportIcon, badge: 0 },
  { to: '/profile', label: '프로필', icon: ProfileIcon, badge: 0 },
])
</script>
