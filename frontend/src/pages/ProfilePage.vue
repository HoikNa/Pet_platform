<template>
  <div>
  <div class="flex flex-col gap-6 pb-6">
      <!-- 프로필 헤더 -->
      <div class="flex flex-col items-center gap-3 pt-4">
        <div class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
          <img v-if="user?.avatar_url" :src="user.avatar_url" :alt="user.name" class="w-full h-full object-cover" />
          <span v-else class="text-3xl font-bold text-primary-600">{{ userInitial }}</span>
        </div>
        <div class="text-center">
          <p class="text-lg font-bold text-slate-800">{{ user?.name }}</p>
          <p class="text-sm text-slate-500">{{ user?.email }}</p>
        </div>
      </div>

      <!-- 프로필 정보 카드 -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mx-4">
        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-700">기본 정보</h2>
          <button
            v-if="!isEditing"
            class="text-xs text-primary-600 font-medium"
            @click="startEdit"
          >
            수정
          </button>
        </div>

        <div v-if="!isEditing" class="divide-y divide-slate-50">
          <div class="px-4 py-3 flex items-center justify-between">
            <span class="text-sm text-slate-500">이름</span>
            <span class="text-sm font-medium text-slate-800">{{ user?.name }}</span>
          </div>
          <div class="px-4 py-3 flex items-center justify-between">
            <span class="text-sm text-slate-500">전화번호</span>
            <span class="text-sm font-medium text-slate-800">{{ user?.phone ?? '미등록' }}</span>
          </div>
          <div class="px-4 py-3 flex items-center justify-between">
            <span class="text-sm text-slate-500">이메일</span>
            <span class="text-sm font-medium text-slate-800">{{ user?.email }}</span>
          </div>
          <div class="px-4 py-3 flex items-center justify-between">
            <span class="text-sm text-slate-500">가입일</span>
            <span class="text-sm font-medium text-slate-800">{{ formatDate(user?.created_at) }}</span>
          </div>
        </div>

        <!-- 편집 폼 -->
        <div v-else class="px-4 py-4 flex flex-col gap-3">
          <BaseInput v-model="editForm.name" label="이름" placeholder="이름을 입력하세요" :error="editErrors.name" />
          <BaseInput v-model="editForm.phone" label="전화번호" placeholder="예) 010-1234-5678" type="tel" />
          <div class="flex gap-2 mt-1">
            <BaseButton variant="outline" class="flex-1" @click="cancelEdit">취소</BaseButton>
            <BaseButton class="flex-1" :loading="isSaving" @click="saveEdit">저장</BaseButton>
          </div>
        </div>
      </div>

      <!-- 반려동물 현황 -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mx-4">
        <div class="px-4 py-3 border-b border-slate-100">
          <h2 class="text-sm font-semibold text-slate-700">반려동물 현황</h2>
        </div>
        <div class="px-4 py-3 flex items-center justify-between">
          <span class="text-sm text-slate-500">등록된 반려동물</span>
          <span class="text-sm font-bold text-primary-600">{{ pets.length }}마리</span>
        </div>
        <div class="px-4 py-3 flex items-center justify-between border-t border-slate-50">
          <span class="text-sm text-slate-500">인증 완료</span>
          <span class="text-sm font-bold text-secondary-600">{{ verifiedPets.length }}마리</span>
        </div>
      </div>

      <!-- 앱 정보 -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mx-4">
        <div class="px-4 py-3 border-b border-slate-100">
          <h2 class="text-sm font-semibold text-slate-700">앱 정보</h2>
        </div>
        <div class="divide-y divide-slate-50">
          <div class="px-4 py-3 flex items-center justify-between">
            <span class="text-sm text-slate-500">버전</span>
            <span class="text-sm font-medium text-slate-800">v1.0.0 (데모)</span>
          </div>
          <button
            class="w-full px-4 py-3 flex items-center justify-between text-left"
            @click="showTerms = true"
          >
            <span class="text-sm text-slate-500">이용약관</span>
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            class="w-full px-4 py-3 flex items-center justify-between text-left"
            @click="showPrivacy = true"
          >
            <span class="text-sm text-slate-500">개인정보처리방침</span>
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 로그아웃 -->
      <div class="px-4">
        <BaseButton variant="outline" class="w-full text-error-600 border-error-200 hover:bg-error-50" @click="confirmLogout">
          로그아웃
        </BaseButton>
      </div>
    </div>

    <!-- 로그아웃 확인 모달 -->
    <BaseModal v-model="showLogoutModal" title="로그아웃">
      <p class="text-sm text-slate-600">정말 로그아웃 하시겠습니까?</p>
      <template #footer>
        <BaseButton variant="outline" @click="showLogoutModal = false">취소</BaseButton>
        <BaseButton class="bg-error-500 hover:bg-error-600" :loading="isLoggingOut" @click="doLogout">로그아웃</BaseButton>
      </template>
    </BaseModal>

    <!-- 이용약관 모달 -->
    <BaseModal v-model="showTerms" title="이용약관" size="lg">
      <p class="text-sm text-slate-600 leading-relaxed">
        Pet-ID 서비스 이용약관입니다. 본 서비스는 반려동물의 생체 인식 기반 신원 인증 및 의료 기록 관리를 제공합니다.
        서비스 이용 시 개인정보 처리방침에 동의한 것으로 간주됩니다.
      </p>
      <template #footer>
        <BaseButton @click="showTerms = false">확인</BaseButton>
      </template>
    </BaseModal>

    <!-- 개인정보처리방침 모달 -->
    <BaseModal v-model="showPrivacy" title="개인정보처리방침" size="lg">
      <p class="text-sm text-slate-600 leading-relaxed">
        Pet-ID는 반려동물 등록 및 서비스 제공을 위해 최소한의 개인정보를 수집합니다.
        수집된 정보는 서비스 개선 및 법적 의무 이행 이외의 목적으로 사용되지 않습니다.
      </p>
      <template #footer>
        <BaseButton @click="showPrivacy = false">확인</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePetStore } from '@/stores/petStore'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const petStore = usePetStore()

const user = computed(() => authStore.user)
const pets = computed(() => petStore.pets)
const verifiedPets = computed(() => petStore.verifiedPets)

const userInitial = computed(() => user.value?.name?.charAt(0) ?? '?')

const isEditing = ref(false)
const isSaving = ref(false)
const showLogoutModal = ref(false)
const isLoggingOut = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)

const editForm = reactive({ name: '', phone: '' })
const editErrors = reactive({ name: '' })

function formatDate(isoStr?: string): string {
  if (!isoStr) return '-'
  return new Date(isoStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function startEdit(): void {
  editForm.name = user.value?.name ?? ''
  editForm.phone = user.value?.phone ?? ''
  editErrors.name = ''
  isEditing.value = true
}

function cancelEdit(): void {
  isEditing.value = false
}

async function saveEdit(): Promise<void> {
  editErrors.name = editForm.name.trim() ? '' : '이름을 입력해 주세요'
  if (editErrors.name) return

  isSaving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 400))
    // 실제 API 연동 시: await userService.updateProfile({ name: editForm.name, phone: editForm.phone })
    if (authStore.user) {
      authStore.user.name = editForm.name.trim()
      authStore.user.phone = editForm.phone || undefined
    }
    isEditing.value = false
  } finally {
    isSaving.value = false
  }
}

function confirmLogout(): void {
  showLogoutModal.value = true
}

async function doLogout(): Promise<void> {
  isLoggingOut.value = true
  try {
    await authStore.logout()
    petStore.reset()
    router.push('/login')
  } finally {
    isLoggingOut.value = false
  }
}
</script>
