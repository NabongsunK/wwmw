// 빌드 개별 API 라우트 (조회, 수정, 삭제)

import { NextRequest, NextResponse } from 'next/server';
import { BuildService } from '@/service/build.service';

const buildService = new BuildService();

/**
 * GET /api/builds/:id - 빌드 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid build ID' },
        { status: 400 }
      );
    }

    const build = await buildService.getBuildById(id);
    if (!build) {
      return NextResponse.json(
        { success: false, message: 'Build not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: build }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch build',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/builds/:id - 빌드 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid build ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const build = await buildService.updateBuild(id, body);
    
    return NextResponse.json({ success: true, data: build }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update build',
      },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/builds/:id - 빌드 삭제 (소프트 삭제)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid build ID' },
        { status: 400 }
      );
    }

    await buildService.deleteBuild(id);
    
    return NextResponse.json(
      { success: true, message: 'Build deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete build',
      },
      { status: 400 }
    );
  }
}
