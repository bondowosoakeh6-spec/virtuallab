import { NextResponse } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { canTransition, ExperimentState } from '@/lib/experiment-state-machine';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';

/**
 * POST /api/submissions/[id]/resubmit
 * Allows student to resubmit a RETURNED submission (Prompt #29)
 * Only if resubmissionAllowed is true
 */
export async function POST(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;

    if (session!.user.role !== 'STUDENT') {
      return apiError(ErrorCodes.FORBIDDEN, 'Only students can resubmit', 403);
    }

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
    });

    if (!submission) {
      return apiError(ErrorCodes.NOT_FOUND, 'Submission not found', 404);
    }

    // Verify ownership
    const student = await prisma.student.findUnique({
      where: { userId: session!.user.id },
    });
    if (!student || submission.studentId !== student.id) {
      return apiError(ErrorCodes.FORBIDDEN, 'Not your submission', 403);
    }

    // Check state machine transition validity (Prompt #29)
    if (submission.status !== 'RETURNED') {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        'Hanya submission dengan status RETURNED yang dapat disubmit ulang',
        400
      );
    }

    // Validate resubmission is allowed by instructor
    if (!(submission as any).resubmissionAllowed) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'Resubmission tidak diizinkan oleh instructor',
        403
      );
    }

    // Validate via state machine
    const isValid = canTransition(
      ExperimentState.RETURNED,
      ExperimentState.RESUBMITTED,
      'STUDENT',
      { allowResubmission: true }
    );

    if (!isValid) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'Invalid state transition', 400);
    }

    const updated = await prisma.submission.update({
      where: { id: params.id },
      data: {
        status: 'RESUBMITTED' as any,
        submittedAt: new Date(),
      },
    });

    await logAudit({
      userId: session!.user.id,
      action: 'RESUBMIT',
      entity: 'Submission',
      entityId: params.id,
    });

    return apiSuccess(updated);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Failed to resubmit', 500);
  }
}
