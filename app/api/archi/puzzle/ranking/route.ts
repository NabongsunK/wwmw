import { NextRequest } from 'next/server'
import { responseBadRequest, responseOk, responseServerError } from '@/lib/api-response'
import { ArchiPuzzleService } from '@/service/archi-puzzle.service'

const service = new ArchiPuzzleService()

/**
 * @swagger
 * /api/archi/puzzle/ranking:
 *   get:
 *     summary: 아치 퍼즐 클리어 랭킹 (이동 횟수 오름차순)
 *     tags: [ArchiPuzzle]
 *     parameters:
 *       - in: query
 *         name: puzzleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 랭킹 목록
 */
export async function GET(request: NextRequest) {
  try {
    const puzzleId = request.nextUrl.searchParams.get('puzzleId')
    if (!puzzleId) {
      return responseBadRequest('puzzleId is required')
    }
    const data = await service.getRanking(puzzleId)
    return responseOk(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load ranking'
    if (message.includes('Invalid')) {
      return responseBadRequest(message)
    }
    return responseServerError(message)
  }
}
