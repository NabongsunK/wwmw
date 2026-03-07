/**
 * 클라이언트에서 lang 쿠키 설정 (API 요청 시 자동으로 전송됨).
 * 서버 lib/api-lang.ts 의 LANG_COOKIE_NAME 과 동일한 값 사용.
 */
export const LANG_COOKIE_NAME = 'lang'

const MAX_AGE_ONE_YEAR = 365 * 24 * 60 * 60

export function setLangCookie(value: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${LANG_COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE_ONE_YEAR}; SameSite=Lax`
}

export function getLangCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE_NAME}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
