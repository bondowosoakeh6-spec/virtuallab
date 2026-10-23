import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { AuditAction, AuditEntity } from '@/lib/audit-actions';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;

    const sess = await prisma.experimentSession.findUnique({ where: { id: params.id } });
    if (!sess) return apiError(ErrorCodes.NOT_FOUND, 'Session not found', 404);
    return apiSuccess(sess);
  } catch (e) {
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
}

export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session: sessionAuth, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const data: any = {};
    if (body.status === 'COMPLETED') {
      data.status = 'COMPLETED';
      data.completedAt = new Date();
    }
    const sess = await prisma.experimentSession.update({ where: { id: params.id }, data });
    await logAudit({
      userId: sessionAuth.user.id,
      action: 'UPDATE_SESSION',
      entity: 'ExperimentSession',
      entityId: params.id,
      metadata: data
    });
    await logAudit({
      userId: sessionAuth.user.id,
      action: AuditAction.SAVE_SESSION,
      entity: AuditEntity.EXPERIMENT_SESSION,
      entityId: params.id,
      metadata: data,
    });
    return apiSuccess(sess);
  } catch (e) {
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
}
