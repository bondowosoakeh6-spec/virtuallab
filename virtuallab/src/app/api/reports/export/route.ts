import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getAuthSession } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

/**
 * GET /api/reports/export?classId=xxx&format=json
 * Instructor/Admin — export class grades report
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return apiError('UNAUTHORIZED', 'Authentication required', 401);
    if (!['INSTRUCTOR', 'ADMIN'].includes(session.user.role)) {
      return apiError('FORBIDDEN', 'Instructor or Admin access required', 403);
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    if (!classId) {
      return apiError('INVALID_INPUT', 'classId is required', 400);
    }

    // Verify instructor owns this class (unless admin)
    if (session.user.role === 'INSTRUCTOR') {
      const instructor = await prisma.instructor.findUnique({
        where: { userId: session.user.id },
      });
      if (!instructor) return apiError('FORBIDDEN', 'Instructor profile not found', 403);

      const cls = await prisma.class.findFirst({
        where: { id: classId, instructorId: instructor.id },
      });
      if (!cls) return apiError('FORBIDDEN', 'You are not the instructor of this class', 403);
    }

    const submissions = await prisma.submission.findMany({
      where: {
        experiment: { classId },
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        experiment: {
          select: { title: true, maxScore: true },
          include: { module: { select: { name: true, slug: true } } },
        },
        grade: true,
      },
      orderBy: [
        { experiment: { title: 'asc' } },
        { createdAt: 'asc' },
      ],
    });

    const reportData = submissions.map((s) => ({
      studentName: s.student.user.name,
      studentEmail: s.student.user.email,
      studentNumber: s.student.studentNumber,
      experimentTitle: s.experiment.title,
      moduleName: s.experiment.module.name,
      status: s.status,
      maxScore: s.experiment.maxScore,
      grade: s.grade
        ? {
            preTest: s.grade.preTest,
            practical: s.grade.practical,
            calculation: s.grade.calculation,
            report: s.grade.report,
            postTest: s.grade.postTest,
            total: s.grade.total,
            feedback: s.grade.feedback,
          }
        : null,
      submittedAt: s.submittedAt,
    }));

    return apiSuccess({
      classId,
      total: reportData.length,
      report: reportData,
    });
  } catch (error) {
    return apiError('INTERNAL_ERROR', 'Failed to generate report', 500);
  }
}
