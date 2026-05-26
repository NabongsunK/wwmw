import { NextRequest } from 'next/server'
import { responseBadRequest, responseCreated, responseServerError } from '@/lib/api-response'
import { ArchiPuzzleService } from '@/service/archi-puzzle.service'
import type { ArchiPuzzleClearRequestBody } from '@/types/archi-puzzle'

const service = new ArchiPuzzleService()

/**
 * @swagger
 * /api/archi/puzzle/clear:
 *   post:
 *     summary: 아치 퍼즐 클리어 기록 저장
 *     tags: [ArchiPuzzle]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [puzzleId, moveCount]
 *             properties:
 *               puzzleId:
 *                 type: string
 *                 example: "1"
 *               nickname:
 *                 type: string
 *               moveCount:
 *                 type: integer
 *               uid:
 *                 type: string
 *     responses:
 *       201:
 *         description: 저장됨
 *       400:
 *         description: 잘못된 요청
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ArchiPuzzleClearRequestBody
    const data = await service.recordClear(body)
    return responseCreated(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save clear record'
    if (message.includes('Invalid') || message.includes('required')) {
      return responseBadRequest(message)
    }
    return responseServerError(message)
  }
}
