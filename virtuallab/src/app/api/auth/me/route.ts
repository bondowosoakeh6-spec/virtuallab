import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        student: true,
        instructor: true
      }
    });

    if (!user) {
      return apiError(ErrorCodes.NOT_FOUND, 'User not found', 404);
    }

    const { passwordHash: _, ...userData } = user;

    return apiSuccess(userData);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}
