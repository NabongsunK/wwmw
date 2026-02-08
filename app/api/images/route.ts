// 이미지 API 라우트

import { NextRequest } from 'next/server'
import {
  responseOk,
  responseCreated,
  responseBadRequest,
  responseServerError,
} from '@/lib/api-response'
import { ImageService } from '@/service/image.service'

/**
 * @swagger
 * /api/images:
 *   get:
 *     summary: 이미지 조회
 *     tags: [Images]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *       - in: query
 *         name: image_type
 *         schema:
 *           type: string
 *           enum: [유파, 장비, 무술, 스킬, 비결, 심법]
 *     responses:
 *       200:
 *         description: 이미지 목록/단건
 *       500:
 *         description: 서버 오류
 *   post:
 *     summary: 이미지 생성
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: 생성됨
 *       400:
 *         description: 잘못된 요청
 */
const imageService = new ImageService()

/**
 * GET /api/images - 모든 이미지 조회
 * Query: ?code=xxx&image_type=유파|장비|무술|스킬|비결|심법
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const image_type = searchParams.get('image_type')

    if (code && image_type) {
      const image = await imageService.getByCodeAndType(code, image_type as never)
      return responseOk(image)
    }

    if (code) {
      const images = await imageService.getByCode(code)
      return responseOk(images)
    }

    if (image_type) {
      const images = await imageService.getByType(image_type as never)
      return responseOk(images)
    }

    const images = await imageService.getAll()
    return responseOk(images)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch images'
    return responseServerError(message)
  }
}

/**
 * POST /api/images - 이미지 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const image = await imageService.create(body)
    return responseCreated(image)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create image'
    return responseBadRequest(message)
  }
}
