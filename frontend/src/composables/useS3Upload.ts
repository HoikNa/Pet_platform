// ============================================================
// Composable - S3 업로드 (useS3Upload)
// Presigned URL 요청 및 S3 바이너리 푸시 흐름 일체화
// 현재: Mock 업로드 시뮬레이션 / 실제 API 연동 시 주석 해제
// ============================================================

import { ref } from 'vue'
// import http from '@/services/http'
// import type { PresignedUrlRequest, PresignedUrlResponse } from '@/types'

export function useS3Upload() {
  const isUploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  /**
   * Presigned URL 발급 요청
   * 실제 API 연동 시 주석 해제
   */
  // async function getPresignedUrl(payload: PresignedUrlRequest): Promise<PresignedUrlResponse> {
  //   const res = await http.post<{ success: true; data: PresignedUrlResponse }>('/media/presigned-url', payload)
  //   return res.data.data
  // }

  /**
   * S3에 Blob/File 직접 업로드 (PUT)
   * 실제 API 연동 시 주석 해제
   */
  // async function uploadToS3(presignedUrl: string, file: Blob | File): Promise<void> {
  //   isUploading.value = true
  //   progress.value = 0
  //   error.value = null
  //   try {
  //     await axios.put(presignedUrl, file, {
  //       headers: { 'Content-Type': file.type },
  //       onUploadProgress: (evt) => {
  //         if (evt.total) progress.value = Math.round((evt.loaded / evt.total) * 100)
  //       },
  //     })
  //   } catch (err) {
  //     error.value = err instanceof Error ? err.message : '업로드 실패'
  //     throw err
  //   } finally {
  //     isUploading.value = false
  //   }
  // }

  /**
   * 전체 업로드 파이프라인 (Mock 버전)
   * 1. Presigned URL 발급
   * 2. S3 직접 PUT 업로드
   * 3. S3 Key 반환
   *
   * 실제 API 연동 시 Mock 로직 제거 후 위 함수들 활용
   */
  async function upload(
    _file: Blob | File,
    _options: { filename: string; purpose: 'biometric' | 'health_scan' | 'voice_emotion' }
  ): Promise<string> {
    isUploading.value = true
    progress.value = 0
    error.value = null

    try {
      // Mock: 업로드 진행 시뮬레이션
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 200))
        progress.value = i
      }

      // Mock S3 키 반환
      const mockKey = `${_options.purpose}/${Date.now()}_${_options.filename}`
      return mockKey

      // 실제 API 연동 시:
      // const presigned = await getPresignedUrl({ filename: options.filename, file_type: file.type, purpose: options.purpose })
      // await uploadToS3(presigned.upload_url, file)
      // return presigned.s3_key
    } catch (err) {
      error.value = err instanceof Error ? err.message : '업로드 실패'
      throw err
    } finally {
      isUploading.value = false
    }
  }

  return {
    isUploading,
    progress,
    error,
    upload,
  }
}
