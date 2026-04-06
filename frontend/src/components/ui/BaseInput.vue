<template>
  <div :class="['flex flex-col gap-1.5', fullWidth ? 'w-full' : '']">
    <!-- 레이블 -->
    <label v-if="label" :for="inputId" class="text-sm font-medium text-slate-700">
      {{ label }}
      <span v-if="required" class="text-error-500 ml-0.5">*</span>
    </label>

    <!-- 입력 래퍼 -->
    <div class="relative">
      <!-- 앞 아이콘 -->
      <div
        v-if="$slots['icon-left']"
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400"
      >
        <slot name="icon-left" />
      </div>

      <!-- Input / Textarea -->
      <component
        :is="multiline ? 'textarea' : 'input'"
        :id="inputId"
        :type="!multiline ? type : undefined"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="multiline ? rows : undefined"
        :class="inputClasses"
        v-bind="$attrs"
        @input="onInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <!-- 뒤 아이콘 -->
      <div
        v-if="$slots['icon-right']"
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400"
      >
        <slot name="icon-right" />
      </div>
    </div>

    <!-- 도움말 / 오류 메시지 -->
    <p v-if="error" class="text-xs text-error-600 flex items-center gap-1">
      <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  fullWidth?: boolean
  multiline?: boolean
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  fullWidth: true,
  multiline: false,
  rows: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputId = useId()

const inputClasses = computed(() => [
  'block w-full rounded-lg border text-sm transition-all duration-200',
  'placeholder:text-slate-400 text-slate-900',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  // 앞 아이콘 패딩
  '$slots["icon-left"] ? "pl-10" : "pl-3"',
  '$slots["icon-right"] ? "pr-10" : "pr-3"',
  'py-2.5',
  // 에러 / 일반 상태
  props.error
    ? 'border-error-400 focus:border-error-500 focus:ring-error-200 bg-error-50'
    : 'border-slate-300 focus:border-primary-500 focus:ring-primary-200 bg-white',
  // 비활성화
  props.disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : '',
  // Textarea 전용
  props.multiline ? 'resize-none' : '',
])

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>
