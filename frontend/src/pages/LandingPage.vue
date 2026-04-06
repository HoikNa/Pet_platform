<template>
  <div class="min-h-screen bg-white">
    <!-- 히어로 섹션 -->
    <section class="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
      <!-- 배경 장식 -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-secondary-400 rounded-full blur-3xl" />
      </div>

      <div class="relative max-w-mobile mx-auto px-6 pt-20 pb-16">
        <!-- 배지 -->
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
          <span class="w-2 h-2 bg-secondary-400 rounded-full animate-pulse" />
          정부 공인 동물등록 대행 서비스
        </div>

        <!-- 메인 헤딩 -->
        <h1 class="text-4xl font-black leading-tight mb-4">
          반려동물의<br />
          <span class="text-secondary-300">디지털 신분증</span>과<br />
          건강 주권을 확립합니다
        </h1>

        <p class="text-primary-200 text-base leading-relaxed mb-10">
          스마트폰 비접촉 AI 생체 인식으로 등록부터 평생 건강 관리까지.<br />
          Pet-ID AI 플랫폼이 함께합니다.
        </p>

        <!-- CTA 버튼 -->
        <div class="flex flex-col gap-3">
          <RouterLink to="/login">
            <BaseButton variant="solid" color="secondary" size="lg" fullWidth>
              <template #icon-left>
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/>
                </svg>
              </template>
              카카오로 3초 만에 시작하기
            </BaseButton>
          </RouterLink>
          <RouterLink to="/login">
            <BaseButton variant="outline" size="lg" fullWidth class="!border-white/30 !text-white hover:!bg-white/10">
              이메일로 로그인
            </BaseButton>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 핵심 지표 -->
    <section class="bg-white py-10 border-b border-slate-100">
      <div class="max-w-mobile mx-auto px-6">
        <div class="grid grid-cols-3 gap-4">
          <div v-for="stat in keyStats" :key="stat.label" class="text-center">
            <p class="text-2xl font-black text-primary-700">{{ stat.value }}</p>
            <p class="text-[11px] text-slate-500 mt-0.5 leading-tight">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 탭 네비게이션 (Vision / Solution / Growth) -->
    <section class="max-w-mobile mx-auto">
      <!-- 탭 헤더 -->
      <div class="flex border-b border-slate-200 bg-white sticky top-0 z-10">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'flex-1 py-3.5 text-sm font-semibold transition-colors border-b-2',
            activeTab === tab.id
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          ]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Vision 탭 -->
      <div v-show="activeTab === 'vision'" class="px-6 py-8">
        <h2 class="text-2xl font-black text-slate-900 mb-2">비전 & 미션</h2>
        <p class="text-slate-500 text-sm mb-8">신원 확인에서 생애주기 관리까지</p>

        <div class="flex flex-col gap-5">
          <div
            v-for="item in visionItems"
            :key="item.title"
            class="flex gap-4 p-5 bg-primary-50 rounded-2xl border border-primary-100"
          >
            <div class="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
              <span class="text-white text-lg">{{ item.emoji }}</span>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 mb-1">{{ item.title }}</h3>
              <p class="text-sm text-slate-600 leading-relaxed">{{ item.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 2028 목표 -->
        <div class="mt-8 p-5 bg-gradient-to-br from-primary-900 to-primary-700 rounded-2xl text-white">
          <p class="text-sm text-primary-300 mb-3">2028년 핵심 목표</p>
          <div class="flex flex-col gap-3">
            <div v-for="goal in goals2028" :key="goal.label" class="flex items-center justify-between">
              <p class="text-sm text-primary-200">{{ goal.label }}</p>
              <p class="font-bold text-secondary-300">{{ goal.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Solution 탭 -->
      <div v-show="activeTab === 'solution'" class="px-6 py-8">
        <h2 class="text-2xl font-black text-slate-900 mb-2">솔루션</h2>
        <p class="text-slate-500 text-sm mb-8">3가지 핵심 기술로 기존 시장의 문제를 해결합니다</p>

        <div class="flex flex-col gap-5">
          <div
            v-for="sol in solutions"
            :key="sol.title"
            class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm"
          >
            <div class="flex items-center gap-3 mb-3">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', sol.iconBg]">
                <span class="text-xl">{{ sol.emoji }}</span>
              </div>
              <div>
                <BaseBadge :color="sol.badgeColor" size="sm">{{ sol.badge }}</BaseBadge>
                <h3 class="font-bold text-slate-900 mt-1">{{ sol.title }}</h3>
              </div>
            </div>
            <p class="text-sm text-slate-600 leading-relaxed">{{ sol.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Growth Strategy 탭 -->
      <div v-show="activeTab === 'growth'" class="px-6 py-8">
        <h2 class="text-2xl font-black text-slate-900 mb-2">성장 전략</h2>
        <p class="text-slate-500 text-sm mb-8">2단계 로드맵으로 시장을 선도합니다</p>

        <div class="flex flex-col gap-5">
          <div
            v-for="phase in growthPhases"
            :key="phase.phase"
            class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm"
          >
            <div class="flex items-center gap-3 mb-3">
              <div :class="['px-2.5 py-1 rounded-lg text-xs font-bold', phase.badgeClass]">
                {{ phase.phase }}
              </div>
              <p class="text-xs text-slate-500">{{ phase.period }}</p>
            </div>
            <h3 class="font-bold text-slate-900 mb-2">{{ phase.title }}</h3>
            <ul class="flex flex-col gap-1.5">
              <li v-for="item in phase.items" :key="item" class="flex items-start gap-2 text-sm text-slate-600">
                <svg class="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>

        <!-- B2B Contact CTA -->
        <div class="mt-8 p-5 bg-secondary-50 rounded-2xl border border-secondary-200 text-center">
          <h3 class="font-bold text-secondary-900 mb-1">B2B / B2G 파트너십 문의</h3>
          <p class="text-sm text-secondary-700 mb-4">보험사, 병원, 지자체 관계자를 위한 Contact IR</p>
          <BaseButton color="secondary" size="md">
            파트너십 문의하기
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- 하단 여백 -->
    <div class="h-16" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const activeTab = ref<'vision' | 'solution' | 'growth'>('vision')

const tabs = [
  { id: 'vision' as const, label: 'Vision' },
  { id: 'solution' as const, label: 'Solution' },
  { id: 'growth' as const, label: 'Growth' },
]

const keyStats = [
  { value: '30%', label: '2028 등록 시장 점유율 목표' },
  { value: '20%', label: '보험 손해율 절감 목표' },
  { value: '5,000+', label: '월 신규 가입자 파이프라인' },
]

const visionItems = [
  {
    emoji: '🔬',
    title: 'Zero-Cost Registration',
    desc: '하드웨어 비용 없는 스마트폰 비접촉 생체 인식(안면/비문) 기술로 정부 공인 등록을 대행합니다.',
  },
  {
    emoji: '🧠',
    title: 'AI Health Scan',
    desc: '등록과 동시에 비만도(BCS) 및 노화 지표를 추출하는 AI 엔진으로 객관적인 건강 리포트를 제공합니다.',
  },
  {
    emoji: '🔗',
    title: 'Data-Driven Ecosystem',
    desc: '표준화된 API 연동을 통해 보험사 및 병원에 건강 신용 등급 데이터를 제공하여 생태계를 혁신합니다.',
  },
]

const goals2028 = [
  { label: '국내 등록 동물 시장 점유율', value: '30%' },
  { label: '펫보험 손해율 개선 기여', value: '20% ↓' },
  { label: '월 신규 가입자 파이프라인', value: '5,000+' },
]

const solutions = [
  {
    emoji: '📸',
    title: 'AI 비접촉 생체 인식',
    desc: '스마트폰 카메라를 통한 안면 및 비문 정보 추출로 디지털 신분증을 발급합니다. 실시간 가이드로 데이터 품질을 보장합니다.',
    badge: 'Zero-Cost',
    badgeColor: 'primary' as const,
    iconBg: 'bg-primary-50',
  },
  {
    emoji: '⚖️',
    title: 'BCS 비만도 자동 측정',
    desc: '측면/상면 촬영 이미지 기반 9단계 BCS(Body Condition Score) 판정으로 객관적인 체형 상태를 제공합니다.',
    badge: 'AI Health',
    badgeColor: 'secondary' as const,
    iconBg: 'bg-secondary-50',
  },
  {
    emoji: '🚶',
    title: '보행 분석 & 노화 지표',
    desc: '비디오 기반 AI 추론(Gait Analysis)으로 보행 패턴을 수치화하고, 안구 혼탁도 분석으로 노화 지표를 추출합니다.',
    badge: 'Gait AI',
    badgeColor: 'warning' as const,
    iconBg: 'bg-warning-50',
  },
]

const growthPhases = [
  {
    phase: 'Phase 1',
    period: 'Year 1-2',
    title: '공격적 확장 및 기반 구축',
    badgeClass: 'bg-primary-100 text-primary-700',
    items: [
      '펫샵 및 경매장: 분양 계약서 연계 등록 의무화 (Target: 3,500/mo)',
      '동물 보호소: 유기 동물 입양 시 등록 대행 공식 지정 (Target: 1,500/mo)',
      'KPI: M/S 15% 달성, 정부 표준(KS) 선점',
    ],
  },
  {
    phase: 'Phase 2',
    period: 'Year 3+',
    title: '수익 실현 및 글로벌 진출',
    badgeClass: 'bg-secondary-100 text-secondary-700',
    items: [
      'B2B API 연동 본격화 및 데이터 판매 개시',
      'K-펫테크 표준 해외 수출',
      'KPI: EBITDA 흑자 전환, 보험사 손해율 개선 기여도 검증',
    ],
  },
]
</script>
