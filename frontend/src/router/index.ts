// ============================================================
// Vue Router - 라우팅 테이블 및 네비게이션 가드
// ============================================================

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes: RouteRecordRaw[] = [
  // ---- 공개 라우트 ----
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/pages/LandingPage.vue'),
    meta: { layout: 'none', title: 'Pet-ID AI 플랫폼' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { layout: 'none', title: '로그인' },
  },

  // ---- B2C 모바일 레이아웃 라우트 ----
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2C'],
      layout: 'mobile',
      title: '홈',
      showNotification: true,
    },
  },

  // 반려동물
  {
    path: '/pets',
    name: 'PetList',
    component: () => import('@/pages/DashboardPage.vue'), // 대시보드와 동일
    meta: { requiresAuth: true, requiredRoles: ['B2C'], layout: 'mobile', title: '내 반려동물' },
  },
  {
    path: '/pets/register',
    name: 'PetRegister',
    component: () => import('@/pages/pets/PetRegisterPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2C'],
      layout: 'mobile',
      title: '반려동물 등록',
      showBack: true,
      hideNavigation: true,
    },
  },
  {
    path: '/pets/:id',
    name: 'PetDetail',
    component: () => import('@/pages/pets/PetDetailPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2C'],
      layout: 'mobile',
      title: '반려동물 정보',
      showBack: true,
    },
  },

  // 스캔
  {
    path: '/scan',
    name: 'ScanOptions',
    component: () => import('@/pages/scan/ScanOptionsPage.vue'),
    meta: { requiresAuth: true, requiredRoles: ['B2C'], layout: 'mobile', title: '건강 스캔' },
  },
  {
    path: '/scan/camera',
    name: 'ScanCamera',
    component: () => import('@/pages/scan/ScanCameraPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2C'],
      layout: 'none', // 전체 화면 카메라
      hideNavigation: true,
    },
  },
  {
    path: '/scan/loading',
    name: 'ScanLoading',
    component: () => import('@/pages/scan/ScanLoadingPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2C'],
      layout: 'none', // 전체 화면 로딩
      hideNavigation: true,
    },
  },
  {
    path: '/scans/:id',
    name: 'ScanReport',
    component: () => import('@/pages/scan/ScanReportPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2C'],
      layout: 'mobile',
      title: '건강 리포트',
      showBack: true,
    },
  },

  // 리포트 목록 (대시보드 재활용)
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true, requiredRoles: ['B2C'], layout: 'mobile', title: '리포트' },
  },

  // 프로필
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/DashboardPage.vue'), // TODO: ProfilePage
    meta: { requiresAuth: true, requiredRoles: ['B2C'], layout: 'mobile', title: '프로필' },
  },

  // ---- B2B/B2G 관리자 레이아웃 라우트 ----
  {
    path: '/admin',
    redirect: '/admin/dashboard',
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/pages/admin/AdminDashboardPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2B_HOSPITAL', 'B2B_INSURANCE', 'B2G', 'ADMIN'],
      layout: 'admin',
      title: '환축 관리 대시보드',
    },
  },
  {
    path: '/admin/pets',
    name: 'AdminPetList',
    component: () => import('@/pages/admin/AdminDashboardPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2B_HOSPITAL', 'B2B_INSURANCE', 'B2G', 'ADMIN'],
      layout: 'admin',
      title: '환축 전체 목록',
    },
  },
  {
    path: '/admin/pets/:id',
    name: 'AdminPetDetail',
    component: () => import('@/pages/admin/AdminPetDetailPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2B_HOSPITAL', 'B2B_INSURANCE', 'B2G', 'ADMIN'],
      layout: 'admin',
      title: '환축 상세 / EMR 통합 뷰',
    },
  },

  // ---- 404 폴백 ----
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

// ============================================================
// 네비게이션 가드
// ============================================================

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // 인증 필요 라우트 체크
  if (to.meta?.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }

    // 역할 기반 접근 제어
    const requiredRoles = to.meta.requiredRoles as string[] | undefined
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = authStore.userRole
      if (!userRole || !requiredRoles.includes(userRole)) {
        // 역할 불일치 시 적절한 대시보드로 리다이렉트
        if (authStore.isAdmin) {
          return next({ name: 'AdminDashboard' })
        } else {
          return next({ name: 'Dashboard' })
        }
      }
    }
  }

  // 이미 로그인한 사용자가 로그인 페이지 접근 시
  if (to.name === 'Login' && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      return next({ name: 'AdminDashboard' })
    } else {
      return next({ name: 'Dashboard' })
    }
  }

  next()
})

export default router
