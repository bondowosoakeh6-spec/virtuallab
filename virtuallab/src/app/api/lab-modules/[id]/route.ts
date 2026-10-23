import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { updateLabModuleSchema } from '@/lib/validations';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    const mod = await prisma.labModule.findUnique({
      where: { id: params.id },
      include: { formulas: true, quizzes: true }
    });
    if (!mod) return apiError(ErrorCodes.NOT_FOUND, 'Lab module not found', 404);
    return apiSuccess(mod);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}

export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    if (session.user.role !== 'ADMIN') return apiError(ErrorCodes.FORBIDDEN, 'Admin access required', 403);
    const body = await req.json();
    const parsed = updateLabModuleSchema.parse(body);
    const updated = await prisma.labModule.update({ where: { id: params.id }, data: parsed });
    await logAudit({ userId: session.user.id, action: 'UPDATE_LAB_MODULE', entity: 'LabModule', entityId: params.id });
    return apiSuccess(updated);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}

export async function DELETE(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    if (session.user.role !== 'ADMIN') return apiError(ErrorCodes.FORBIDDEN, 'Admin access required', 403);
    await prisma.labModule.update({ where: { id: params.id }, data: { isActive: false } });
    await logAudit({ userId: session.user.id, action: 'DELETE_LAB_MODULE', entity: 'LabModule', entityId: params.id });
    return apiSuccess(null);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}
