<template>
  <div v-if="claim" class="flex flex-col gap-6">
    <!-- 헤더 -->
    <div class="flex items-center gap-4">
      <button class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" @click="router.back()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div>
        <h1 class="text-lg font-bold text-slate-900">청구 상세 — {{ claim.id }}</h1>
        <p class="text-xs text-slate-500">청구일: {{ formatDate(claim.claim_date) }}</p>
      </div>
      <div class="ml-auto">
        <BaseBadge :color="getStatusColor(claim.status)" size="md">
          {{ getStatusLabel(claim.status) }}
        </BaseBadge>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 청구 정보 -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- 기본 정보 -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 class="text-sm font-bold text-slate-900 mb-4">청구 기본 정보</h2>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-xs text-slate-500 mb-1">반려동물</p>
              <p class="font-semibold text-slate-900">{{ getPetName(claim.pet_id) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 mb-1">보호자</p>
              <p class="font-semibold text-slate-900">{{ getOwnerName(claim.owner_id) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 mb-1">진료 병원</p>
              <p class="font-semibold text-slate-900">{{ claim.hospital_name }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 mb-1">진료일</p>
              <p class="font-semibold text-slate-900">{{ formatDate(claim.treatment_date) }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-xs text-slate-500 mb-1">진단명</p>
              <p class="font-semibold text-slate-900">{{ claim.diagnosis }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-xs text-slate-500 mb-1">치료 내용</p>
              <p class="text-slate-700">{{ claim.treatment_notes ?? '-' }}</p>
            </div>
          </div>
        </div>

        <!-- 금액 정보 -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 class="text-sm font-bold text-slate-900 mb-4">보험금 정보</h2>
          <div class="flex gap-4">
            <div class="flex-1 bg-slate-50 rounded-xl p-4 text-center">
              <p class="text-xs text-slate-500 mb-1">청구 금액</p>
              <p class="text-xl font-black text-slate-900">{{ claim.claimed_amount.toLocaleString() }}원</p>
            </div>
            <div class="flex-1 bg-success-50 rounded-xl p-4 text-center">
              <p class="text-xs text-slate-500 mb-1">승인 금액</p>
              <p class="text-xl font-black text-success-700">
                {{ claim.approved_amount !== undefined ? claim.approved_amount.toLocaleString() + '원' : '-' }}
              </p>
            </div>
            <div class="flex-1 bg-primary-50 rounded-xl p-4 text-center">
              <p class="text-xs text-slate-500 mb-1">승인율</p>
              <p class="text-xl font-black text-primary-700">
                {{ claim.approved_amount !== undefined ? Math.round((claim.approved_amount / claim.claimed_amount) * 100) + '%' : '-' }}
              </p>
            </div>
          </div>
        </div>

        <!-- 심사 메모 -->
        <div v-if="claim.reviewer_notes" class="bg-error-50 rounded-xl border border-error-200 p-4">
          <p class="text-xs font-bold text-error-700 mb-1">거부 사유</p>
          <p class="text-sm text-error-700">{{ claim.reviewer_notes }}</p>
        </div>

        <!-- 심사 액션 (심사 중/대기 상태에서만) -->
        <div v-if="claim.status === 'PENDING' || claim.status === 'REVIEWING'" class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 class="text-sm font-bold text-slate-900 mb-4">심사 처리</h2>
          <div class="flex flex-col gap-3">
            <div>
              <label class="text-xs text-slate-500 mb-1 block">승인 금액 (원)</label>
              <input
                v-model.number="approveAmount"
                type="number"
                :placeholder="claim.claimed_amount.toString()"
                class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
              />
            </div>
            <div>
              <label class="text-xs text-slate-500 mb-1 block">심사 메모 (선택)</label>
              <textarea
                v-model="reviewerNotes"
                rows="3"
                placeholder="거부 사유 또는 추가 메모..."
                class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all resize-none"
              />
            </div>
            <div class="flex gap-3">
              <button
                class="flex-1 py-2.5 bg-success-600 text-white text-sm font-semibold rounded-xl hover:bg-success-700 transition-colors"
                @click="handleApprove"
              >
                승인
              </button>
              <button
                class="flex-1 py-2.5 bg-error-600 text-white text-sm font-semibold rounded-xl hover:bg-error-700 transition-colors"
                @click="handleReject"
              >
                거부
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- AI 리스크 & 반려동물 정보 -->
      <div class="flex flex-col gap-6">
        <!-- AI 리스크 점수 -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 class="text-sm font-bold text-slate-900 mb-4">AI 리스크 분석</h2>
          <div class="flex flex-col items-center gap-3 mb-4">
            <div :class="['w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black border-4', getRiskRingClass(claim.risk_score)]">
              {{ claim.risk_score ?? '?' }}
            </div>
            <div>
              <p :class="['text-sm font-bold text-center', getRiskTextClass(claim.risk_score)]">
                {{ getRiskLabel(claim.risk_score) }}
              </p>
              <p class="text-xs text-slate-400 text-center">0~100점 (높을수록 고위험)</p>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-slate-500">BCS 점수</span>
              <span class="font-semibold text-slate-700">{{ pet?.latest_scan?.bcs_score ?? '-' }} / 9</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-slate-500">보행 점수</span>
              <span class="font-semibold text-slate-700">{{ pet?.latest_scan?.gait_score?.toFixed(1) ?? '-' }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-slate-500">AI 코멘트</span>
            </div>
            <p class="text-xs text-slate-600 bg-slate-50 rounded-lg p-2">
              {{ pet?.latest_scan?.ai_comment ?? '스캔 데이터 없음' }}
            </p>
          </div>
        </div>

        <!-- 반려동물 정보 -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 class="text-sm font-bold text-slate-900 mb-3">반려동물 정보</h2>
          <div v-if="petInfo" class="space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">이름</span>
              <span class="font-semibold text-slate-700">{{ petInfo.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">종/품종</span>
              <span class="font-semibold text-slate-700">{{ petInfo.species === 'DOG' ? '강아지' : '고양이' }} · {{ petInfo.breed }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">나이</span>
              <span class="font-semibold text-slate-700">{{ calcAge(petInfo.birth_date) }}세</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">체중</span>
              <span class="font-semibold text-slate-700">{{ petInfo.weight ?? '-' }} kg</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">중성화</span>
              <span class="font-semibold text-slate-700">{{ petInfo.is_neutered ? '완료' : '미완료' }}</span>
            </div>
          </div>
          <button
            class="mt-3 w-full text-xs text-primary-600 font-semibold hover:text-primary-700 text-center"
            @click="router.push(`/admin/pets/${claim.pet_id}`)"
          >
            EMR 전체 보기 →
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex justify-center items-center h-64 text-slate-400">
    청구 정보를 찾을 수 없습니다
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { mockGetClaimById } from '@/mocks/insurance'
import { mockGetOrgPets } from '@/mocks/organizations'
import { MOCK_ORG_PETS } from '@/mocks/pets'
import type { ClaimStatus } from '@/types'

const route = useRoute()
const router = useRouter()

const claim = computed(() => mockGetClaimById(route.params.id as string))
const orgPets = mockGetOrgPets('org-insurance-001')
const pet = computed(() => orgPets.find(i => i.pet.id === claim.value?.pet_id))
const petInfo = computed(() => MOCK_ORG_PETS.find(p => p.id === claim.value?.pet_id))

const approveAmount = ref<number | null>(null)
const reviewerNotes = ref('')

const OWNERS: Record<string, string> = {
  'user-b2c-001': '김반려',
  'user-b2c-002': '이견주',
  'user-b2c-003': '박고양',
  'user-b2c-004': '최강아',
}

function getPetName(petId: string): string {
  return MOCK_ORG_PETS.find(p => p.id === petId)?.name ?? petId
}

function getOwnerName(ownerId: string): string {
  return OWNERS[ownerId] ?? ownerId
}

function formatDate(d: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(d))
}

function calcAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const now = new Date('2026-04-09')
  return now.getFullYear() - birth.getFullYear()
}

function getStatusLabel(status: ClaimStatus): string {
  const map: Record<ClaimStatus, string> = { PENDING: '접수 대기', REVIEWING: '심사 중', APPROVED: '승인', REJECTED: '거부' }
  return map[status]
}

function getStatusColor(status: ClaimStatus): 'primary' | 'success' | 'error' | 'warning' {
  const map: Record<ClaimStatus, 'primary' | 'success' | 'error' | 'warning'> = {
    PENDING: 'warning', REVIEWING: 'primary', APPROVED: 'success', REJECTED: 'error',
  }
  return map[status]
}

function getRiskLabel(score?: number): string {
  if (score === undefined || score === null) return '데이터 없음'
  if (score >= 60) return '고위험'
  if (score >= 30) return '중위험'
  return '저위험'
}

function getRiskRingClass(score?: number): string {
  if (score === undefined || score === null) return 'border-slate-200 text-slate-400'
  if (score >= 60) return 'border-error-400 text-error-700'
  if (score >= 30) return 'border-warning-400 text-warning-700'
  return 'border-success-400 text-success-700'
}

function getRiskTextClass(score?: number): string {
  if (score === undefined || score === null) return 'text-slate-500'
  if (score >= 60) return 'text-error-600'
  if (score >= 30) return 'text-warning-600'
  return 'text-success-600'
}

function handleApprove(): void {
  alert(`청구 ${claim.value?.id} 승인 처리 (실제 API 연동 필요)\n승인액: ${(approveAmount.value ?? claim.value?.claimed_amount ?? 0).toLocaleString()}원`)
}

function handleReject(): void {
  if (!reviewerNotes.value.trim()) {
    alert('거부 사유를 입력해주세요')
    return
  }
  alert(`청구 ${claim.value?.id} 거부 처리 (실제 API 연동 필요)\n사유: ${reviewerNotes.value}`)
}
</script>
