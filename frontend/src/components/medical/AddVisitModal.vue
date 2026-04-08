<template>
  <BaseModal v-model="open" title="진료 기록 추가" size="lg">
    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <div class="grid grid-cols-2 gap-3">
        <BaseInput v-model="form.visit_date" label="진료일" type="date" required :error="errors.visit_date" />
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">진료 유형 <span class="text-error-500">*</span></label>
          <select
            v-model="form.visit_type"
            class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
          >
            <option value="CHECK_UP">검진</option>
            <option value="TREATMENT">치료</option>
            <option value="SURGERY">수술</option>
            <option value="EMERGENCY">응급</option>
          </select>
        </div>
      </div>

      <BaseInput v-model="form.hospital_name" label="병원명" placeholder="예) 행복 동물병원" required :error="errors.hospital_name" />
      <BaseInput v-model="form.vet_name" label="수의사명" placeholder="예) 이수의 원장 (선택)" />
      <BaseInput v-model="form.chief_complaint" label="주증상" placeholder="예) 귀 긁음, 식욕 감소" required :error="errors.chief_complaint" />
      <BaseInput v-model="form.diagnosis" label="진단명" placeholder="예) 외이염 (세균성)" required :error="errors.diagnosis" />

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-slate-700">처치 내용</label>
        <textarea
          v-model="form.treatment_notes"
          rows="2"
          placeholder="처방 및 치료 내용을 입력하세요"
          class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <BaseInput v-model="form.follow_up_date" label="재내원 예정일" type="date" />
        <BaseInput v-model="costStr" label="진료비 (원)" type="number" placeholder="예) 45000" />
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
import type { MedicalVisitType, CreateMedicalVisitRequest } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: CreateMedicalVisitRequest]
}>()

const open = ref(props.modelValue)
watch(() => props.modelValue, v => { open.value = v })
watch(open, v => emit('update:modelValue', v))

const isSubmitting = ref(false)
const costStr = ref('')

const form = reactive<Omit<CreateMedicalVisitRequest, 'cost'> & { visit_type: MedicalVisitType }>({
  visit_date: new Date().toISOString().slice(0, 10),
  hospital_name: '',
  vet_name: '',
  visit_type: 'CHECK_UP',
  chief_complaint: '',
  diagnosis: '',
  treatment_notes: '',
  follow_up_date: '',
})

const errors = reactive({ visit_date: '', hospital_name: '', chief_complaint: '', diagnosis: '' })

function validate(): boolean {
  errors.visit_date = form.visit_date ? '' : '진료일을 입력해 주세요'
  errors.hospital_name = form.hospital_name ? '' : '병원명을 입력해 주세요'
  errors.chief_complaint = form.chief_complaint ? '' : '주증상을 입력해 주세요'
  errors.diagnosis = form.diagnosis ? '' : '진단명을 입력해 주세요'
  return !errors.visit_date && !errors.hospital_name && !errors.chief_complaint && !errors.diagnosis
}

async function onSubmit(): Promise<void> {
  if (!validate()) return
  isSubmitting.value = true
  try {
    emit('submit', {
      ...form,
      vet_name: form.vet_name || undefined,
      treatment_notes: form.treatment_notes || undefined,
      follow_up_date: form.follow_up_date || undefined,
      cost: costStr.value ? parseInt(costStr.value) : undefined,
    })
    open.value = false
  } finally {
    isSubmitting.value = false
  }
}
</script>
