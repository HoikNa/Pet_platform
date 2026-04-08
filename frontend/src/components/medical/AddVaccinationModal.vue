<template>
  <BaseModal v-model="open" title="접종 기록 추가" size="lg">
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-3">
        <BaseInput v-model="form.vaccinated_date" label="접종일" type="date" required :error="errors.vaccinated_date" />
        <BaseInput v-model="form.next_due_date" label="다음 접종 예정일" type="date" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <BaseInput v-model="form.vaccine_name" label="백신명" placeholder="예) DHPPL" required :error="errors.vaccine_name" />
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">접종 유형 <span class="text-error-500">*</span></label>
          <select
            v-model="form.vaccination_type"
            class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
          >
            <option value="CORE">핵심 접종</option>
            <option value="NON_CORE">선택 접종</option>
            <option value="RABIES">광견병</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <BaseInput v-model="form.hospital_name" label="병원명" placeholder="예) 행복 동물병원" required :error="errors.hospital_name" />
        <BaseInput v-model="form.vet_name" label="수의사명" placeholder="예) 이수의 원장 (선택)" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <BaseInput v-model="form.manufacturer" label="제조사" placeholder="예) 메리알 (선택)" />
        <BaseInput v-model="form.batch_number" label="배치 번호" placeholder="예) BN-2024-001 (선택)" />
      </div>
    </form>

    <template #footer>
      <BaseButton variant="outline" @click="open = false">취소</BaseButton>
      <BaseButton :loading="isSubmitting" @click="onSubmit">저장</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { VaccinationType, CreateVaccinationRequest } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: CreateVaccinationRequest]
}>()

const open = ref(props.modelValue)
watch(() => props.modelValue, v => { open.value = v })
watch(open, v => emit('update:modelValue', v))

const isSubmitting = ref(false)

const form = reactive<{
  vaccinated_date: string
  next_due_date: string
  vaccine_name: string
  vaccination_type: VaccinationType
  hospital_name: string
  vet_name: string
  manufacturer: string
  batch_number: string
}>({
  vaccinated_date: new Date().toISOString().slice(0, 10),
  next_due_date: '',
  vaccine_name: '',
  vaccination_type: 'CORE',
  hospital_name: '',
  vet_name: '',
  manufacturer: '',
  batch_number: '',
})

const errors = reactive({ vaccinated_date: '', vaccine_name: '', hospital_name: '' })

function validate(): boolean {
  errors.vaccinated_date = form.vaccinated_date ? '' : '접종일을 입력해 주세요'
  errors.vaccine_name = form.vaccine_name ? '' : '백신명을 입력해 주세요'
  errors.hospital_name = form.hospital_name ? '' : '병원명을 입력해 주세요'
  return !errors.vaccinated_date && !errors.vaccine_name && !errors.hospital_name
}

async function onSubmit(): Promise<void> {
  if (!validate()) return
  isSubmitting.value = true
  try {
    emit('submit', {
      vaccine_name: form.vaccine_name,
      vaccination_type: form.vaccination_type,
      vaccinated_date: form.vaccinated_date,
      next_due_date: form.next_due_date || undefined,
      hospital_name: form.hospital_name,
      vet_name: form.vet_name || undefined,
      batch_number: form.batch_number || undefined,
      manufacturer: form.manufacturer || undefined,
    })
    open.value = false
  } finally {
    isSubmitting.value = false
  }
}
</script>
