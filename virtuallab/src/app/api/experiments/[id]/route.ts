import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { updateExperimentSchema } from '@/lib/validations';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    const exp = await prisma.experiment.findUnique({
      where: { id: params.id },
      include: { module: true, class: true, _count: { select: { sessions: true } } }
    });
    if (!exp) return apiError(ErrorCodes.NOT_FOUND, 'Experiment not found', 404);
    return apiSuccess(exp);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}

export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    const body = await req.json();
    const parsed = updateExperimentSchema.parse(body);
    const updated = await prisma.experiment.update({ where: { id: params.id }, data: parsed });
    await logAudit({ userId: session.user.id, action: 'UPDATE_EXPERIMENT', entity: 'Experiment', entityId: params.id });
    return apiSuccess(updated);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}

export async function DELETE(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    await prisma.experiment.delete({ where: { id: params.id } });
    await logAudit({ userId: session.user.id, action: 'DELETE_EXPERIMENT', entity: 'Experiment', entityId: params.id });
    return apiSuccess(null);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}
