import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { createClassSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    let classes;
    if (session.user.role === 'ADMIN') {
      classes = await prisma.class.findMany({ include: { instructor: true } });
    } else if (session.user.role === 'INSTRUCTOR') {
      const instructor = await prisma.instructor.findUnique({ where: { userId: session.user.id } });
      if (!instructor) return apiError(ErrorCodes.NOT_FOUND, 'Instructor not found', 404);
      classes = await prisma.class.findMany({ where: { instructorId: instructor.id }, include: { instructor: true } });
    } else {
      const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
      if (!student) return apiError(ErrorCodes.NOT_FOUND, 'Student not found', 404);
      const members = await prisma.classMember.findMany({ where: { studentId: student.id }, include: { class: { include: { instructor: true } } } });
      classes = members.map(m => m.class);
    }
    return apiSuccess(classes);
  } catch (error) {
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    if (session.user.role !== 'ADMIN' && session.user.role !== 'INSTRUCTOR') {
      return apiError(ErrorCodes.FORBIDDEN, 'Forbidden access', 403);
    }

    const body = await req.json();
    const parsed = createClassSchema.parse(body);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    let instructorId = body.instructorId;
    if (session.user.role === 'INSTRUCTOR') {
      const inst = await prisma.instructor.findUnique({ where: { userId: session.user.id } });
      if (!inst) return apiError(ErrorCodes.NOT_FOUND, 'Instructor not found', 404);
      instructorId = inst.id;
    }
    
    const newClass = await prisma.class.create({
      data: {
        name: parsed.name,
        code,
        course: parsed.course,
        semester: parsed.semester,
        academicYear: parsed.academicYear,
        instructorId
      }
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_CLASS',
      entity: 'Class',
      entityId: newClass.id,
      metadata: { name: newClass.name, code: newClass.code }
    });

    return apiSuccess(newClass, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(ErrorCodes.VALIDATION_ERROR, error.message, 400);
    }
    return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
}
