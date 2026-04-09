<template>
  <div class="flex flex-col gap-0">
    <!-- 웰컴 섹션 -->
    <div class="bg-gradient-to-br from-primary-700 to-primary-600 px-6 pt-6 pb-10">
      <div class="flex items-center justify-between mb-5">
        <div>
          <p class="text-primary-300 text-xs mb-0.5">안녕하세요 👋</p>
          <h2 class="text-xl font-bold text-white">{{ authStore.user?.name }}님</h2>
        </div>
        <div class="bg-white/10 rounded-xl px-3 py-1.5">
          <p class="text-[10px] text-primary-200">반려동물</p>
          <p class="text-lg font-black text-white text-center">{{ petStore.pets.length }}</p>
        </div>
      </div>

      <!-- 빠른 액션 버튼 -->
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="action in quickActions"
          :key="action.label"
          class="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-colors"
          @click="action.handler"
        >
          <span class="text-xl">{{ action.emoji }}</span>
          <span class="text-[11px] text-white font-medium">{{ action.label }}</span>
        </button>
      </div>
    </div>

    <!-- 콘텐츠 영역 (카드 오버랩) -->
    <div class="-mt-6 bg-slate-50 rounded-t-3xl px-4 pt-6 flex flex-col gap-6">

      <!-- 건강 알림 요약 배너 -->
      <section v-if="totalAlerts.urgent > 0 || totalAlerts.warning > 0">
        <div
          :class="[
            'rounded-2xl p-4 border flex items-start gap-3',
            totalAlerts.urgent > 0
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          ]"
        >
          <span class="text-2xl shrink-0">{{ totalAlerts.urgent > 0 ? '🚨' : '⚠️' }}</span>
          <div class="flex-1 min-w-0">
            <p :class="['font-bold text-sm mb-0.5', totalAlerts.urgent > 0 ? 'text-red-800' : 'text-amber-800']">
              건강 관리가 필요한 사항이 있어요
            </p>
            <p :class="['text-xs', totalAlerts.urgent > 0 ? 'text-red-600' : 'text-amber-600']">
              <span v-if="totalAlerts.urgent > 0">긴급 {{ totalAlerts.urgent }}건</span>
              <span v-if="totalAlerts.urgent > 0 && totalAlerts.warning > 0"> · </span>
              <span v-if="totalAlerts.warning > 0">주의 {{ totalAlerts.warning }}건</span>
              — 반려동물 카드를 확인해 주세요
            </p>
          </div>
        </div>
      </section>

      <!-- 내 반려동물 목록 -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-slate-900">내 반려동물</h3>
          <RouterLink to="/pets/register" class="text-sm text-primary-600 font-medium">
            + 등록하기
          </RouterLink>
        </div>

        <!-- 로딩 -->
        <div v-if="petStore.isLoading" class="flex justify-center py-10">
          <svg class="w-8 h-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <!-- 반려동물 없음 -->
        <div v-else-if="petStore.pets.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl">🐾</span>
          </div>
          <p class="font-semibold text-slate-700 mb-1">아직 등록된 반려동물이 없어요</p>
          <p class="text-sm text-slate-500 mb-5">첫 번째 반려동물을 등록하고<br />AI 건강 관리를 시작해 보세요!</p>
          <RouterLink to="/pets/register">
            <BaseButton>반려동물 등록하기</BaseButton>
          </RouterLink>
        </div>

        <!-- 반려동물 카드 리스트 -->
        <div v-else class="flex flex-col gap-3">
          <PetCard
            v-for="pet in petStore.pets"
            :key="pet.id"
            :pet="pet"
            :latest-scan="latestScans[pet.id]"
            :vaccinations="petVaccinations[pet.id] ?? []"
            :medical-visits="petMedicalVisits[pet.id] ?? []"
            @click="goToPetDetail"
          />
        </div>
      </section>

      <!-- 접종 일정 요약 -->
      <section v-if="upcomingVaccinations.length > 0">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-slate-900">💉 접종 일정</h3>
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="item in upcomingVaccinations"
            :key="item.vac.id"
            :class="[
              'rounded-xl p-3 border flex items-center gap-3',
              item.daysLeft < 0
                ? 'bg-red-50 border-red-200'
                : item.daysLeft <= 14
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200',
            ]"
          >
            <div :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg',
              item.daysLeft < 0 || item.daysLeft <= 14 ? 'bg-red-100' : 'bg-amber-100',
            ]">
              💉
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-800 truncate">{{ item.vac.vaccine_name }}</p>
              <p class="text-xs text-slate-500">{{ item.petName }} · {{ item.vac.hospital_name }}</p>
            </div>
            <div class="text-right shrink-0">
              <p :class="[
                'text-xs font-bold',
                item.daysLeft < 0 || item.daysLeft <= 14 ? 'text-red-600' : 'text-amber-600'
              ]">
                {{ item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}일 초과` : `D-${item.daysLeft}` }}
              </p>
              <p class="text-[10px] text-slate-400">{{ formatDate(item.vac.next_due_date!) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 최근 활동 -->
      <section v-if="recentScans.length > 0">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-slate-900">최근 건강 리포트</h3>
          <RouterLink to="/reports" class="text-sm text-primary-600 font-medium">전체 보기</RouterLink>
        </div>

        <div class="flex flex-col gap-3">
          <div
            v-for="item in recentScans"
            :key="item.scan.id"
            class="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
            @click="router.push(`/scans/${item.scan.id}`)"
          >
            <BaseAvatar :src="item.pet?.profile_image_url" :name="item.pet?.name" size="md" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-slate-900 text-sm truncate">{{ item.pet?.name }}</p>
              <p class="text-xs text-slate-500">
                BCS {{ item.scan.bcs_score }}점 · {{ formatDate(item.scan.scan_date) }}
              </p>
            </div>
            <BaseBadge :color="getBCSBadgeColor(item.scan.bcs_score)" size="sm">
              {{ getBCSLabel(item.scan.bcs_score) }}
            </BaseBadge>
          </div>
        </div>
      </section>

      <!-- 하단 여백 -->
      <div class="h-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { usePetStore } from '@/stores/petStore'
import { useScanStore } from '@/stores/scanStore'
import type { Pet, HealthScan, BCSScore, Vaccination, MedicalVisit } from '@/types'
import { mockGetVaccinationsByPetId, mockGetMedicalVisitsByPetId } from '@/mocks/medicalRecords'
import PetCard from '@/components/pets/PetCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'

const router = useRouter()
const authStore = useAuthStore()
const petStore = usePetStore()
const scanStore = useScanStore()

/** 반려동물별 최신 스캔 */
const latestScans = ref<Record<string, HealthScan>>({})

/** 반려동물별 접종 이력 */
const petVaccinations = ref<Record<string, Vaccination[]>>({})

/** 반려동물별 진료 이력 */
const petMedicalVisits = ref<Record<string, MedicalVisit[]>>({})

const recentScans = computed(() => {
  return Object.entries(latestScans.value)
    .map(([petId, scan]) => ({
      scan,
      pet: petStore.pets.find(p => p.id === petId),
    }))
    .filter(item => !!item.pet)
    .sort((a, b) => new Date(b.scan.scan_date).getTime() - new Date(a.scan.scan_date).getTime())
    .slice(0, 3)
})

/** 30일 이내 접종 예정 / 기간 초과 목록 */
const upcomingVaccinations = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const result: { vac: Vaccination; petName: string; daysLeft: number }[] = []

  for (const pet of petStore.pets) {
    const vacs = petVaccinations.value[pet.id] ?? []
    for (const vac of vacs) {
      if (!vac.next_due_date) continue
      const due = new Date(vac.next_due_date)
      due.setHours(0, 0, 0, 0)
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays <= 30) {
        result.push({ vac, petName: pet.name, daysLeft: diffDays })
      }
    }
  }

  return result.sort((a, b) => a.daysLeft - b.daysLeft)
})

/** 전체 알림 집계 */
const totalAlerts = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let urgent = 0
  let warning = 0

  for (const pet of petStore.pets) {
    // 접종 알림
    const vacs = petVaccinations.value[pet.id] ?? []
    for (const vac of vacs) {
      if (!vac.next_due_date) continue
      const due = new Date(vac.next_due_date)
      due.setHours(0, 0, 0, 0)
      const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (diff < 0 || diff <= 14) urgent++
      else if (diff <= 30) warning++
    }

    // BCS 알림
    const scan = latestScans.value[pet.id]
    if (scan) {
      if (scan.bcs_score <= 2 || scan.bcs_score >= 8) urgent++
      else if (scan.bcs_score === 3 || scan.bcs_score === 7) warning++
      if (scan.gait_score < 40) urgent++
      else if (scan.gait_score < 60) warning++
      if (scan.eye_clarity_score < 40) urgent++
      else if (scan.eye_clarity_score < 60) warning++
    }

    // 재진 알림
    const visits = petMedicalVisits.value[pet.id] ?? []
    for (const v of visits) {
      if (!v.follow_up_date) continue
      const fu = new Date(v.follow_up_date)
      fu.setHours(0, 0, 0, 0)
      const diff = Math.ceil((fu.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (diff < 0 && diff >= -7) urgent++
      else if (diff >= 0 && diff <= 7) warning++
    }
  }

  return { urgent, warning }
})

const quickActions = [
  { emoji: '📷', label: '건강 스캔', handler: () => router.push('/scan') },
  { emoji: '🐾', label: '반려동물 등록', handler: () => router.push('/pets/register') },
  { emoji: '📊', label: '전체 리포트', handler: () => router.push('/reports') },
]

function goToPetDetail(pet: Pet): void {
  petStore.selectPet(pet.id)
  router.push(`/pets/${pet.id}`)
}

function getBCSBadgeColor(score: BCSScore): 'success' | 'warning' | 'error' | 'primary' {
  if (score >= 4 && score <= 5) return 'success'
  if (score === 3 || score === 6) return 'warning'
  if (score <= 2 || score >= 7) return 'error'
  return 'primary'
}

function getBCSLabel(score: BCSScore): string {
  if (score <= 3) return '저체중'
  if (score <= 5) return '이상적'
  if (score <= 7) return '과체중'
  return '비만'
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(new Date(dateStr))
}

onMounted(async () => {
  await petStore.fetchPets()

  await Promise.all(petStore.pets.map(async (pet) => {
    const scans = await scanStore.fetchScansByPetId(pet.id)
    if (scans.length > 0) {
      latestScans.value[pet.id] = scans[0]
    }
    petVaccinations.value[pet.id] = mockGetVaccinationsByPetId(pet.id)
    petMedicalVisits.value[pet.id] = mockGetMedicalVisitsByPetId(pet.id)
  }))
})
</script>
