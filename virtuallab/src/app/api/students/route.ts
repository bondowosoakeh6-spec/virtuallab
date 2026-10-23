import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api-response';
import { requireRole } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['ADMIN', 'INSTRUCTOR']);
    
    const students = await prisma.student.findMany({
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

    return NextResponse.json(apiSuccess(students));
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json(apiError('UNAUTHORIZED', 'Not authorized'), { status: 403 });
    }
    return NextResponse.json(apiError('INTERNAL_ERROR', error.message), { status: 500 });
  }
}
