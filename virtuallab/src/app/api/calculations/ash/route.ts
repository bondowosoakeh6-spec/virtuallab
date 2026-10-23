import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { calculateAsh } from '@/lib/calculations/engine';
import { ashInputSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const parsed = ashInputSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid input data', 400);
    }
    
    const result = calculateAsh(parsed.data);
    
    if (body.sessionId) {
      await prisma.calculationResult.create({
        data: {
          sessionId: body.sessionId,
          calculationId: 'ash',
          formula: 'ash',
          inputSnapshot: parsed.data as any,
          intermediate: result.steps as any,
          result: result.ash_pct,
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



