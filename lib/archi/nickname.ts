/** 닉네임 미입력 시 기본값 (archi → 아치) */
export const DEFAULT_ARCHI_NICKNAME = '테스트아치'
export const ARCHI_NICKNAME_STORAGE_KEY = 'archi-puzzle-nickname'
export const ARCHI_NICKNAME_MAX_LENGTH = 32

const ALLOWED_PUZZLE_IDS = new Set(['1', '2'])

export function isArchiPuzzleId(id: string): boolean {
  return ALLOWED_PUZZLE_IDS.has(id)
}

/** 빈 값·공백만 있으면 기본 닉네임 */
export function resolveArchiNickname(input: string | null | undefined): string {
  const trimmed = (input ?? '').trim()
  if (trimmed.length === 0) return DEFAULT_ARCHI_NICKNAME
  return trimmed.slice(0, ARCHI_NICKNAME_MAX_LENGTH)
}

/** 저장용 — 이미 붙은 #번호는 제거하고 기본 이름만 */
export function getNicknameBase(nickname: string): string {
  const m = nickname.match(/^(.+)#(\d+)$/)
  return m ? m[1] : nickname
}

/**
 * 같은 기본 닉네임은 항상 #1, #2 … 붙임 (첫 클리어도 #1).
 */
export function allocateUniqueNickname(
  base: string,
  existingNicknames: string[],
): string {
  let maxSuffix = 0
  for (const name of existingNicknames) {
    if (name === base) {
      maxSuffix = Math.max(maxSuffix, 1)
      continue
    }
    if (!name.startsWith(`${base}#`)) continue
    const num = parseInt(name.slice(base.length + 1), 10)
    if (!Number.isNaN(num)) {
      maxSuffix = Math.max(maxSuffix, num)
    }
  }

  const suffix = maxSuffix + 1
  const stored = `${base}#${suffix}`
  const maxLen = 64
  if (stored.length <= maxLen) return stored
  return `${base.slice(0, maxLen - `#${suffix}`.length)}#${suffix}`
}

export function getStoredArchiNickname(): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(ARCHI_NICKNAME_STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setStoredArchiNickname(value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ARCHI_NICKNAME_STORAGE_KEY, value.trim())
  } catch {
    // ignore
  }
}
