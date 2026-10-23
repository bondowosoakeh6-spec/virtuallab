import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { calculateKadar } from '@/lib/calculations/engine';
import { kadarInputSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const parsed = kadarInputSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid input data', 400);
    }
    
    const result = calculateKadar(parsed.data);
    
    if (body.sessionId) {
      await prisma.calculationResult.create({
        data: {
          sessionId: body.sessionId,
          calculationId: 'assay',
          formula: 'assay',
          inputSnapshot: parsed.data as any,
          intermediate: result.steps as any,
          result: result.kadar,
          unit: 'g/L',
          status: 'SUCCESS'
        }
      });
    }

    return apiSuccess(result);
  } catch (error: any) {
    return apiError('SERVER_ERROR', error.message, 500);
  }
}



