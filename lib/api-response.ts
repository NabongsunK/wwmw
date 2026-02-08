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

/** 서버 오류: 500 + { success: false, message } */
export function responseServerError(message: string) {
  return NextResponse.json({ success: false, message }, { status: 500 })
}
