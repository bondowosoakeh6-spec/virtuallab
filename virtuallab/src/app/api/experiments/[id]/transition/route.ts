import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { canTransition, performTransition, ExperimentState } from '@/lib/experiment-state-machine';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';

/**
 * POST /api/experiments/[id]/transition
 * Validates and performs a state transition server-side (Prompt #29)
 */
export async function POST(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { currentState, nextState } = body;

    if (!currentState || !nextState) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'currentState and nextState are required', 400);
    }

    // Validate the states are valid enum values
    if (!Object.values(ExperimentState).includes(currentState)) {
      return apiError(ErrorCodes.VALIDATION_ERROR, `Invalid currentState: ${currentState}`, 400);
    }
    if (!Object.values(ExperimentState).includes(nextState)) {
      return apiError(ErrorCodes.VALIDATION_ERROR, `Invalid nextState: ${nextState}`, 400);
    }

    // Get the submission to check its actual state
    const submission = await prisma.submission.findFirst({
      where: { experimentId: params.id, studentId: session!.user.id },
      orderBy: { createdAt: 'desc' },
    });

    // For RESUBMITTED transition, check resubmissionAllowed
    const options = submission ? { allowResubmission: (submission as any).resubmissionAllowed } : {};

    // Validate the transition
    const result = performTransition(
      currentState as ExperimentState,
      nextState as ExperimentState,
      session!.user.role,
      options
    );

    if (!result.success) {
      return apiError(
        ErrorCodes.VALIDATION_ERROR,
        `Transisi tidak valid: ${currentState} → ${nextState} untuk role ${session!.user.role}`,
        400
      );
    }

    // Update submission status if it exists
    if (submission) {
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: nextState,
          ...(nextState === 'SUBMITTED' ? { submittedAt: new Date() } : {}),
        },
      });
    }

    // Log the transition
    await logAudit({
      userId: session!.user.id,
      action: 'STATE_TRANSITION',
      entity: 'Experiment',
      entityId: params.id,
      metadata: { from: currentState, to: nextState, timestamp: result.timestamp },
    });

    return apiSuccess({
      success: true,
      previousState: currentState,
      newState: result.state,
      timestamp: result.timestamp,
    });
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Failed to perform transition', 500);
  }
}
