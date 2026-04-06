// 언어 유효성 검사 유틸리티

import { responseBadRequest } from '@/lib/api-response'
import type { Lang } from '@/types/base'

/**
 * 지원하는 언어 목록
 */
export const SUPPORTED_LANGS: readonly Lang[] = ['ko', 'en', 'ja', 'zh'] as const

/**
 * 언어 코드 유효성 검사
 * @param lang - 검증할 언어 코드
 * @returns 유효하면 true, 아니면 false
 */
export function isValidLang(lang: string): lang is Lang {
  return SUPPORTED_LANGS.includes(lang as Lang)
}

/**
 * 언어 유효성 검사 후 에러 응답 반환
 * @param lang - 검증할 언어 코드
 * @returns 유효하지 않으면 에러 응답, 유효하면 null
 */
export function validateLangOrError(lang: string) {
  if (!isValidLang(lang)) {
    return responseBadRequest(`Invalid lang parameter. Use: ${SUPPORTED_LANGS.join(', ')}`)
  }
  return null
}

/**
 * 언어 코드 정규화 (기본값 적용)
 * @param lang - 언어 코드 또는 null/undefined
 * @param defaultLang - 기본 언어 (기본값: 'ko')
 * @returns 정규화된 언어 코드
 */
export function normalizeLang(lang: string | null | undefined, defaultLang: Lang = 'ko'): Lang {
  return (lang || defaultLang) as Lang
}
