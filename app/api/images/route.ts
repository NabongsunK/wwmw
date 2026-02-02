// 이미지 API 라우트

import { NextRequest, NextResponse } from 'next/server'
import { ImageService } from '@/service/image.service'

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
      const image = await imageService.getByCodeAndType(code, image_type as any)
      return NextResponse.json({ success: true, data: image }, { status: 200 })
    }

    if (code) {
      const images = await imageService.getByCode(code)
      return NextResponse.json({ success: true, data: images }, { status: 200 })
    }

    if (image_type) {
      const images = await imageService.getByType(image_type as any)
      return NextResponse.json({ success: true, data: images }, { status: 200 })
    }

    const images = await imageService.getAll()
    return NextResponse.json({ success: true, data: images }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch images',
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/images - 이미지 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const image = await imageService.create(body)
    return NextResponse.json({ success: true, data: image }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create image',
      },
      { status: 400 },
    )
  }
}
