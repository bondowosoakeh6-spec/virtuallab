import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    const members = await prisma.classMember.findMany({
      where: { classId: params.id },
      include: { student: { include: { user: true } } }
    });
    return apiSuccess(members);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}
