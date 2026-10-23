import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';

/**
 * POST /api/sessions/[id]/save
 * Save experiment inputs AND calculation results with traceability (Prompt #43)
 * Body: { inputs: [{parameter, value, unit}], calculationResult?: {...} }
 */
export async function POST(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session: sessionAuth, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { inputs, calculationResult } = body;

    // Find student
    const student = await prisma.student.findUnique({
      where: { userId: sessionAuth!.user.id },
    });
    if (!student) {
      return apiError(ErrorCodes.NOT_FOUND, 'Student not found', 404);
    }

    // Verify session ownership
    const expSession = await prisma.experimentSession.findUnique({
      where: { id: params.id },
    });
    if (!expSession) {
      return apiError(ErrorCodes.NOT_FOUND, 'Session not found', 404);
    }
    if (expSession.studentId !== student.id) {
      return apiError(ErrorCodes.FORBIDDEN, 'Not your session', 403);
    }

    // Save inputs
    const savedInputs = [];
    if (Array.isArray(inputs) && inputs.length > 0) {
      // Delete old inputs for this session to avoid duplicates
      await prisma.experimentInput.deleteMany({
        where: { sessionId: params.id },
      });

      for (const input of inputs) {
        const created = await prisma.experimentInput.create({
          data: {
            sessionId: params.id,
            parameter: input.parameter || input.key,
            value: input.value != null ? parseFloat(String(input.value)) : null,
            textValue: typeof input.value === 'string' ? input.value : null,
            unit: input.unit || null,
          },
        });
        savedInputs.push(created);
      }
    }

    // Save calculation result with full traceability (Prompt #43)
    let savedCalcResult = null;
    if (calculationResult) {
      // Build traceability metadata per Prompt #43 spec
      const traceability = {
        formulaId: calculationResult.traceability?.formulaId || calculationResult.calculationId || 'UNKNOWN',
        sourceWorkbook: calculationResult.traceability?.sourceWorkbook || 'Format Analisis Proksimat-a adam.xlsx',
        sourceSheet: calculationResult.traceability?.sourceSheet || '',
        sourceCells: calculationResult.traceability?.sourceCells || [],
        inputs: calculationResult.inputs || {},
        intermediate: calculationResult.intermediate || {},
        result: calculationResult.result,
        timestamp: new Date().toISOString(),
      };

      savedCalcResult = await prisma.calculationResult.create({
        data: {
          sessionId: params.id,
          calculationId: calculationResult.calculationId || `calc_${Date.now()}`,
          formula: calculationResult.formula || '',
          inputSnapshot: calculationResult.inputs || body.inputs || {},
          intermediate: {
            steps: calculationResult.steps || [],
            intermediate: calculationResult.intermediate || {},
            traceability,
          },
          result: calculationResult.result != null ? parseFloat(String(calculationResult.result)) : null,
          unit: calculationResult.unit || '%',
          status: calculationResult.status || 'SUCCESS',
        },
      });
    }

    await logAudit({
      userId: sessionAuth!.user.id,
      action: 'SAVE_SESSION',
      entity: 'ExperimentSession',
      entityId: params.id,
      metadata: {
        inputCount: savedInputs.length,
        hasCalculation: !!savedCalcResult,
      },
    });

    return apiSuccess({
      saved: true,
      inputCount: savedInputs.length,
      calculationResult: savedCalcResult,
    });
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Failed to save session', 500);
  }
}
