import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: { grade: true }
    });

    if (!submission) {
      return apiError(ErrorCodes.NOT_FOUND, 'Submission not found', 404);
    }

    if (session.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
      const studentId = student ? student.id : session.user.id;
      if (submission.studentId !== studentId && submission.studentId !== session.user.id) {
        return apiError(ErrorCodes.FORBIDDEN, 'Not allowed', 403);
      }
    }

    return apiSuccess(submission);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}
