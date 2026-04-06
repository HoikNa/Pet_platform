<template>
  <div :class="cardClasses" v-bind="$attrs">
    <!-- 헤더 슬롯 -->
    <div v-if="$slots.header" :class="['px-5 py-4 border-b border-slate-100', headerClass]">
      <slot name="header" />
    </div>

    <!-- 본문 슬롯 -->
    <div :class="['p-5', bodyClass]">
      <slot />
    </div>

    <!-- 푸터 슬롯 -->
    <div
      v-if="$slots.footer"
      :class="['px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl', footerClass]"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 그림자 깊이 */
  elevation?: 'none' | 'sm' | 'md' | 'lg'
  /** 클릭 가능 여부 (hover 효과) */
  clickable?: boolean
  /** 패딩 없이 */
  noPadding?: boolean
  /** 추가 헤더 클래스 */
  headerClass?: string
  /** 추가 본문 클래스 */
  bodyClass?: string
  /** 추가 푸터 클래스 */
  footerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  elevation: 'sm',
  clickable: false,
  noPadding: false,
})

const elevationMap = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
}

const cardClasses = computed(() => [
  'bg-white rounded-xl border border-slate-100 overflow-hidden',
  elevationMap[props.elevation],
  props.clickable
    ? 'cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
    : '',
  props.noPadding ? '' : '',
])
</script>
