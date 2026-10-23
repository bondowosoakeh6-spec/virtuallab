import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { submissionSchema } from '@/lib/validations';
import { logAudit } from '@/lib/audit';
import { AuditAction, AuditEntity } from '@/lib/audit-actions';

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    if (session.user.role !== 'STUDENT') {
      return apiError(ErrorCodes.FORBIDDEN, 'Only students can create submissions', 403);
    }
    const body = await req.json();
    const parsed = submissionSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'Invalid input data', 400);
    }
    
    const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
    const studentId = student ? student.id : session.user.id;

    const submission = await prisma.submission.create({
      data: {
        experimentId: parsed.data.experimentId,
        studentId,
        sessionId: parsed.data.sessionId,
        status: (parsed.data.status || 'DRAFT') as any,
        submittedAt: parsed.data.status === 'SUBMITTED' ? new Date() : undefined,
        reportUrl: parsed.data.reportUrl
      }
    });

    await logAudit({
      userId: session.user.id,
      action: AuditAction.SUBMIT,
      entity: AuditEntity.SUBMISSION,
      entityId: submission.id,
      metadata: { experimentId: parsed.data.experimentId, status: submission.status },
    });

    return apiSuccess(submission, undefined, 201);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}

export async function GET(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const experimentId = searchParams.get('experimentId');
    
    let where: any = {};
    if (experimentId) where.experimentId = experimentId;
    const status = searchParams.get('status');
    if (status) where.status = status;

    if (session.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
      where.studentId = student ? student.id : session.user.id;
    } else if (session.user.role === 'INSTRUCTOR') {
      // Instructors can only see submissions from experiments in their own classes
      const instructor = await prisma.instructor.findUnique({ where: { userId: session.user.id } });
      if (instructor) {
        const instructorClasses = await prisma.class.findMany({
          where: { instructorId: instructor.id },
          select: { id: true }
        });
        const classIds = instructorClasses.map(c => c.id);
        const experiments = await prisma.experiment.findMany({
          where: { classId: { in: classIds } },
          select: { id: true }
        });
        where.experimentId = { in: experiments.map(e => e.id) };
      }
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        grade: true,
        experiment: { include: { module: true, class: true } },
        student: { include: { user: true } }
      }
    });

    return apiSuccess(submissions);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}
