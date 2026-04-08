<template>
  <BaseModal v-model="open" title="처방 기록 추가" size="lg">
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-3">
        <BaseInput v-model="form.prescribed_date" label="처방일" type="date" required :error="errors.prescribed_date" />
        <BaseInput v-model="form.duration_days" label="투약 기간 (일)" type="number" placeholder="예) 7" required :error="errors.duration_days" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <BaseInput v-model="form.hospital_name" label="병원명" placeholder="예) 행복 동물병원" required :error="errors.hospital_name" />
        <BaseInput v-model="form.vet_name" label="수의사명" placeholder="예) 이수의 원장 (선택)" />
      </div>

      <BaseInput v-model="form.drug_name" label="약품명" placeholder="예) 아목시실린 250mg" required :error="errors.drug_name" />

      <div class="grid grid-cols-2 gap-3">
        <BaseInput v-model="form.dosage" label="1회 용량" placeholder="예) 1정, 5ml" required :error="errors.dosage" />
        <BaseInput v-model="form.frequency" label="투약 횟수" placeholder="예) 하루 2회" required :error="errors.frequency" />
      </div>

      <BaseInput v-model="form.purpose" label="처방 목적" placeholder="예) 외이염 치료" />

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-slate-700">비고</label>
        <textarea
          v-model="form.notes"
          rows="2"
          placeholder="추가 메모 사항을 입력하세요"
          class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
        />
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
import type { CreatePrescriptionRequest } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: CreatePrescriptionRequest]
}>()

const open = ref(props.modelValue)
watch(() => props.modelValue, v => { open.value = v })
watch(open, v => emit('update:modelValue', v))

const isSubmitting = ref(false)

const form = reactive({
  prescribed_date: new Date().toISOString().slice(0, 10),
  hospital_name: '',
  vet_name: '',
  drug_name: '',
  dosage: '',
  frequency: '',
  duration_days: '',
  purpose: '',
  notes: '',
})

const errors = reactive({
  prescribed_date: '',
  hospital_name: '',
  drug_name: '',
  dosage: '',
  frequency: '',
  duration_days: '',
})

function validate(): boolean {
  errors.prescribed_date = form.prescribed_date ? '' : '처방일을 입력해 주세요'
  errors.hospital_name = form.hospital_name ? '' : '병원명을 입력해 주세요'
  errors.drug_name = form.drug_name ? '' : '약품명을 입력해 주세요'
  errors.dosage = form.dosage ? '' : '1회 용량을 입력해 주세요'
  errors.frequency = form.frequency ? '' : '투약 횟수를 입력해 주세요'
  errors.duration_days = form.duration_days ? '' : '투약 기간을 입력해 주세요'
  return !Object.values(errors).some(Boolean)
}

async function onSubmit(): Promise<void> {
  if (!validate()) return
  isSubmitting.value = true
  try {
    const payload: CreatePrescriptionRequest = {
      prescribed_date: form.prescribed_date,
      hospital_name: form.hospital_name,
      drug_name: form.drug_name,
      dosage: form.dosage,
      frequency: form.frequency,
      duration_days: parseInt(form.duration_days),
    }
    if (form.vet_name) payload.vet_name = form.vet_name
    if (form.purpose) payload.purpose = form.purpose
    if (form.notes) payload.notes = form.notes
    emit('submit', payload)
    open.value = false
  } finally {
    isSubmitting.value = false
  }
}
</script>
