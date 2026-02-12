import { responseOk, responseServerError } from '@/lib/api-response'
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
      return responseOk({ message: result.message })
    }
    return responseServerError(result.message)
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return responseServerError(message)
  }
}
