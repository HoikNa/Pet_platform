// ============================================================
// Composable - 오디오 녹음 (useAudioRecorder)
// MediaRecorder API 래핑, 마이크 권한 요청, 녹음 제어
// VOICE 감정 분석 스캔에 사용
// ============================================================

import { ref } from 'vue'

export function useAudioRecorder() {
  const isRecording = ref(false)
  const isLoading = ref(false)
  const hasPermission = ref<boolean | null>(null)
  const duration = ref(0) // 녹음 경과 시간 (초)
  const stream = ref<MediaStream | null>(null)

  let mediaRecorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let durationTimer: ReturnType<typeof setInterval> | null = null

  /**
   * 마이크 권한 요청 및 스트림 시작
   */
  async function startMicrophone(): Promise<MediaStream | null> {
    isLoading.value = true
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.value = s
      hasPermission.value = true
      return s
    } catch {
      hasPermission.value = false
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 녹음 시작
   */
  function startRecording(): void {
    if (!stream.value || isRecording.value) return
    chunks = []
    duration.value = 0

    const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
    mediaRecorder = new MediaRecorder(stream.value, { mimeType })

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    mediaRecorder.start(100)
    isRecording.value = true

    durationTimer = setInterval(() => duration.value++, 1000)
  }

  /**
   * 녹음 중지 → Blob 반환
   */
  async function stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!mediaRecorder) {
        resolve(new Blob())
        return
      }
      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder?.mimeType ?? 'audio/webm'
        const blob = new Blob(chunks, { type: mimeType })
        resolve(blob)
      }
      mediaRecorder.stop()
      isRecording.value = false
      if (durationTimer) {
        clearInterval(durationTimer)
        durationTimer = null
      }
    })
  }

  /**
   * 마이크 스트림 해제
   */
  function stopMicrophone(): void {
    stream.value?.getTracks().forEach(t => t.stop())
    stream.value = null
    isRecording.value = false
    if (durationTimer) {
      clearInterval(durationTimer)
      durationTimer = null
    }
  }

  return {
    isRecording,
    isLoading,
    hasPermission,
    duration,
    stream,
    startMicrophone,
    startRecording,
    stopRecording,
    stopMicrophone,
  }
}
