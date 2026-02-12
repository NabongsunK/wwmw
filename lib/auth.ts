/**
 * 관리자 uid 목록 (환경 변수 ADMIN_UIDS, 쉼표 구분)
 * 예: ADMIN_UIDS=uuid1,uuid2
 */
function getAdminUids(): string[] {
  const raw = process.env.ADMIN_UIDS
  if (!raw || typeof raw !== 'string') return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

let cachedAdminSet: Set<string> | null = null

/**
 * 해당 uid가 관리자 목록에 있는지 여부
 */
export function isAdmin(uid: string | null | undefined): boolean {
  if (!uid) return false
  if (cachedAdminSet === null) {
    cachedAdminSet = new Set(getAdminUids())
  }
  return cachedAdminSet.has(uid)
}
