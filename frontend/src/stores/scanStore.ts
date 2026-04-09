// ============================================================
// Pinia 스토어 - 헬스 스캔 (Scan Store)
// 촬영 세션 임시 데이터, presigned URL 캐싱 관리
// ============================================================

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { HealthScan, ScanSession, ScanType, ScanJob } from '@/types'
import { mockGetScansByPetId, mockGetScanById, mockCreateScan } from '@/mocks/scans'

export const useScanStore = defineStore('scan', () => {
  // ---- 상태 ----
  /** 반려동물별 스캔 목록 캐시 (petId -> HealthScan[]) */
  const scanCache = ref<Map<string, HealthScan[]>>(new Map())

  /** 현재 스캔 세션 (촬영 진행 중 임시 데이터) */
  const currentSession = ref<ScanSession | null>(null)

  /** 현재 보고 있는 스캔 상세 */
  const currentScan = ref<HealthScan | null>(null)

  /** 백그라운드 처리 중인 스캔 작업 */
  const pendingJob = ref<ScanJob | null>(null)

  const isLoading = ref(false)
  const isUploading = ref(false)
  const uploadProgress = ref(0)

  // ---- 액션 ----

  /**
   * 반려동물의 헬스 스캔 목록 조회
   * 실제 API 연동 시 GET /pets/{pet_id}/scans 으로 교체
   */
  async function fetchScansByPetId(petId: string, forceRefresh = false): Promise<HealthScan[]> {
    if (!forceRefresh && scanCache.value.has(petId)) {
      return scanCache.value.get(petId)!
    }

    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 0))
      const scans = mockGetScansByPetId(petId)
      scanCache.value.set(petId, scans)
      return scans
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 특정 스캔 상세 조회
   * 실제 API 연동 시 GET /scans/{scan_id} 으로 교체
   */
  async function fetchScanById(scanId: string): Promise<HealthScan | null> {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 0))
      const scan = mockGetScanById(scanId)
      currentScan.value = scan
      return scan
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 신규 스캔 요청 (AI 분석 시뮬레이션)
   * 실제 API 연동 시 POST /pets/{pet_id}/scans 으로 교체
   * 실제: 202 Accepted + Job ID 반환 후 비동기 처리
   */
  async function requestScan(petId: string, _scanTypes: ScanType[]): Promise<HealthScan> {
    isLoading.value = true
    try {
      // 데모: AI 분석 시뮬레이션 (3초)
      await new Promise(resolve => setTimeout(resolve, 3000))
      const newScan = mockCreateScan(petId)

      // 캐시 무효화
      scanCache.value.delete(petId)
      currentScan.value = newScan
      pendingJob.value = null

      return newScan
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 스캔 세션 시작
   */
  function startSession(petId: string, scanTypes: ScanType[]): void {
    currentSession.value = { petId, scanTypes }
    uploadProgress.value = 0
  }

  /**
   * 촬영 완료 - 캡처된 Blob 저장
   */
  function setCapturedBlob(blob: Blob): void {
    if (currentSession.value) {
      currentSession.value.capturedBlob = blob
    }
  }

  /**
   * S3 업로드 진행 (Mock)
   * 실제 API 연동 시 useS3Upload composable 활용
   */
  async function simulateUpload(): Promise<string> {
    isUploading.value = true
    uploadProgress.value = 0

    try {
      // 업로드 진행 시뮬레이션
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 150))
        uploadProgress.value = i
      }

      const mockS3Key = `scans/${currentSession.value?.petId}/${Date.now()}.mp4`
      if (currentSession.value) {
        currentSession.value.uploadedS3Key = mockS3Key
      }
      return mockS3Key
    } finally {
      isUploading.value = false
    }
  }

  /**
   * 세션 초기화
   */
  function clearSession(): void {
    currentSession.value = null
    uploadProgress.value = 0
    isUploading.value = false
  }

  /**
   * 캐시 초기화
   */
  function reset(): void {
    scanCache.value.clear()
    currentSession.value = null
    currentScan.value = null
    pendingJob.value = null
    uploadProgress.value = 0
  }

  return {
    scanCache,
    currentSession,
    currentScan,
    pendingJob,
    isLoading,
    isUploading,
    uploadProgress,
    fetchScansByPetId,
    fetchScanById,
    requestScan,
    startSession,
    setCapturedBlob,
    simulateUpload,
    clearSession,
    reset,
  }
})
