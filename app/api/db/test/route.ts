import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/db'

/**
 * @swagger
 * /api/db/test:
 *   get:
 *     summary: DB 연결 테스트
 *     tags: [DB]
 *     responses:
 *       200:
 *         description: 연결 성공
 *       500:
 *         description: 연결 실패 또는 서버 오류
 */
export async function GET() {
  try {
    const result = await testConnection()

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message }, { status: 200 })
    } else {
      return NextResponse.json({ success: false, message: result.message }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      },
      { status: 500 },
    )
  }
}
