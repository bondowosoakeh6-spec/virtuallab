import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { calculateTitrationCurve } from '@/lib/calculations/engine';
import { titrationCurveInputSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const parsed = titrationCurveInputSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid input data', 400);
    }
    
    const result = calculateTitrationCurve(parsed.data);
    
    if (body.sessionId) {
      await prisma.calculationResult.create({
        data: {
          sessionId: body.sessionId,
          calculationId: 'titration-curve',
          formula: 'titration-curve',
          inputSnapshot: parsed.data as any,
          intermediate: result.steps as any,
          result: 0,
          unit: 'pH',
          status: 'SUCCESS'
        }
      });
    }

    return apiSuccess(result);
  } catch (error: any) {
    return apiError('SERVER_ERROR', error.message, 500);
  }
}



