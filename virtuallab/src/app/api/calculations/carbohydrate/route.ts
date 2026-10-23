import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { calculateCarbohydrate } from '@/lib/calculations/engine';
import { carbohydrateInputSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const parsed = carbohydrateInputSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid input data', 400);
    }
    
    const result = calculateCarbohydrate(parsed.data);
    
    if (body.sessionId) {
      await prisma.calculationResult.create({
        data: {
          sessionId: body.sessionId,
          calculationId: 'carbohydrate',
          formula: 'carbohydrate',
          inputSnapshot: parsed.data as any,
          intermediate: result.steps as any,
          result: result.carbohydrate_pct,
          unit: '%',
          status: 'SUCCESS'
        }
      });
    }

    return apiSuccess(result);
  } catch (error: any) {
    return apiError('SERVER_ERROR', error.message, 500);
  }
}



