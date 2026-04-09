<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex flex-col items-center justify-center p-6">
    <!-- 로고 -->
    <div class="text-center mb-10">
      <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <span class="text-primary-700 text-2xl font-black">P</span>
      </div>
      <h1 class="text-2xl font-black text-white">Pet-ID</h1>
      <p class="text-primary-300 text-sm mt-1">반려동물 AI 플랫폼</p>
    </div>

    <!-- 로그인 카드 -->
    <div class="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7">
      <h2 class="text-xl font-bold text-slate-900 mb-1">로그인</h2>
      <p class="text-sm text-slate-500 mb-6">계속하려면 로그인해 주세요</p>

      <!-- 카카오 로그인 -->
      <button
        class="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 mb-4"
        style="background: #FEE500; color: #3C1E1E;"
        :disabled="authStore.isLoading"
        @click="handleKakaoLogin"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.223.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/>
        </svg>
        <span>카카오로 3초 만에 시작하기</span>
      </button>

      <!-- 구분선 -->
      <div class="flex items-center gap-3 my-5">
        <div class="flex-1 h-px bg-slate-200" />
        <span class="text-xs text-slate-400">또는</span>
        <div class="flex-1 h-px bg-slate-200" />
      </div>

      <!-- 이메일 로그인 폼 -->
      <form @submit.prevent="handleEmailLogin" class="flex flex-col gap-4">
        <BaseInput
          v-model="email"
          label="이메일"
          type="email"
          placeholder="demo@petid.kr"
          :error="errors.email"
          required
        />
        <BaseInput
          v-model="password"
          label="비밀번호"
          type="password"
          placeholder="••••••••"
          :error="errors.password"
          required
          hint="데모 계정: demo@petid.kr / demo1234"
        />

        <!-- 에러 메시지 -->
        <div v-if="loginError" class="flex items-center gap-2 p-3 bg-error-50 rounded-xl border border-error-200">
          <svg class="w-4 h-4 text-error-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <p class="text-xs text-error-700">{{ loginError }}</p>
        </div>

        <BaseButton type="submit" :loading="authStore.isLoading" fullWidth size="lg">
          로그인
        </BaseButton>
      </form>

      <!-- 관리자 계정 안내 -->
      <div class="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p class="text-xs font-semibold text-slate-600 mb-2">데모 계정 안내</p>
        <div class="flex flex-col gap-1.5">
          <div v-for="acct in demoAccounts" :key="acct.email" class="flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-700 font-medium">{{ acct.label }}</p>
              <p class="text-[10px] text-slate-500">{{ acct.email }}</p>
            </div>
            <button
              class="text-[11px] text-primary-600 font-medium hover:text-primary-700 transition-colors"
              @click="fillDemo(acct.email, acct.password)"
            >
              자동 입력
            </button>
          </div>
        </div>
      </div>

      <!-- 랜딩 페이지 링크 -->
      <div class="mt-5 text-center">
        <RouterLink to="/landing" class="text-xs text-slate-400 hover:text-slate-600 transition-colors">
          ← 랜딩 페이지로 돌아가기
        </RouterLink>
      </div>
    </div>
  </div>

  <!-- 신규 유저 반려동물 등록 유도 모달 -->
  <BaseModal v-model="showNewUserModal" title="" :show-close="false" :close-on-overlay="false" size="sm">
    <div class="text-center py-2">
      <div class="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span class="text-4xl">🐾</span>
      </div>
      <h3 class="text-lg font-black text-slate-900 mb-2">반려동물을 등록해 보세요!</h3>
      <p class="text-sm text-slate-500 leading-relaxed mb-6">
        AI 생체 인식으로 반려동물의 디지털 신분증을 발급하고<br />
        무료 건강 리포트를 받아보세요.
      </p>
      <div class="flex flex-col gap-2">
        <BaseButton fullWidth size="md" @click="goToRegister">
          지금 등록하기
        </BaseButton>
        <BaseButton variant="ghost" fullWidth size="md" @click="goToDashboard">
          나중에 할게요
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePetStore } from '@/stores/petStore'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const petStore = usePetStore()
const { success } = useToast()
const showNewUserModal = ref(false)

const email = ref('demo@petid.kr')
const password = ref('demo1234')
const loginError = ref('')
const errors = reactive({ email: '', password: '' })

const demoAccounts = [
  { label: 'B2C 반려인', email: 'demo@petid.kr', password: 'demo1234' },
  { label: '동물병원 관리자', email: 'hospital@petid.kr', password: 'hospital1234' },
  { label: '보험사 관리자', email: 'insurance@petid.kr', password: 'insurance1234' },
  { label: '지자체 관리자', email: 'gov@petid.kr', password: 'gov1234' },
]

function fillDemo(e: string, p: string): void {
  email.value = e
  password.value = p
}

function validate(): boolean {
  errors.email = ''
  errors.password = ''
  if (!email.value) { errors.email = '이메일을 입력해 주세요'; return false }
  if (!password.value) { errors.password = '비밀번호를 입력해 주세요'; return false }
  return true
}

async function handleEmailLogin(): Promise<void> {
  if (!validate()) return
  loginError.value = ''

  const ok = await authStore.login(email.value, password.value)
  if (!ok) {
    loginError.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
    return
  }

  success('로그인 성공', `${authStore.user?.name}님 환영합니다!`)
  redirectAfterLogin()
}

async function handleKakaoLogin(): Promise<void> {
  loginError.value = ''
  const ok = await authStore.kakaoLogin()
  if (!ok) {
    loginError.value = '카카오 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    return
  }
  success('로그인 성공', `${authStore.user?.name}님 환영합니다!`)
  redirectAfterLogin()
}

async function redirectAfterLogin(): Promise<void> {
  const role = authStore.userRole
  if (role === 'B2B_HOSPITAL') {
    router.push('/admin/hospital/dashboard')
    return
  }
  if (role === 'B2B_INSURANCE') {
    router.push('/admin/insurance/dashboard')
    return
  }
  if (role === 'B2G') {
    router.push('/admin/gov/dashboard')
    return
  }
  if (role === 'ADMIN') {
    router.push('/admin/dashboard')
    return
  }
  // B2C 신규 유저 감지: 반려동물 목록 로드 후 없으면 등록 유도 팝업
  await petStore.fetchPets()
  if (petStore.pets.length === 0) {
    showNewUserModal.value = true
  } else {
    router.push('/dashboard')
  }
}

function goToRegister(): void {
  showNewUserModal.value = false
  router.push('/pets/register')
}

function goToDashboard(): void {
  showNewUserModal.value = false
  router.push('/dashboard')
}
</script>
