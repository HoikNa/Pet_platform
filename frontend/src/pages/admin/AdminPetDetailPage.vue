<template>
  <div v-if="selectedItem" class="flex flex-col gap-6 lg:flex-row lg:items-start">
    <!-- 왼쪽: 동물 기본 정보 + 보호자 -->
    <div class="flex flex-col gap-4 lg:w-80 shrink-0">
      <!-- 동물 프로필 카드 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="relative h-40 bg-slate-100">
          <img
            v-if="selectedItem.pet.profile_image_url"
            :src="selectedItem.pet.profile_image_url"
            :alt="selectedItem.pet.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="text-5xl">{{ selectedItem.pet.species === 'DOG' ? '🐶' : '🐱' }}</span>
          </div>
          <div class="absolute top-3 right-3">
            <BaseBadge
              :color="selectedItem.pet.registration_status === 'VERIFIED' ? 'success' : 'warning'"
              dot
            >
              {{ selectedItem.pet.registration_status === 'VERIFIED' ? '인증 완료' : '등록 대기' }}
            </BaseBadge>
          </div>
        </div>

        <div class="p-5">
          <h2 class="text-xl font-bold text-slate-900 mb-1">{{ selectedItem.pet.name }}</h2>
          <p class="text-sm text-slate-500 mb-4">{{ selectedItem.pet.breed }} · {{ ageText }} · {{ genderLabel }}</p>

          <div class="flex flex-col gap-2.5">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">생년월일</span>
              <span class="font-medium text-slate-800">{{ selectedItem.pet.birth_date }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">체중</span>
              <span class="font-medium text-slate-800">{{ selectedItem.pet.weight ? `${selectedItem.pet.weight}kg` : '-' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">중성화</span>
              <span class="font-medium text-slate-800">{{ selectedItem.pet.is_neutered ? '완료' : '미완료' }}</span>
            </div>
            <div v-if="selectedItem.biometric" class="flex justify-between text-sm">
              <span class="text-slate-500">생체 인식 품질</span>
              <span class="font-medium text-secondary-700">{{ selectedItem.biometric.quality_score.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 보호자 정보 카드 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 class="text-sm font-bold text-slate-900 mb-3">보호자 정보</h3>
        <div class="flex items-center gap-3 mb-4">
          <BaseAvatar :name="selectedItem.owner.name" size="md" />
          <div>
            <p class="font-semibold text-slate-900">{{ selectedItem.owner.name }}</p>
            <p class="text-xs text-slate-500">{{ selectedItem.owner.email }}</p>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2 text-sm text-slate-600">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {{ selectedItem.owner.phone }}
          </div>
        </div>
      </div>
    </div>

    <!-- 오른쪽: AI 헬스 리포트 + EMR 통합 뷰 -->
    <div class="flex-1 flex flex-col gap-4">
      <!-- 최신 AI 헬스 리포트 -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-base font-bold text-slate-900">최신 AI 건강 리포트</h3>
          <BaseBadge v-if="selectedItem.latest_scan" color="primary">
            {{ formatDate(selectedItem.latest_scan.scan_date) }}
          </BaseBadge>
        </div>

        <div class="p-5">
          <div v-if="selectedItem.latest_scan">
            <ScanResultChart :scan="selectedItem.latest_scan" />
          </div>
          <div v-else class="text-center py-10 text-slate-400">
            <p class="text-3xl mb-2">🔬</p>
            <p class="text-sm">건강 스캔 기록이 없습니다</p>
          </div>
        </div>
      </div>

      <!-- EMR 통합 데이터 (Mock CRM) -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <div class="w-6 h-6 bg-primary-100 rounded-md flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-900">원내 EMR 데이터 연동</h3>
          <BaseBadge color="slate" size="sm">Demo</BaseBadge>
        </div>

        <div class="p-5 flex flex-col gap-4">
          <!-- 진료 기록 Mock -->
          <div
            v-for="record in mockEMRRecords"
            :key="record.date"
            class="flex gap-4 p-4 bg-slate-50 rounded-xl"
          >
            <div class="w-2 self-stretch bg-primary-200 rounded-full shrink-0" />
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <p class="text-xs font-semibold text-slate-600">{{ record.date }}</p>
                <BaseBadge :color="record.badgeColor" size="sm">{{ record.type }}</BaseBadge>
              </div>
              <p class="text-sm font-medium text-slate-900">{{ record.diagnosis }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ record.treatment }}</p>
            </div>
          </div>

          <p class="text-xs text-slate-400 text-center">
            * 실제 EMR 연동 시 원내 진료 데이터가 표시됩니다
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- 선택된 동물 없음 -->
  <div v-else class="flex items-center justify-center min-h-96 text-slate-400">
    <div class="text-center">
      <p class="text-4xl mb-3">🐾</p>
      <p class="font-medium">환축을 선택해 주세요</p>
      <button
        class="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
        @click="router.push('/admin/dashboard')"
      >
        목록으로 돌아가기 →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/adminStore'
import ScanResultChart from '@/components/scan/ScanResultChart.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const selectedItem = computed(() => adminStore.selectedItem)

const ageText = computed(() => {
  if (!selectedItem.value) return ''
  const birth = new Date(selectedItem.value.pet.birth_date)
  const months = (new Date().getFullYear() - birth.getFullYear()) * 12 + (new Date().getMonth() - birth.getMonth())
  return months < 12 ? `${months}개월` : `${Math.floor(months / 12)}살`
})

const genderLabel = computed(() => selectedItem.value?.pet.gender === 'MALE' ? '수컷' : '암컷')

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr))
}

// Mock EMR 진료 기록
const mockEMRRecords = [
  { date: '2024-05-20', type: '검진', diagnosis: '정기 건강 검진', treatment: '혈액 검사, 체중 측정 정상', badgeColor: 'success' as const },
  { date: '2024-03-10', type: '치료', diagnosis: '피부 질환 (알레르기성 피부염)', treatment: '항히스타민제 처방, 2주 투약', badgeColor: 'warning' as const },
  { date: '2024-01-05', type: '예방', diagnosis: '종합 백신 접종', treatment: 'DHPPL + 코로나 + 켄넬코프', badgeColor: 'primary' as const },
]

onMounted(async () => {
  // 직접 URL로 진입 시 목록 로드
  if (!selectedItem.value) {
    await adminStore.fetchOrganization()
    await adminStore.fetchOrgPets()

    const petId = route.params.id as string
    const item = adminStore.petList.find(i => i.pet.id === petId)
    if (item) {
      adminStore.selectPetItem(item)
    }
  }
})
</script>
