// 빌드 좋아요 API

import { NextRequest } from 'next/server'
import { responseOk, responseBadRequest, responseServerError } from '@/lib/api-response'
import { query } from '@/lib/db'

/**
 * @swagger
 * /api/builds/{id}/like:
 *   get:
 *     summary: 빌드 좋아요 상태 확인
 *     tags: [Builds]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 좋아요 여부, 개수
 *       400:
 *         description: 잘못된 파라미터
 *       500:
 *         description: 서버 오류
 *   post:
 *     summary: 빌드 좋아요 추가/제거
 *     tags: [Builds]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [add, remove]
 *                 default: add
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 처리됨
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
/**
 * POST /api/builds/[id]/like - 빌드 좋아요 추가/제거
 * @param action - 'add' | 'remove' (기본값: 'add')
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const buildId = parseInt(id)
    const body = await request.json()
    const { action = 'add', userId } = body

    if (isNaN(buildId)) {
      return responseBadRequest('Invalid build ID')
    }

    if (!userId) {
      return responseBadRequest('User ID is required')
    }

    if (action === 'add') {
      // 좋아요 추가
      try {
        await query(
          `INSERT INTO T_빌드보드_좋아요 (빌드보드_id, user_id, created_at) 
           VALUES (?, ?, NOW())`,
          [buildId, userId],
        )
        return responseOk({ message: 'Like added', liked: true })
      } catch (error: unknown) {
        const err = error as { code?: string }
        if (err.code === 'ER_DUP_ENTRY') {
          return responseOk({ message: 'Already liked', liked: true })
        }
        throw error
      }
    } else {
      // 좋아요 제거
      await query(
        `DELETE FROM T_빌드보드_좋아요 
         WHERE 빌드보드_id = ? AND user_id = ?`,
        [buildId, userId],
      )
      return responseOk({ message: 'Like removed', liked: false })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update like'
    return responseServerError(message)
  }
}

/**
 * GET /api/builds/[id]/like - 빌드 좋아요 상태 확인
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const buildId = parseInt(id)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (isNaN(buildId) || !userId) {
      return responseBadRequest('Invalid parameters')
    }

    const likes = await query<{ id: number }>(
      `SELECT id FROM T_빌드보드_좋아요 
       WHERE 빌드보드_id = ? AND user_id = ?`,
      [buildId, userId],
    )

    return responseOk({ liked: likes.length > 0, likeCount: likes.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to check like'
    return responseServerError(message)
  }
}
