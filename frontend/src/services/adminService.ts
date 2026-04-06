// ============================================================
// Service - B2B/B2G 관리자 (Admin Service)
// 실제 API 연동 시 주석 해제 후 stores/adminStore.ts에서 호출
// 현재: mocks/organizations.ts의 Mock 함수로 대체됨
// ============================================================

// import http from './http'
// import type { AdminPetListItem, Organization, PaginationParams } from '@/types'

/**
 * 기관 연동 환축 목록 조회 (페이지네이션/필터링 필수)
 * 실제 API: GET /organizations/{org_id}/pets
 * 지원 쿼리: ?page=1&limit=10&sort=-created_at&filter[status]=ACTIVE
 */
// export async function getOrgPets(
//   orgId: string,
//   params?: PaginationParams & { 'filter[status]'?: string; 'filter[bcs_score_gte]'?: number }
// ): Promise<{ pets: AdminPetListItem[]; meta: PaginationMeta }> {
//   const res = await http.get(`/organizations/${orgId}/pets`, { params })
//   return { pets: res.data.data, meta: res.data.meta }
// }

export {}
