import { NextResponse } from 'next/server'

/** 성공: 200 + { success: true, data } */
export function responseOk<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 200 })
}

/** 생성됨: 201 + { success: true, data } */
export function responseCreated<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 })
}

/** 잘못된 요청: 400 + { success: false, message } */
export function responseBadRequest(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 })
}

/** 없음: 404 + { success: false, message } */
export function responseNotFound(message: string) {
  return NextResponse.json({ success: false, message }, { status: 404 })
}

/** 프로덕션에서 클라이언트에 보낼 기본 메시지 (DB/내부 정보 숨김) */
const PRODUCTION_ERROR_MESSAGE = 'Internal server error'

/**
 * 서버 오류: 500 + { success: false, message }
 * - 개발: 실제 message 그대로 반환
 * - 프로덕션: 고정 메시지 반환, 실제 내용은 서버 로그에만 출력
 */
export function responseServerError(message: string) {
  const isProduction = process.env.NODE_ENV === 'production'
  const clientMessage = isProduction ? PRODUCTION_ERROR_MESSAGE : message
  if (isProduction && message) {
    console.error('[API 500]', message)
  }
  return NextResponse.json({ success: false, message: clientMessage }, { status: 500 })
}
