// 빌드 API 라우트

import { NextRequest } from 'next/server'
import {
  responseOk,
  responseCreated,
  responseBadRequest,
  responseServerError,
} from '@/lib/api-response'
import { BuildService } from '@/service/build.service'

/**
 * @swagger
 * /api/builds:
 *   get:
 *     summary: 모든 빌드 조회
 *     tags: [Builds]
 *     responses:
 *       200:
 *         description: 빌드 목록
 *       500:
 *         description: 서버 오류
 *   post:
 *     summary: 빌드 생성 (작성자 uid 저장)
 *     tags: [Builds]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *                 description: 작성자 uid (T_UID.uid)
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [PVE, PVP, RVR, 시련]
 *     responses:
 *       201:
 *         description: 생성됨
 *       400:
 *         description: 잘못된 요청
 */
const buildService = new BuildService()

/**
 * GET /api/builds - 모든 빌드 조회
 */
export async function GET() {
  try {
    const builds = await buildService.getAllBuilds()
    return responseOk(builds)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch builds'
    return responseServerError(message)
  }
}

/**
 * POST /api/builds - 빌드 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const build = await buildService.createBuild(body)
    return responseCreated(build)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create build'
    return responseBadRequest(message)
  }
}
