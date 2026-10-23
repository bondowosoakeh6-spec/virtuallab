import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { calculateMoisture } from '@/lib/calculations/engine';
import { moistureInputSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const parsed = moistureInputSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'Invalid input data', 400);
    }
    
    const result = calculateMoisture(parsed.data);
    
    if (body.sessionId) {
      await prisma.calculationResult.create({
        data: {
          sessionId: body.sessionId,
          calculationId: 'moisture',
          formula: 'moisture',
          inputSnapshot: parsed.data as any,
          intermediate: result.steps as any,
          result: result.moisture_pct,
          unit: '%',
          status: 'SUCCESS'
        }
      });
    }

    return apiSuccess(result);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}
