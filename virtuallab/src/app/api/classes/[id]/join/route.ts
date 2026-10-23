import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { AuditAction, AuditEntity } from '@/lib/audit-actions';

export async function POST(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    if (session.user.role !== 'STUDENT') return apiError(ErrorCodes.FORBIDDEN, 'Only students can join classes', 403);
    
    const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
    if (!student) return apiError(ErrorCodes.NOT_FOUND, 'Student not found', 404);
    
    const existing = await prisma.classMember.findUnique({ where: { classId_studentId: { classId: params.id, studentId: student.id } } });
    if (existing) return apiError(ErrorCodes.CONFLICT, 'Already a member', 400);
    
    const member = await prisma.classMember.create({ data: { classId: params.id, studentId: student.id } });
    await logAudit({ userId: session.user.id, action: AuditAction.JOIN_CLASS, entity: AuditEntity.CLASS_MEMBER, entityId: member.id, metadata: { classId: params.id, studentId: student.id } });
    return apiSuccess(member, undefined, 201);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}
