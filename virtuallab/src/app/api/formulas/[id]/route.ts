import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { getFormulaAccessLevel } from '@/lib/authorization';
import { logAudit } from '@/lib/audit';
import { AuditAction, AuditEntity } from '@/lib/audit-actions';
import prisma from '@/lib/prisma';

/**
 * GET /api/formulas/[id]
 * Get a single formula with all versions
 */
export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;

    if (session.user.role === 'STUDENT') {
      return apiError(ErrorCodes.FORBIDDEN, 'Students do not have access to formulas', 403);
    }

    const formula = await prisma.formula.findUnique({
      where: { id: params.id },
      include: {
        module: { select: { id: true, name: true, category: true } },
        versions: { orderBy: { version: 'desc' } },
      },
    });

    if (!formula) {
      return apiError(ErrorCodes.NOT_FOUND, 'Formula not found', 404);
    }

    const accessLevel = getFormulaAccessLevel(session.user.role, formula.isSystem);

    return apiSuccess({ ...formula, accessLevel });
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Failed to fetch formula', 500);
  }
}

/**
 * PATCH /api/formulas/[id]
 * Update a formula (ADMIN only)
 *
 * FORMULA IMMUTABILITY (Item #82):
 * - If isSystem === true (formula from workbook):
 *   - DO NOT overwrite expression
 *   - Create a NEW FormulaVersion
 *   - Update formula expression to the new value
 *   - Audit log with old and new expression
 * - If isSystem === false:
 *   - Allow direct update
 */
export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;

    if (session.user.role !== 'ADMIN') {
      return apiError(ErrorCodes.FORBIDDEN, 'Only administrators can update formulas', 403);
    }

    const formula = await prisma.formula.findUnique({
      where: { id: params.id },
      include: {
        versions: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!formula) {
      return apiError(ErrorCodes.NOT_FOUND, 'Formula not found', 404);
    }

    const body = await req.json();
    const { name, description, expression, unit, sourceCell, isActive } = body;

    const accessLevel = getFormulaAccessLevel(session.user.role, formula.isSystem);

    if (formula.isSystem && accessLevel === 'CONTROLLED_UPDATE') {
      // SYSTEM FORMULA — immutable update with versioning
      if (expression && expression !== formula.expression) {
        const latestVersion = formula.versions[0]?.version || 0;
        const newVersionNumber = latestVersion + 1;
        const oldExpression = formula.expression;

        const updatedFormula = await prisma.$transaction(async (tx) => {
          // Create new version — preserve the old expression
          await tx.formulaVersion.create({
            data: {
              formulaId: formula.id,
              version: newVersionNumber,
              expression: expression,
              sourceCell: sourceCell || formula.sourceCell,
              sourceFormula: oldExpression,  // Keep original as reference
            },
          });

          // Update the formula's current expression
          return tx.formula.update({
            where: { id: params.id },
            data: {
              expression,
              ...(name ? { name } : {}),
              ...(description !== undefined ? { description } : {}),
              ...(unit !== undefined ? { unit } : {}),
              ...(sourceCell ? { sourceCell } : {}),
              ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
            },
          });
        });

        await logAudit({
          userId: session.user.id,
          action: 'UPDATE_SYSTEM_FORMULA',
          entity: 'Formula',
          entityId: formula.id,
          metadata: {
            formulaCode: formula.code,
            oldExpression,
            newExpression: expression,
            newVersion: newVersionNumber,
            immutableUpdate: true,
          },
        });

        await logAudit({
          userId: session.user.id,
          action: AuditAction.CHANGE_FORMULA,
          entity: AuditEntity.FORMULA,
          entityId: formula.id,
          metadata: {
            formulaCode: formula.code,
            oldExpression,
            newExpression: expression,
            version: newVersionNumber,
          },
        });

        // Return with full versions
        const result = await prisma.formula.findUnique({
          where: { id: params.id },
          include: {
            module: { select: { id: true, name: true, category: true } },
            versions: { orderBy: { version: 'desc' } },
          },
        });

        return apiSuccess({ ...result, accessLevel, versionCreated: newVersionNumber });
      }

      // Non-expression update on system formula (name, description, etc.)
      const updated = await prisma.formula.update({
        where: { id: params.id },
        data: {
          ...(name ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(unit !== undefined ? { unit } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        },
        include: {
          module: { select: { id: true, name: true, category: true } },
          versions: { orderBy: { version: 'desc' } },
        },
      });

      return apiSuccess({ ...updated, accessLevel });
    }

    // NON-SYSTEM FORMULA — direct update allowed
    const updated = await prisma.formula.update({
      where: { id: params.id },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(expression ? { expression } : {}),
        ...(unit !== undefined ? { unit } : {}),
        ...(sourceCell ? { sourceCell } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
      include: {
        module: { select: { id: true, name: true, category: true } },
        versions: { orderBy: { version: 'desc' } },
      },
    });

    await logAudit({
      userId: session.user.id,
      action: 'UPDATE_FORMULA',
      entity: 'Formula',
      entityId: formula.id,
      metadata: { formulaCode: formula.code, changes: body },
    });

    await logAudit({
      userId: session.user.id,
      action: AuditAction.CHANGE_FORMULA,
      entity: AuditEntity.FORMULA,
      entityId: formula.id,
      metadata: { formulaCode: formula.code, changes: body },
    });

    return apiSuccess({ ...updated, accessLevel });
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Failed to update formula', 500);
  }
}

/**
 * DELETE /api/formulas/[id]
 * Delete a formula (ADMIN only, cannot delete system formulas)
 */
export async function DELETE(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;

    if (session.user.role !== 'ADMIN') {
      return apiError(ErrorCodes.FORBIDDEN, 'Only administrators can delete formulas', 403);
    }

    const formula = await prisma.formula.findUnique({ where: { id: params.id } });
    if (!formula) {
      return apiError(ErrorCodes.NOT_FOUND, 'Formula not found', 404);
    }

    if (formula.isSystem) {
      return apiError(
        ErrorCodes.FORBIDDEN,
        'System formulas cannot be deleted. Deactivate instead by setting isActive to false.',
        403
      );
    }

    await prisma.formula.delete({ where: { id: params.id } });

    await logAudit({
      userId: session.user.id,
      action: 'DELETE_FORMULA',
      entity: 'Formula',
      entityId: params.id,
      metadata: { formulaCode: formula.code, formulaName: formula.name },
    });

    return apiSuccess({ deleted: true, id: params.id });
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Failed to delete formula', 500);
  }
}
