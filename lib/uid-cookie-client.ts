/**
 * 클라이언트에서 uid 쿠키 관리 (방문 시 발급받은 uid 저장, API 요청 시 자동 전송)
 */
export const UID_COOKIE_NAME = 'uid'

const MAX_AGE_ONE_YEAR = 365 * 24 * 60 * 60

export function setUidCookie(value: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${UID_COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE_ONE_YEAR}; SameSite=Lax`
}

export function getUidCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${UID_COOKIE_NAME}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
