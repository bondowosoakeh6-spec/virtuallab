import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;

    const student = await prisma.student.findUnique({
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

    if (!student) {
      return apiError(ErrorCodes.NOT_FOUND, 'Student not found', 404);
    }

    if (session.user.role === 'STUDENT' && student.userId !== session.user.id) {
      return apiError(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }

    return apiSuccess(student);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}
