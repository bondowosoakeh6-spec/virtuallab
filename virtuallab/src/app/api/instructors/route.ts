import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    
    const instructors = await prisma.instructor.findMany({
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

    return NextResponse.json(apiSuccess(instructors));
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(apiError('UNAUTHORIZED', 'Not authenticated'), { status: 401 });
    }
    return NextResponse.json(apiError('INTERNAL_ERROR', error.message), { status: 500 });
  }
}
