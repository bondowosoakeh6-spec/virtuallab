import { NextRequest } from 'next/server';
import { apiSuccess, apiError, apiPaginated, ErrorCodes } from '@/lib/api-response';
import { requireAuth, requireRole } from '@/lib/auth-utils';
import { withAuthorization, getFormulaAccessLevel } from '@/lib/authorization';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';

/**
 * GET /api/formulas
 * List formulas with their versions and module info
 * ADMIN: full access
 * INSTRUCTOR: read-only access
 * STUDENT: no access (403)
 */
export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    // Students cannot access formulas
    if (session.user.role === 'STUDENT') {
      return apiError(ErrorCodes.FORBIDDEN, 'Students do not have access to formula management', 403);
    }

    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get('moduleId');
    const search = searchParams.get('search');
    const isSystem = searchParams.get('isSystem');
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};
    if (moduleId) where.moduleId = moduleId;
    if (isSystem !== null && isSystem !== undefined && isSystem !== '') {
      where.isSystem = isSystem === 'true';
    }
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { expression: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [formulas, total] = await Promise.all([
      prisma.formula.findMany({
        where,
        skip,
        take: limit,
        include: {
          module: { select: { id: true, name: true, category: true } },
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
            select: { id: true, version: true, expression: true, createdAt: true },
          },
          _count: { select: { versions: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.formula.count({ where }),
    ]);

    // Augment with access level info
    const result = formulas.map(f => ({
      ...f,
      accessLevel: getFormulaAccessLevel(session.user.role, f.isSystem),
      latestVersion: f.versions[0] || null,
      versionCount: f._count.versions,
    }));

    return apiPaginated(result, total, page, limit);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Failed to fetch formulas', 500);
  }
}

/**
 * POST /api/formulas
 * Create a new formula (ADMIN only)
 * Also creates FormulaVersion v1
 */
export async function POST(req: NextRequest) {
  try {
    const { session, error } = await withAuthorization('formulas', 'create');
    if (error) return error;

    // Only ADMIN can create formulas
    if (session.user.role !== 'ADMIN') {
      return apiError(ErrorCodes.FORBIDDEN, 'Only administrators can create formulas', 403);
    }

    const body = await req.json();
    const { code, name, description, expression, unit, moduleId, sourceFile, sourceSheet, sourceCell, isSystem } = body;

    // Validate required fields
    if (!code || !name || !expression || !moduleId) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'code, name, expression, and moduleId are required', 400);
    }

    // Check for duplicate code
    const existing = await prisma.formula.findUnique({ where: { code } });
    if (existing) {
      return apiError(ErrorCodes.CONFLICT, `Formula with code '${code}' already exists`, 409);
    }

    // Check module exists
    const module = await prisma.labModule.findUnique({ where: { id: moduleId } });
    if (!module) {
      return apiError(ErrorCodes.NOT_FOUND, 'Module not found', 404);
    }

    // Create formula and initial version in a transaction
    const formula = await prisma.$transaction(async (tx) => {
      const newFormula = await tx.formula.create({
        data: {
          code,
          name,
          description: description || null,
          expression,
          unit: unit || null,
          moduleId,
          sourceFile: sourceFile || null,
          sourceSheet: sourceSheet || null,
          sourceCell: sourceCell || null,
          isSystem: isSystem !== undefined ? Boolean(isSystem) : true,
          isActive: true,
        },
      });

      // Create version 1
      await tx.formulaVersion.create({
        data: {
          formulaId: newFormula.id,
          version: 1,
          expression,
          sourceCell: sourceCell || null,
          sourceFormula: expression,
        },
      });

      return newFormula;
    });

    await logAudit({
      userId: session.user.id,
      action: 'CREATE_FORMULA',
      entity: 'Formula',
      entityId: formula.id,
      metadata: { code, name, isSystem: formula.isSystem },
    });

    // Fetch with versions included
    const result = await prisma.formula.findUnique({
      where: { id: formula.id },
      include: {
        module: { select: { id: true, name: true, category: true } },
        versions: { orderBy: { version: 'desc' } },
      },
    });

    return apiSuccess(result, undefined, 201);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Failed to create formula', 500);
  }
}
