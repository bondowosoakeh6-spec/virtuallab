import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string; studentId: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') return apiError(ErrorCodes.FORBIDDEN, 'Forbidden', 403);
    
    await prisma.classMember.delete({ where: { classId_studentId: { classId: params.id, studentId: params.studentId } } });
    await logAudit({ userId: session.user.id, action: 'REMOVE_CLASS_MEMBER', entity: 'ClassMember', entityId: params.studentId });
    return apiSuccess(null);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}
