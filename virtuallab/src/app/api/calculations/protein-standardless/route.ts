import { apiSuccess, apiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { calculateProtein } from '@/lib/calculations/engine';
import { proteinInputSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const parsed = proteinInputSchema.safeParse(body);
    if (!parsed.success) {
      return apiError('VALIDATION_ERROR', 'Invalid input data', 400);
    }
    
    // For standardless, we could pass a flag or the engine might handle it
    const result = calculateProtein({ ...parsed.data, standardless: true } as any);
    
    if (body.sessionId) {
      await prisma.calculationResult.create({
        data: {
          sessionId: body.sessionId,
          calculationId: 'protein-standardless',
          formula: 'protein-standardless',
          inputSnapshot: parsed.data as any,
          intermediate: result.steps as any,
          result: result.protein_pct,
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



