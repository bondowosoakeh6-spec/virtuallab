import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') return apiError(ErrorCodes.FORBIDDEN, 'Forbidden', 403);
    
    const exp = await prisma.experiment.update({ where: { id: params.id }, data: { isPublished: true } });
    await logAudit({ userId: session.user.id, action: 'PUBLISH_EXPERIMENT', entity: 'Experiment', entityId: params.id });
    return apiSuccess(exp);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}
