// 빌드 개별 API 라우트 (조회, 수정, 삭제)

import { NextRequest } from 'next/server'
import {
  responseOk,
  responseBadRequest,
  responseNotFound,
  responseServerError,
  responseForbidden,
} from '@/lib/api-response'
import { BuildService } from '@/service/build.service'
import { isAdmin } from '@/lib/auth'
import type { UpdateBuildDto } from '@/types/build'

/**
 * @swagger
 * /api/builds/{id}:
 *   get:
 *     summary: 빌드 상세 조회
 *     tags: [Builds]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 빌드 상세
 *       400:
 *         description: 잘못된 ID
 *       404:
 *         description: 없음
 *       500:
 *         description: 서버 오류
 *   put:
 *     summary: 빌드 수정
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
 *     responses:
 *       200:
 *         description: 수정됨
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 *   delete:
 *     summary: 빌드 삭제 (소프트 삭제)
 *     tags: [Builds]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제됨
 *       400:
 *         description: 잘못된 요청
 */
const buildService = new BuildService()

/**
 * GET /api/builds/:id - 빌드 상세 조회
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return responseBadRequest('Invalid build ID')
    }

    const build = await buildService.getBuildById(id)
    if (!build) {
      return responseNotFound('Build not found')
    }

    return responseOk(build)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch build'
    return responseServerError(message)
  }
}

/**
 * PUT /api/builds/:id - 빌드 수정 (작성자 또는 관리자만)
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return responseBadRequest('Invalid build ID')
    }

    const body = (await request.json().catch(() => ({}))) as UpdateBuildDto & { uid?: string }
    const { uid, ...updateData } = body

    const existing = await buildService.getBuildById(id)
    if (!existing) {
      return responseNotFound('Build not found')
    }

    const isAuthor = existing.user_id != null && uid != null && existing.user_id === uid
    if (!isAuthor && !isAdmin(uid)) {
      return responseForbidden('수정 권한이 없습니다. (작성자 또는 관리자만 가능)')
    }

    const build = await buildService.updateBuild(id, updateData)
    return responseOk(build)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update build'
    return responseBadRequest(message)
  }
}

/**
 * DELETE /api/builds/:id - 빌드 삭제 (소프트 삭제, 작성자 또는 관리자만)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return responseBadRequest('Invalid build ID')
    }

    const body = (await request.json().catch(() => ({}))) as { uid?: string }
    const uid = body.uid ?? new URL(request.url).searchParams.get('uid')

    const existing = await buildService.getBuildById(id)
    if (!existing) {
      return responseNotFound('Build not found')
    }

    const isAuthor = existing.user_id != null && uid != null && existing.user_id === uid
    if (!isAuthor && !isAdmin(uid)) {
      return responseForbidden('삭제 권한이 없습니다. (작성자 또는 관리자만 가능)')
    }

    await buildService.deleteBuild(id)
    return responseOk({ message: 'Build deleted successfully' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete build'
    return responseBadRequest(message)
  }
}
