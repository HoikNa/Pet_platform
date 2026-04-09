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
    redirect: '/login',
  },
  {
    path: '/landing',
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
    path: '/scan/voice',
    name: 'ScanVoice',
    component: () => import('@/pages/scan/ScanVoicePage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2C'],
      layout: 'none', // 전체 화면 녹음
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
    path: '/scan/report/:id',
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

  // 리포트 목록
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/pages/ReportsPage.vue'),
    meta: { requiresAuth: true, requiredRoles: ['B2C'], layout: 'mobile', title: '스캔 기록' },
  },

  // 프로필
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/ProfilePage.vue'),
    meta: { requiresAuth: true, requiredRoles: ['B2C'], layout: 'mobile', title: '프로필' },
  },

  // ---- B2B/B2G 관리자 레이아웃 라우트 ----
  // 역할에 따라 적절한 대시보드로 리다이렉트
  {
    path: '/admin',
    redirect: () => {
      // 라우터 레벨에서는 스토어 접근이 어려우므로 가드에서 처리
      return '/admin/dashboard'
    },
  },

  // 슈퍼 관리자 (ADMIN)
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/pages/admin/AdminDashboardPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['ADMIN'],
      layout: 'admin',
      title: '전체 관리 대시보드',
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

  // ---- 동물병원 (B2B_HOSPITAL) ----
  {
    path: '/admin/hospital',
    redirect: '/admin/hospital/dashboard',
  },
  {
    path: '/admin/hospital/dashboard',
    name: 'HospitalDashboard',
    component: () => import('@/pages/admin/hospital/HospitalDashboardPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2B_HOSPITAL'],
      layout: 'admin',
      title: '진료 대시보드',
    },
  },
  {
    path: '/admin/hospital/appointments',
    name: 'HospitalAppointments',
    component: () => import('@/pages/admin/hospital/HospitalAppointmentsPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2B_HOSPITAL'],
      layout: 'admin',
      title: '예약/진료 관리',
    },
  },
  {
    path: '/admin/hospital/vaccinations',
    name: 'HospitalVaccinations',
    component: () => import('@/pages/admin/hospital/HospitalVaccinationsPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2B_HOSPITAL'],
      layout: 'admin',
      title: '접종 관리',
    },
  },

  // ---- 보험사 (B2B_INSURANCE) ----
  {
    path: '/admin/insurance',
    redirect: '/admin/insurance/dashboard',
  },
  {
    path: '/admin/insurance/dashboard',
    name: 'InsuranceDashboard',
    component: () => import('@/pages/admin/insurance/InsuranceDashboardPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2B_INSURANCE'],
      layout: 'admin',
      title: '보험 대시보드',
    },
  },
  {
    path: '/admin/insurance/claims',
    name: 'InsuranceClaims',
    component: () => import('@/pages/admin/insurance/InsuranceClaimsPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2B_INSURANCE'],
      layout: 'admin',
      title: '보험 청구 관리',
    },
  },
  {
    path: '/admin/insurance/claims/:id',
    name: 'InsuranceClaimDetail',
    component: () => import('@/pages/admin/insurance/InsuranceClaimDetailPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2B_INSURANCE'],
      layout: 'admin',
      title: '청구 상세',
    },
  },
  {
    path: '/admin/insurance/analytics',
    name: 'InsuranceAnalytics',
    component: () => import('@/pages/admin/insurance/InsuranceAnalyticsPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2B_INSURANCE'],
      layout: 'admin',
      title: '리스크 분석',
    },
  },

  // ---- 지자체 (B2G) ----
  {
    path: '/admin/gov',
    redirect: '/admin/gov/dashboard',
  },
  {
    path: '/admin/gov/dashboard',
    name: 'GovDashboard',
    component: () => import('@/pages/admin/gov/GovDashboardPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2G'],
      layout: 'admin',
      title: '동물등록 대시보드',
    },
  },
  {
    path: '/admin/gov/registrations',
    name: 'GovRegistrations',
    component: () => import('@/pages/admin/gov/GovRegistrationsPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2G'],
      layout: 'admin',
      title: '등록 신청 관리',
    },
  },
  {
    path: '/admin/gov/shelter',
    name: 'GovShelter',
    component: () => import('@/pages/admin/gov/GovShelterPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2G'],
      layout: 'admin',
      title: '유기동물 관리',
    },
  },
  {
    path: '/admin/gov/statistics',
    name: 'GovStatistics',
    component: () => import('@/pages/admin/gov/GovStatisticsPage.vue'),
    meta: {
      requiresAuth: true,
      requiredRoles: ['B2G'],
      layout: 'admin',
      title: '지역 통계',
    },
  },

  // ---- 404 폴백 ----
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/',
  },
]

/** 역할별 기본 대시보드 라우트 반환 */
function getRoleDashboard(role: string | null | undefined): { name: string } {
  switch (role) {
    case 'B2B_HOSPITAL': return { name: 'HospitalDashboard' }
    case 'B2B_INSURANCE': return { name: 'InsuranceDashboard' }
    case 'B2G': return { name: 'GovDashboard' }
    case 'ADMIN': return { name: 'AdminDashboard' }
    default: return { name: 'Dashboard' }
  }
}

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
        return next(getRoleDashboard(userRole))
      }
    }
  }

  // /admin 루트 접근 시 역할별 대시보드로 리다이렉트
  if (to.path === '/admin/dashboard' && authStore.isAuthenticated) {
    const userRole = authStore.userRole
    if (userRole && userRole !== 'ADMIN') {
      return next(getRoleDashboard(userRole))
    }
  }

  // 이미 로그인한 사용자가 로그인 페이지 접근 시
  if (to.name === 'Login' && authStore.isAuthenticated) {
    return next(getRoleDashboard(authStore.userRole))
  }

  next()
})

export default router
