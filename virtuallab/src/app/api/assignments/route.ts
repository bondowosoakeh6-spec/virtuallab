import { NextRequest } from 'next/server';
import { apiSuccess, apiError, apiPaginated } from '@/lib/api-response';
import { getAuthSession } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { createExperimentSchema } from '@/lib/validations';

/**
 * GET /api/assignments
 * Lists experiments (assignments) — role-filtered
 * Legacy route kept for backward compatibility; maps to Experiment model
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return apiError('UNAUTHORIZED', 'Authentication required', 401);

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    let where: any = {};

    if (classId) where.classId = classId;

    if (session.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
      if (!student) return apiError('NOT_FOUND', 'Student profile not found', 404);
      const memberships = await prisma.classMember.findMany({
        where: { studentId: student.id },
        select: { classId: true },
      });
      where.classId = { in: memberships.map((m) => m.classId) };
      where.isPublished = true;
    } else if (session.user.role === 'INSTRUCTOR') {
      const instructor = await prisma.instructor.findUnique({ where: { userId: session.user.id } });
      if (!instructor) return apiError('NOT_FOUND', 'Instructor profile not found', 404);
      const classes = await prisma.class.findMany({
        where: { instructorId: instructor.id },
        select: { id: true },
      });
      where.classId = { in: classes.map((c) => c.id) };
    }

    const [experiments, total] = await Promise.all([
      prisma.experiment.findMany({
        where,
        skip,
        take: limit,
        include: {
          module: { select: { id: true, name: true, slug: true } },
          class: { select: { id: true, name: true, code: true } },
          _count: { select: { submissions: true, sessions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.experiment.count({ where }),
    ]);

    return apiPaginated(experiments, total, page, limit);
  } catch (error) {
    return apiError('INTERNAL_ERROR', 'Failed to fetch assignments', 500);
  }
}

/**
 * POST /api/assignments
 * Create experiment (assignment) — INSTRUCTOR/ADMIN only
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return apiError('UNAUTHORIZED', 'Authentication required', 401);
    if (!['INSTRUCTOR', 'ADMIN'].includes(session.user.role)) {
      return apiError('FORBIDDEN', 'Instructor or Admin access required', 403);
    }

    const body = await req.json();
    const parsed = createExperimentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid input', 400);
    }

    const { moduleId, classId, title, description, instructions, maxScore, deadline } = parsed.data;

    const experiment = await prisma.experiment.create({
      data: {
        moduleId,
        classId,
        title,
        description,
        instructions,
        maxScore,
        deadline: deadline ? new Date(deadline) : null,
        isPublished: false,
      },
      include: {
        module: { select: { name: true } },
        class: { select: { name: true } },
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE',
      entity: 'Experiment',
      entityId: experiment.id,
      metadata: { title },
    });

    return apiSuccess(experiment, undefined, 201);
  } catch (error) {
    return apiError('INTERNAL_ERROR', 'Failed to create assignment', 500);
  }
}
