// ============================================================
// Composable - 카메라 제어 (useCamera)
// MediaRecorder API 래핑, 카메라 권한 요청, 전/후면 전환
// ============================================================

import { ref, onUnmounted } from 'vue'
import { useToast } from './useToast'

export type CameraFacing = 'user' | 'environment'

export function useCamera() {
  const { error: toastError } = useToast()

  // ---- 상태 ----
  const stream = ref<MediaStream | null>(null)
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const isRecording = ref(false)
  const hasPermission = ref<boolean | null>(null)
  const currentFacing = ref<CameraFacing>('environment')
  const isLoading = ref(false)

  let recordedChunks: Blob[] = []

  // ---- 카메라 초기화 ----

  /**
   * 카메라 스트림 시작
   * @param facing 'user'(전면) | 'environment'(후면)
   */
  async function startCamera(facing: CameraFacing = 'environment'): Promise<MediaStream | null> {
    isLoading.value = true
    stopCamera()

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      stream.value = await navigator.mediaDevices.getUserMedia(constraints)
      hasPermission.value = true
      currentFacing.value = facing
      return stream.value
    } catch (err) {
      hasPermission.value = false

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          toastError(
            '카메라 권한이 필요합니다',
            '스캔을 위해 카메라 접근을 허용해 주세요. 브라우저 설정에서 권한을 변경할 수 있습니다.'
          )
        } else if (err.name === 'NotFoundError') {
          toastError('카메라를 찾을 수 없습니다', '기기에 카메라가 연결되어 있는지 확인해 주세요.')
        } else {
          toastError('카메라 오류', err.message)
        }
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 전/후면 카메라 전환
   */
  async function switchCamera(): Promise<void> {
    const newFacing: CameraFacing = currentFacing.value === 'user' ? 'environment' : 'user'
    await startCamera(newFacing)
  }

  /**
   * 카메라 스트림 중지
   */
  function stopCamera(): void {
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop())
      stream.value = null
    }
  }

  // ---- 영상 녹화 ----

  /**
   * 영상 녹화 시작
   */
  function startRecording(): void {
    if (!stream.value) {
      toastError('카메라가 준비되지 않았습니다')
      return
    }

    recordedChunks = []

    const options: MediaRecorderOptions = { mimeType: 'video/webm;codecs=vp9,opus' }

    // 지원 여부 확인 후 폴백
    if (!MediaRecorder.isTypeSupported(options.mimeType ?? '')) {
      options.mimeType = 'video/webm'
    }

    mediaRecorder.value = new MediaRecorder(stream.value, options)

    mediaRecorder.value.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) recordedChunks.push(event.data)
    }

    mediaRecorder.value.start(100)
    isRecording.value = true
  }

  /**
   * 영상 녹화 중지 및 Blob 반환
   */
  function stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder.value || mediaRecorder.value.state === 'inactive') {
        reject(new Error('녹화 중이 아닙니다'))
        return
      }

      mediaRecorder.value.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' })
        isRecording.value = false
        recordedChunks = []
        resolve(blob)
      }

      mediaRecorder.value.stop()
    })
  }

  /**
   * 스틸 이미지 캡처
   */
  function captureImage(videoEl: HTMLVideoElement): string | null {
    const canvas = document.createElement('canvas')
    canvas.width = videoEl.videoWidth
    canvas.height = videoEl.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(videoEl, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  // ---- 정리 ----
  onUnmounted(() => {
    stopCamera()
  })

  return {
    stream,
    isRecording,
    hasPermission,
    currentFacing,
    isLoading,
    startCamera,
    stopCamera,
    switchCamera,
    startRecording,
    stopRecording,
    captureImage,
  }
}
