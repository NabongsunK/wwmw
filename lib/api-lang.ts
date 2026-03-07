// API 요청에서 언어(lang) 읽기 - 미들웨어가 쿠키 검증 후 x-lang 헤더로 넣어 둠

import { NextRequest } from 'next/server'
import type { Lang } from '@/types/martial'
import { isValidLang } from './lang-validator'

/** 쿠키 키 (프론트에서 한 번 설정하면 모든 API 요청에 자동 포함) */
export const LANG_COOKIE_NAME = 'lang'

export const LANG_HEADER_NAME = 'x-lang'

/**
 * API 라우트에서 사용. 미들웨어가 설정한 x-lang 헤더에서 lang 반환.
 * 없거나 잘못된 값이면 기본값 'ko'.
 */
export function getLangFromRequest(request: NextRequest): Lang {
  const value = request.headers.get(LANG_HEADER_NAME) ?? 'ko'
  return isValidLang(value) ? value : 'ko'
}
