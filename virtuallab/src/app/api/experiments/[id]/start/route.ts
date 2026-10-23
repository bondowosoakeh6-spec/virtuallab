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

    if (session.user.role !== 'STUDENT') return apiError(ErrorCodes.FORBIDDEN, 'Forbidden access', 403);
    
    const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
    if (!student) return apiError(ErrorCodes.NOT_FOUND, 'Student not found', 404);
    
    const exp = await prisma.experiment.findUnique({ where: { id: params.id } });
    if (!exp || !exp.isPublished) return apiError(ErrorCodes.NOT_FOUND, 'Experiment not found or published', 404);
    
    const isMember = await prisma.classMember.findUnique({ where: { classId_studentId: { classId: exp.classId, studentId: student.id } } });
    if (!isMember) return apiError(ErrorCodes.FORBIDDEN, 'Not a member of this class', 403);
    
    const newSession = await prisma.experimentSession.create({
      data: { experimentId: exp.id, studentId: student.id, status: 'IN_PROGRESS', startedAt: new Date() }
    });

    await logAudit({
      userId: session.user.id,
      action: 'START_EXPERIMENT',
      entity: 'ExperimentSession',
      entityId: newSession.id,
      metadata: { experimentId: exp.id }
    });

    return apiSuccess(newSession, undefined, 201);
  } catch (e) {
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
}
