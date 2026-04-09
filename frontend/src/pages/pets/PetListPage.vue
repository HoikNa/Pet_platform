<template>
  <div class="flex flex-col gap-6 px-4 py-6">
    <!-- 헤더 -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-900">내 반려동물</h1>
      <RouterLink to="/pets/register" class="text-sm text-primary-600 font-medium">+ 등록하기</RouterLink>
    </div>

    <!-- 로딩 -->
    <div v-if="petStore.isLoading" class="flex justify-center py-16">
      <svg class="w-8 h-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- 반려동물 없음 -->
    <div v-else-if="petStore.pets.length === 0" class="flex flex-col items-center py-20 gap-4">
      <div class="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center">
        <span class="text-4xl">🐾</span>
      </div>
      <div class="text-center">
        <p class="font-semibold text-slate-700 mb-1">아직 등록된 반려동물이 없어요</p>
        <p class="text-sm text-slate-500">첫 번째 반려동물을 등록하고<br />AI 건강 관리를 시작해 보세요!</p>
      </div>
      <RouterLink to="/pets/register">
        <BaseButton>반려동물 등록하기</BaseButton>
      </RouterLink>
    </div>

    <!-- 반려동물 카드 목록 -->
    <div v-else class="flex flex-col gap-3">
      <RouterLink
        v-for="pet in petStore.pets"
        :key="pet.id"
        :to="`/pets/${pet.id}`"
        class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98]"
      >
        <BaseAvatar :src="pet.profile_image_url" :name="pet.name" size="lg" />
        <div class="flex-1 min-w-0">
          <p class="font-bold text-slate-900">{{ pet.name }}</p>
          <p class="text-sm text-slate-500">{{ pet.breed }}</p>
          <p class="text-xs text-slate-400 mt-0.5">{{ pet.gender === 'MALE' ? '수컷' : '암컷' }} · {{ calcAge(pet.birth_date) }}</p>
        </div>
        <svg class="w-5 h-5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { usePetStore } from '@/stores/petStore'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const petStore = usePetStore()

function calcAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (months < 12) return `${months}개월`
  return `${Math.floor(months / 12)}살`
}

onMounted(async () => {
  if (petStore.pets.length === 0) {
    await petStore.fetchPets()
  }
})
</script>
