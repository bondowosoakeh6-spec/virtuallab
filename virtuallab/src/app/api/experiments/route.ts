import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { createExperimentSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;
    let exps;
    if (session.user.role === 'ADMIN') {
      exps = await prisma.experiment.findMany({ include: { module: true, class: true } });
    } else if (session.user.role === 'INSTRUCTOR') {
      const inst = await prisma.instructor.findUnique({ where: { userId: session.user.id } });
      exps = await prisma.experiment.findMany({ where: { class: { instructorId: inst?.id } }, include: { module: true, class: true } });
    } else {
      const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
      const members = await prisma.classMember.findMany({ where: { studentId: student?.id } });
      exps = await prisma.experiment.findMany({ where: { classId: { in: members.map(m => m.classId) }, isPublished: true }, include: { module: true, class: true } });
    }
    return apiSuccess(exps);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;
    if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') return apiError(ErrorCodes.FORBIDDEN, 'Forbidden', 403);
    const body = await req.json();
    const parsed = createExperimentSchema.parse(body);
    
    const newExp = await prisma.experiment.create({ data: parsed });
    await logAudit({ userId: session.user.id, action: 'CREATE_EXPERIMENT', entity: 'Experiment', entityId: newExp.id });
    return apiSuccess(newExp, undefined, 201);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}
