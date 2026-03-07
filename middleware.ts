// Next.js 미들웨어 - API 요청 시 쿠키의 lang 검증 후 헤더로 전달

import { NextRequest, NextResponse } from 'next/server'
import { SUPPORTED_LANGS, isValidLang } from '@/lib/lang-validator'
import { LANG_COOKIE_NAME, LANG_HEADER_NAME } from '@/lib/api-lang'
import { responseBadRequest } from '@/lib/api-response'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const langFromCookie = request.cookies.get(LANG_COOKIE_NAME)?.value ?? 'ko'

  if (!isValidLang(langFromCookie)) {
    return responseBadRequest(
      `Invalid lang in cookie '${LANG_COOKIE_NAME}': '${langFromCookie}'. Use: ${SUPPORTED_LANGS.join(', ')}`,
    )
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(LANG_HEADER_NAME, langFromCookie)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: ['/api/:path*'],
}
