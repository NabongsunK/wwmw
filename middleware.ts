// Next.js 미들웨어 - API 경로의 언어 검증

import { NextRequest, NextResponse } from 'next/server'
import { SUPPORTED_LANGS, isValidLang } from '@/lib/lang-validator'
import { responseBadRequest } from '@/lib/api-response'

/**
 * 미들웨어 - /api/[lang]/** 경로의 언어 유효성 검사
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /api/[lang]/** 패턴 매칭
  const match = pathname.match(/^\/api\/([^/]+)/)

  if (match) {
    const lang = match[1]

    // 지원하지 않는 언어인 경우 400 에러 반환 (기존 응답 함수 사용)
    if (!isValidLang(lang)) {
      return responseBadRequest(
        `Invalid lang parameter '${lang}'. Use: ${SUPPORTED_LANGS.join(', ')}`,
      )
    }
  }

  // 유효한 경우 다음으로 진행
  return NextResponse.next()
}

/**
 * 미들웨어 적용 경로 설정
 */
export const config = {
  matcher: ['/api/:lang(ko|en|ja|zh|[^/]+)/:path*'],
}
