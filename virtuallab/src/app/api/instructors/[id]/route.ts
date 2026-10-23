import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    await requireAuth();

    const instructor = await prisma.instructor.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!instructor) {
      return NextResponse.json(apiError('NOT_FOUND', 'Instructor not found'), { status: 404 });
    }

    return NextResponse.json(apiSuccess(instructor));
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(apiError('UNAUTHORIZED', 'Not authenticated'), { status: 401 });
    }
    return NextResponse.json(apiError('INTERNAL_ERROR', error.message), { status: 500 });
  }
}
