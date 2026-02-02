// 이미지 상세 API 라우트

import { NextRequest, NextResponse } from 'next/server'
import { ImageService } from '@/service/image.service'

const imageService = new ImageService()

/**
 * GET /api/images/[id] - ID로 이미지 조회
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const image = await imageService.getById(id)
    return NextResponse.json({ success: true, data: image }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch image',
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 },
    )
  }
}

/**
 * PUT /api/images/[id] - 이미지 업데이트
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const image = await imageService.update(id, body)
    return NextResponse.json({ success: true, data: image }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update image',
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 400 },
    )
  }
}

/**
 * DELETE /api/images/[id] - 이미지 삭제
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    await imageService.delete(id)
    return NextResponse.json({ success: true, message: 'Deleted successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete image',
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 },
    )
  }
}
