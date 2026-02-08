// 빌드 개별 API 라우트 (조회, 수정, 삭제)

import { NextRequest, NextResponse } from 'next/server'
import { BuildService } from '@/service/build.service'

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
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid build ID' }, { status: 400 })
    }

    const build = await buildService.getBuildById(id)
    if (!build) {
      return NextResponse.json({ success: false, message: 'Build not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: build }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch build',
      },
      { status: 500 },
    )
  }
}

/**
 * PUT /api/builds/:id - 빌드 수정
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid build ID' }, { status: 400 })
    }

    const body = await request.json()
    const build = await buildService.updateBuild(id, body)

    return NextResponse.json({ success: true, data: build }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update build',
      },
      { status: 400 },
    )
  }
}

/**
 * DELETE /api/builds/:id - 빌드 삭제 (소프트 삭제)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: 'Invalid build ID' }, { status: 400 })
    }

    await buildService.deleteBuild(id)

    return NextResponse.json(
      { success: true, message: 'Build deleted successfully' },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete build',
      },
      { status: 400 },
    )
  }
}
