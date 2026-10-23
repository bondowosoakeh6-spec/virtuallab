import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';

/**
 * GET /api/formulas/[id]/versions
 * List all versions of a formula (ADMIN and INSTRUCTOR only)
 */
export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;

    if (session.user.role === 'STUDENT') {
      return apiError(ErrorCodes.FORBIDDEN, 'Students do not have access to formula versions', 403);
    }

    const formula = await prisma.formula.findUnique({
      where: { id: params.id },
      select: { id: true, code: true, name: true, isSystem: true },
    });

    if (!formula) {
      return apiError(ErrorCodes.NOT_FOUND, 'Formula not found', 404);
    }

    const versions = await prisma.formulaVersion.findMany({
      where: { formulaId: params.id },
      orderBy: { version: 'desc' },
    });

    return apiSuccess({
      formula: {
        id: formula.id,
        code: formula.code,
        name: formula.name,
        isSystem: formula.isSystem,
      },
      versions,
      totalVersions: versions.length,
    });
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Failed to fetch formula versions', 500);
  }
}
