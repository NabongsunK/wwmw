// 빌드 조회수 증가 API

import { NextRequest } from 'next/server'
import { responseOk, responseBadRequest, responseServerError } from '@/lib/api-response'
import { query } from '@/lib/db'

/**
 * @swagger
 * /api/builds/{id}/view:
 *   post:
 *     summary: 빌드 조회수 증가
 *     tags: [Builds]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 기록됨
 *       400:
 *         description: 잘못된 ID
 *       500:
 *         description: 서버 오류
 */
/**
 * POST /api/builds/[id]/view - 빌드 조회수 증가
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const buildId = parseInt(id)

    if (isNaN(buildId)) {
      return responseBadRequest('Invalid build ID')
    }

    // 클라이언트 IP 주소 가져오기
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // 조회 기록 저장 (중복 방지를 위해 같은 IP에서 1시간 내 중복 조회는 제외할 수도 있음)
    await query(
      `INSERT INTO T_빌드보드_조회 (빌드보드_id, ip_address, created_at) 
       VALUES (?, ?, NOW())`,
      [buildId, ipAddress],
    )

    return responseOk({ message: 'View recorded' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record view'
    return responseServerError(message)
  }
}
