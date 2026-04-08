<template>
  <div v-if="pet" class="flex flex-col">
    <!-- 히어로 이미지 -->
    <div class="relative h-56 bg-slate-100">
      <img
        v-if="pet.profile_image_url"
        :src="pet.profile_image_url"
        :alt="pet.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="text-7xl">{{ pet.species === 'DOG' ? '🐶' : '🐱' }}</span>
      </div>

      <!-- 등록 상태 배지 -->
      <div class="absolute top-4 right-4">
        <BaseBadge :color="pet.registration_status === 'VERIFIED' ? 'success' : 'warning'" dot>
          {{ pet.registration_status === 'VERIFIED' ? '생체 인식 인증 완료' : '등록 대기 중' }}
        </BaseBadge>
      </div>
    </div>

    <!-- 기본 정보 -->
    <div class="px-4 py-4 bg-white border-b border-slate-100">
      <div class="flex items-start justify-between mb-3">
        <div>
          <h1 class="text-2xl font-black text-slate-900">{{ pet.name }}</h1>
          <p class="text-sm text-slate-500">{{ pet.breed }} · {{ speciesLabel }} · {{ ageText }}</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="text-right mr-2">
            <p class="text-xs text-slate-400">성별</p>
            <p class="font-semibold text-slate-700 text-sm">{{ genderLabel }}{{ pet.is_neutered ? ' (중성화)' : '' }}</p>
          </div>
          <!-- 정보 수정 버튼 -->
          <button
            class="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            @click="openEditModal"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 기본 정보 그리드 -->
      <div class="grid grid-cols-3 gap-2">
        <div
          v-for="info in petInfoItems"
          :key="info.label"
          class="bg-slate-50 rounded-xl p-2.5 text-center"
        >
          <p class="text-[10px] text-slate-400 mb-0.5">{{ info.label }}</p>
          <p class="font-bold text-slate-800 text-xs">{{ info.value }}</p>
        </div>
      </div>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="flex bg-white border-b border-slate-200 sticky top-0 z-10 overflow-x-auto scrollbar-none">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
          activeTab === tab.id
            ? 'border-primary-600 text-primary-700'
            : 'border-transparent text-slate-500 hover:text-slate-700',
        ]"
        @click="activeTab = tab.id"
      >
        <span>{{ tab.emoji }}</span>
        {{ tab.label }}
      </button>
    </div>

    <!-- 탭 콘텐츠 -->
    <div class="bg-slate-50 flex-1 pb-28">

      <!-- ===== 건강 스캔 탭 ===== -->
      <div v-show="activeTab === 'scan'" class="px-4 pt-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-slate-900">건강 스캔 기록</h2>
          <p class="text-xs text-slate-400">{{ scans.length }}회</p>
        </div>

        <div v-if="scanStore.isLoading" class="flex justify-center py-12">
          <svg class="w-7 h-7 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div v-else-if="scans.length === 0" class="text-center py-12">
          <p class="text-3xl mb-3">🔬</p>
          <p class="text-sm font-medium text-slate-700 mb-1">아직 건강 스캔이 없어요</p>
          <p class="text-xs text-slate-500">아래 버튼을 눌러 첫 번째 AI 건강 스캔을 시작해 보세요</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <!-- BCS 트렌드 차트 -->
          <div class="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <p class="text-xs font-semibold text-slate-500 mb-3">BCS 추이 (최근 6회)</p>
            <div class="flex items-end gap-1.5 h-16">
              <div v-for="scan in recentScansForChart" :key="scan.id" class="flex-1 flex flex-col items-center gap-1">
                <span class="text-[10px] text-slate-500 font-medium">{{ scan.bcs_score }}</span>
                <div
                  :class="['w-full rounded-t transition-all', getBCSBarColor(scan.bcs_score)]"
                  :style="{ height: `${(scan.bcs_score / 9) * 48}px` }"
                />
                <span class="text-[9px] text-slate-400">{{ formatShortDate(scan.scan_date) }}</span>
              </div>
            </div>
          </div>

          <div
            v-for="scan in scans"
            :key="scan.id"
            class="bg-white rounded-xl p-4 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all"
            @click="router.push(`/scan/report/${scan.id}`)"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="text-xs text-slate-400">{{ formatDate(scan.scan_date) }}</p>
                <p class="text-sm font-semibold text-slate-800 mt-0.5">BCS {{ scan.bcs_score }}점 · {{ bcsLabel(scan.bcs_score) }}</p>
              </div>
              <BaseBadge :color="getBCSBadgeColor(scan.bcs_score)">{{ bcsLabel(scan.bcs_score) }}</BaseBadge>
            </div>
            <p class="text-xs text-slate-500 line-clamp-2">{{ scan.ai_comment }}</p>
            <div class="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
              <span class="text-[11px] text-slate-400">보행 {{ scan.gait_score.toFixed(0) }}점</span>
              <span class="text-slate-200">·</span>
              <span class="text-[11px] text-slate-400">안구 {{ scan.eye_clarity_score.toFixed(0) }}점</span>
              <div class="flex gap-1 ml-auto">
                <BaseBadge v-for="type in scan.scan_types" :key="type" color="slate" size="sm">{{ type }}</BaseBadge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 진료 이력 탭 ===== -->
      <div v-show="activeTab === 'visits'" class="px-4 pt-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-slate-900">진료 이력</h2>
          <p class="text-xs text-slate-400">총 {{ medicalStore.visits.length }}건</p>
        </div>

        <div v-if="medicalStore.isLoading" class="flex justify-center py-12">
          <svg class="w-7 h-7 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div v-else-if="medicalStore.visits.length === 0" class="text-center py-12">
          <p class="text-3xl mb-3">🏥</p>
          <p class="text-sm font-medium text-slate-700 mb-1">진료 이력이 없어요</p>
          <p class="text-xs text-slate-500">병원 방문 후 기록을 추가해 보세요</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="visit in medicalStore.visits"
            :key="visit.id"
            class="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <BaseBadge :color="visitTypeColor(visit.visit_type)" size="sm">{{ visitTypeLabel(visit.visit_type) }}</BaseBadge>
                <p class="text-xs text-slate-400">{{ formatDate(visit.visit_date) }}</p>
              </div>
              <p v-if="visit.cost" class="text-xs font-semibold text-slate-600">{{ visit.cost.toLocaleString() }}원</p>
            </div>

            <div class="flex items-center gap-2 mb-2">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p class="text-xs font-semibold text-slate-700">{{ visit.hospital_name }}</p>
              <span v-if="visit.vet_name" class="text-xs text-slate-400">· {{ visit.vet_name }}</span>
            </div>

            <p class="text-sm font-bold text-slate-900 mb-1">{{ visit.diagnosis }}</p>
            <p class="text-xs text-slate-500">주증상: {{ visit.chief_complaint }}</p>

            <div v-if="visit.treatment_notes" class="mt-2.5 p-2.5 bg-slate-50 rounded-lg">
              <p class="text-[11px] text-slate-500 leading-relaxed">{{ visit.treatment_notes }}</p>
            </div>

            <div v-if="visit.follow_up_date" class="flex items-center gap-1.5 mt-2.5">
              <svg class="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-[11px] text-primary-600 font-medium">재내원 예정: {{ formatDate(visit.follow_up_date) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 처방 이력 탭 ===== -->
      <div v-show="activeTab === 'prescriptions'" class="px-4 pt-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-slate-900">약 처방 이력</h2>
          <p class="text-xs text-slate-400">총 {{ medicalStore.prescriptions.length }}건</p>
        </div>

        <div v-if="medicalStore.isLoading" class="flex justify-center py-12">
          <svg class="w-7 h-7 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div v-else-if="medicalStore.prescriptions.length === 0" class="text-center py-12">
          <p class="text-3xl mb-3">💊</p>
          <p class="text-sm font-medium text-slate-700 mb-1">처방 이력이 없어요</p>
          <p class="text-xs text-slate-500">처방 받은 약 정보를 기록해 보세요</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="rx in medicalStore.prescriptions"
            :key="rx.id"
            class="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-1.5">
                <span class="text-base">💊</span>
                <p class="font-bold text-slate-900 text-sm">{{ rx.drug_name }}</p>
              </div>
              <p class="text-xs text-slate-400 shrink-0 ml-2">{{ formatDate(rx.prescribed_date) }}</p>
            </div>

            <div class="grid grid-cols-3 gap-2 mb-3">
              <div class="bg-primary-50 rounded-lg p-2 text-center">
                <p class="text-[10px] text-primary-400 mb-0.5">용량</p>
                <p class="text-xs font-bold text-primary-700">{{ rx.dosage }}</p>
              </div>
              <div class="bg-primary-50 rounded-lg p-2 text-center">
                <p class="text-[10px] text-primary-400 mb-0.5">횟수</p>
                <p class="text-xs font-bold text-primary-700">{{ rx.frequency }}</p>
              </div>
              <div class="bg-primary-50 rounded-lg p-2 text-center">
                <p class="text-[10px] text-primary-400 mb-0.5">기간</p>
                <p class="text-xs font-bold text-primary-700">{{ rx.duration_days }}일</p>
              </div>
            </div>

            <p v-if="rx.purpose" class="text-xs text-slate-500 mb-1.5">목적: {{ rx.purpose }}</p>

            <div class="flex items-center gap-2 text-xs text-slate-400">
              <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {{ rx.hospital_name }}{{ rx.vet_name ? ` · ${rx.vet_name}` : '' }}
            </div>

            <div v-if="rx.notes" class="mt-2.5 p-2.5 bg-warning-50 rounded-lg border border-warning-100">
              <p class="text-[11px] text-warning-700 leading-relaxed">⚠️ {{ rx.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 접종 이력 탭 ===== -->
      <div v-show="activeTab === 'vaccinations'" class="px-4 pt-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-slate-900">접종 이력</h2>
          <p class="text-xs text-slate-400">총 {{ medicalStore.vaccinations.length }}건</p>
        </div>

        <div v-if="medicalStore.isLoading" class="flex justify-center py-12">
          <svg class="w-7 h-7 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <div v-else-if="medicalStore.vaccinations.length === 0" class="text-center py-12">
          <p class="text-3xl mb-3">💉</p>
          <p class="text-sm font-medium text-slate-700 mb-1">접종 이력이 없어요</p>
          <p class="text-xs text-slate-500">예방 접종 이력을 기록해 보세요</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <!-- 다음 접종 예정 알림 -->
          <div v-if="upcomingVaccinations.length > 0" class="p-4 bg-secondary-50 rounded-xl border border-secondary-200">
            <p class="text-xs font-bold text-secondary-700 mb-2">📅 다음 접종 예정</p>
            <div class="flex flex-col gap-1.5">
              <div v-for="vac in upcomingVaccinations" :key="vac.id" class="flex items-center justify-between">
                <p class="text-xs text-secondary-800 font-medium">{{ vac.vaccine_name }}</p>
                <p class="text-xs text-secondary-600">{{ formatDate(vac.next_due_date!) }}</p>
              </div>
            </div>
          </div>

          <div
            v-for="vac in medicalStore.vaccinations"
            :key="vac.id"
            class="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <BaseBadge :color="vacTypeColor(vac.vaccination_type)" size="sm">{{ vacTypeLabel(vac.vaccination_type) }}</BaseBadge>
                <p class="text-xs text-slate-400">{{ formatDate(vac.vaccinated_date) }}</p>
              </div>
            </div>

            <p class="font-bold text-slate-900 text-sm mb-2">💉 {{ vac.vaccine_name }}</p>

            <div class="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {{ vac.hospital_name }}{{ vac.vet_name ? ` · ${vac.vet_name}` : '' }}
            </div>

            <div class="flex flex-wrap gap-3 text-xs text-slate-400">
              <span v-if="vac.manufacturer">제조사: {{ vac.manufacturer }}</span>
              <span v-if="vac.batch_number">배치번호: {{ vac.batch_number }}</span>
            </div>

            <div v-if="vac.next_due_date" class="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100">
              <svg class="w-3.5 h-3.5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-[11px] text-primary-600 font-medium">다음 접종: {{ formatDate(vac.next_due_date) }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 탭별 FAB 버튼 -->
    <div class="fixed bottom-20 right-4 z-30">
      <!-- 스캔 탭: 새로운 스캔 -->
      <button
        v-if="activeTab === 'scan'"
        class="flex items-center gap-2 bg-primary-600 text-white px-5 py-3.5 rounded-2xl shadow-lg hover:bg-primary-700 active:bg-primary-800 transition-all font-semibold text-sm"
        @click="startNewScan"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        새로운 건강 스캔
      </button>

      <!-- 진료 탭: 진료 기록 추가 -->
      <button
        v-else-if="activeTab === 'visits'"
        class="flex items-center gap-2 bg-primary-600 text-white px-5 py-3.5 rounded-2xl shadow-lg hover:bg-primary-700 active:bg-primary-800 transition-all font-semibold text-sm"
        @click="showAddVisit = true"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        진료 기록 추가
      </button>

      <!-- 처방 탭: 처방 기록 추가 -->
      <button
        v-else-if="activeTab === 'prescriptions'"
        class="flex items-center gap-2 bg-primary-600 text-white px-5 py-3.5 rounded-2xl shadow-lg hover:bg-primary-700 active:bg-primary-800 transition-all font-semibold text-sm"
        @click="showAddPrescription = true"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        처방 기록 추가
      </button>

      <!-- 접종 탭: 접종 기록 추가 -->
      <button
        v-else-if="activeTab === 'vaccinations'"
        class="flex items-center gap-2 bg-primary-600 text-white px-5 py-3.5 rounded-2xl shadow-lg hover:bg-primary-700 active:bg-primary-800 transition-all font-semibold text-sm"
        @click="showAddVaccination = true"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        접종 기록 추가
      </button>
    </div>
  </div>

  <!-- 로딩 -->
  <div v-else class="flex items-center justify-center min-h-screen">
    <svg class="w-8 h-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>

  <!-- 반려동물 정보 수정 모달 -->
  <BaseModal v-model="showEditPet" title="기본 정보 수정">
    <div class="flex flex-col gap-4">
      <BaseInput v-model="editForm.name" label="이름" placeholder="반려동물 이름" :error="editErrors.name" />
      <BaseInput v-model="editForm.birth_date" label="생년월일" type="date" />
      <BaseInput v-model="editWeightStr" label="체중 (kg)" type="number" placeholder="예) 3.2" />
    </div>
    <template #footer>
      <BaseButton variant="outline" @click="showEditPet = false">취소</BaseButton>
      <BaseButton :loading="isSavingPet" @click="savePetInfo">저장</BaseButton>
    </template>
  </BaseModal>

  <!-- 진료 기록 추가 모달 -->
  <AddVisitModal v-model="showAddVisit" @submit="handleAddVisit" />

  <!-- 처방 기록 추가 모달 -->
  <AddPrescriptionModal v-model="showAddPrescription" @submit="handleAddPrescription" />

  <!-- 접종 기록 추가 모달 -->
  <AddVaccinationModal v-model="showAddVaccination" @submit="handleAddVaccination" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePetStore } from '@/stores/petStore'
import { useScanStore } from '@/stores/scanStore'
import { useMedicalStore } from '@/stores/medicalStore'
import type {
  HealthScan, BCSScore, MedicalVisitType, VaccinationType,
  CreateMedicalVisitRequest, CreatePrescriptionRequest, CreateVaccinationRequest,
} from '@/types'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AddVisitModal from '@/components/medical/AddVisitModal.vue'
import AddPrescriptionModal from '@/components/medical/AddPrescriptionModal.vue'
import AddVaccinationModal from '@/components/medical/AddVaccinationModal.vue'

const route = useRoute()
const router = useRouter()
const petStore = usePetStore()
const scanStore = useScanStore()
const medicalStore = useMedicalStore()

const petId = route.params.id as string
const pet = computed(() => petStore.pets.find(p => p.id === petId) ?? null)
const scans = ref<HealthScan[]>([])

type TabId = 'scan' | 'visits' | 'prescriptions' | 'vaccinations'
const activeTab = ref<TabId>('scan')

const tabs: { id: TabId; label: string; emoji: string }[] = [
  { id: 'scan', label: '건강 스캔', emoji: '🔬' },
  { id: 'visits', label: '진료 이력', emoji: '🏥' },
  { id: 'prescriptions', label: '처방 이력', emoji: '💊' },
  { id: 'vaccinations', label: '접종 이력', emoji: '💉' },
]

// ---- 모달 상태 ----
const showEditPet = ref(false)
const showAddVisit = ref(false)
const showAddPrescription = ref(false)
const showAddVaccination = ref(false)
const isSavingPet = ref(false)

const editForm = reactive({ name: '', birth_date: '' })
const editWeightStr = ref('')
const editErrors = reactive({ name: '' })

function openEditModal(): void {
  if (!pet.value) return
  editForm.name = pet.value.name
  editForm.birth_date = pet.value.birth_date
  editWeightStr.value = pet.value.weight?.toString() ?? ''
  editErrors.name = ''
  showEditPet.value = true
}

async function savePetInfo(): Promise<void> {
  editErrors.name = editForm.name.trim() ? '' : '이름을 입력해 주세요'
  if (editErrors.name) return

  isSavingPet.value = true
  try {
    await petStore.updatePet(petId, {
      name: editForm.name.trim(),
      birth_date: editForm.birth_date || undefined,
      weight: editWeightStr.value ? parseFloat(editWeightStr.value) : undefined,
    })
    showEditPet.value = false
  } finally {
    isSavingPet.value = false
  }
}

// ---- 기본 정보 ----

const speciesLabel = computed(() => {
  const map = { DOG: '강아지', CAT: '고양이', OTHER: '기타' }
  return pet.value ? map[pet.value.species] : ''
})

const genderLabel = computed(() => pet.value?.gender === 'MALE' ? '수컷' : '암컷')

const ageText = computed(() => {
  if (!pet.value) return ''
  const birth = new Date(pet.value.birth_date)
  const months = (new Date().getFullYear() - birth.getFullYear()) * 12 + (new Date().getMonth() - birth.getMonth())
  return months < 12 ? `${months}개월` : `${Math.floor(months / 12)}살`
})

const petInfoItems = computed(() => [
  { label: '나이', value: ageText.value },
  { label: '체중', value: pet.value?.weight ? `${pet.value.weight}kg` : '-' },
  { label: '스캔 횟수', value: `${scans.value.length}회` },
])

// ---- 스캔 관련 ----

const recentScansForChart = computed(() => scans.value.slice(0, 6).reverse())

function bcsLabel(score: BCSScore | number): string {
  if (score <= 3) return '저체중'
  if (score <= 5) return '이상적'
  if (score <= 7) return '과체중'
  return '비만'
}

function getBCSBadgeColor(score: BCSScore | number): 'success' | 'warning' | 'error' {
  if (score >= 4 && score <= 5) return 'success'
  if (score === 3 || (score >= 6 && score <= 7)) return 'warning'
  return 'error'
}

function getBCSBarColor(score: BCSScore | number): string {
  if (score <= 3) return 'bg-warning-300'
  if (score <= 5) return 'bg-secondary-400'
  if (score <= 7) return 'bg-warning-400'
  return 'bg-error-400'
}

// ---- 진료 이력 관련 ----

function visitTypeLabel(type: MedicalVisitType): string {
  const map: Record<MedicalVisitType, string> = {
    CHECK_UP: '검진', TREATMENT: '치료', SURGERY: '수술', EMERGENCY: '응급',
  }
  return map[type]
}

function visitTypeColor(type: MedicalVisitType): 'success' | 'primary' | 'error' | 'warning' {
  const map: Record<MedicalVisitType, 'success' | 'primary' | 'error' | 'warning'> = {
    CHECK_UP: 'success', TREATMENT: 'primary', SURGERY: 'warning', EMERGENCY: 'error',
  }
  return map[type]
}

// ---- 접종 이력 관련 ----

function vacTypeLabel(type: VaccinationType): string {
  const map: Record<VaccinationType, string> = {
    CORE: '핵심 접종', NON_CORE: '선택 접종', RABIES: '광견병',
  }
  return map[type]
}

function vacTypeColor(type: VaccinationType): 'primary' | 'secondary' | 'error' {
  const map: Record<VaccinationType, 'primary' | 'secondary' | 'error'> = {
    CORE: 'primary', NON_CORE: 'secondary', RABIES: 'error',
  }
  return map[type]
}

const upcomingVaccinations = computed(() =>
  medicalStore.vaccinations.filter(v => {
    if (!v.next_due_date) return false
    return new Date(v.next_due_date) >= new Date()
  })
)

// ---- 날짜 포맷 ----

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateStr))
}

function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(new Date(dateStr))
}

// ---- 의료 기록 추가 ----

async function handleAddVisit(data: CreateMedicalVisitRequest): Promise<void> {
  await medicalStore.addVisit(petId, data)
}

async function handleAddPrescription(data: CreatePrescriptionRequest): Promise<void> {
  await medicalStore.addPrescription(petId, data)
}

async function handleAddVaccination(data: CreateVaccinationRequest): Promise<void> {
  await medicalStore.addVaccination(petId, data)
}

// ---- 액션 ----

function startNewScan(): void {
  petStore.selectPet(petId)
  router.push('/scan')
}

onMounted(async () => {
  if (!pet.value) {
    await petStore.fetchPetById(petId)
  }
  scans.value = await scanStore.fetchScansByPetId(petId)
  await medicalStore.fetchAllMedicalRecords(petId)
})
</script>
