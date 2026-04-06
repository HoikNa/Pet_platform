<template>
  <div class="flex flex-col gap-4">
    <!-- 테이블 컨테이너 -->
    <div class="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <!-- 헤더 -->
        <thead class="bg-slate-50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap',
                col.sortable ? 'cursor-pointer select-none hover:text-slate-700' : '',
                col.class ?? '',
              ]"
              @click="col.sortable ? toggleSort(col.key) : undefined"
            >
              <div class="flex items-center gap-1.5">
                {{ col.label }}
                <span v-if="col.sortable" class="text-slate-400">
                  <svg
                    v-if="sortKey === col.key && sortDir === 'asc'"
                    class="w-3.5 h-3.5 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 10l5-5 5 5H5z" />
                  </svg>
                  <svg
                    v-else-if="sortKey === col.key && sortDir === 'desc'"
                    class="w-3.5 h-3.5 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M15 10l-5 5-5-5h10z" />
                  </svg>
                  <svg v-else class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5-5 5 5H5zM5 12l5 5 5-5H5z" />
                  </svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- 본문 -->
        <tbody class="bg-white divide-y divide-slate-100">
          <!-- 로딩 상태 -->
          <tr v-if="loading">
            <td :colspan="columns.length" class="text-center py-12">
              <div class="flex flex-col items-center gap-3 text-slate-400">
                <svg class="w-8 h-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p class="text-sm">데이터를 불러오는 중...</p>
              </div>
            </td>
          </tr>

          <!-- 데이터 없음 -->
          <tr v-else-if="!rows.length">
            <td :colspan="columns.length" class="text-center py-12">
              <div class="flex flex-col items-center gap-2 text-slate-400">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p class="text-sm font-medium">{{ emptyMessage }}</p>
              </div>
            </td>
          </tr>

          <!-- 데이터 행 -->
          <tr
            v-else
            v-for="row in rows"
            :key="getRowKey(row)"
            :class="[
              'transition-colors duration-150',
              clickable ? 'cursor-pointer hover:bg-primary-50' : 'hover:bg-slate-50',
            ]"
            @click="clickable && $emit('row-click', row)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="['px-4 py-3.5 text-slate-700', col.class ?? '']"
            >
              <!-- 커스텀 셀 슬롯 -->
              <slot :name="`cell-${col.key}`" :row="row" :value="getNestedValue(row, col.key)">
                {{ getNestedValue(row, col.key) ?? '-' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between text-sm text-slate-600"
    >
      <p>
        총 <span class="font-semibold text-slate-900">{{ totalCount }}</span>건
        ({{ currentPage }} / {{ totalPages }} 페이지)
      </p>

      <div class="flex items-center gap-1">
        <button
          class="px-2 py-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="currentPage <= 1"
          @click="$emit('page-change', currentPage - 1)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          v-for="page in pageNumbers"
          :key="page"
          :class="[
            'min-w-[32px] px-2 py-1 rounded-lg text-sm font-medium transition-colors',
            page === currentPage
              ? 'bg-primary-600 text-white'
              : page === '...'
              ? 'cursor-default text-slate-400'
              : 'hover:bg-slate-100 text-slate-700',
          ]"
          :disabled="page === '...'"
          @click="page !== '...' && $emit('page-change', page as number)"
        >
          {{ page }}
        </button>

        <button
          class="px-2 py-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="currentPage >= totalPages"
          @click="$emit('page-change', currentPage + 1)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  class?: string
}

interface Props {
  columns: TableColumn[]
  rows: Record<string, unknown>[]
  loading?: boolean
  clickable?: boolean
  rowKey?: string
  emptyMessage?: string
  currentPage?: number
  totalPages?: number
  totalCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  clickable: false,
  rowKey: 'id',
  emptyMessage: '데이터가 없습니다.',
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
})

defineEmits<{
  'row-click': [row: Record<string, unknown>]
  'page-change': [page: number]
  'sort-change': [key: string, dir: 'asc' | 'desc']
}>()

// 정렬 상태
const sortKey = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function getRowKey(row: Record<string, unknown>): string {
  return String(row[props.rowKey] ?? Math.random())
}

/** 중첩 키 값 접근 (예: "pet.name") */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}

/** 페이지 번호 목록 (최대 7개, 말줄임 포함) */
const pageNumbers = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const result: (number | '...')[] = [1]
  if (current > 3) result.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) result.push(i)
  if (current < total - 2) result.push('...')
  result.push(total)
  return result
})
</script>
