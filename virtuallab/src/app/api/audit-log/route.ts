import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getAuthSession } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { ALL_AUDIT_ACTIONS } from '@/lib/audit-actions';

/**
 * GET /api/audit-log
 * Admin only — fetch audit logs with pagination, filtering, and search
 * Feature #67: Audit Log
 *
 * Query params:
 *   - limit (default 50, max 200)
 *   - page (default 1)
 *   - action (filter by action type, e.g. LOGIN, SUBMIT)
 *   - userId (filter by user ID)
 *   - entity (filter by entity type)
 *   - from (ISO date string, filter logs after this date)
 *   - to (ISO date string, filter logs before this date)
 *   - search (search in action or entity fields)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return apiError('UNAUTHORIZED', 'Authentication required', 401);
    if (session.user.role !== 'ADMIN') return apiError('FORBIDDEN', 'Admin access required', 403);

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const skip = (page - 1) * limit;

    // Build filter conditions
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const entity = searchParams.get('entity');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const search = searchParams.get('search');

    const where: any = {};

    if (action && ALL_AUDIT_ACTIONS.includes(action as any)) {
      where.action = action;
    }

    if (userId) {
      where.userId = userId;
    }

    if (entity) {
      where.entity = entity;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entity: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        take: limit,
        skip,
        include: { user: { select: { name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Also return available actions for filter dropdowns
    return apiSuccess(logs, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      availableActions: ALL_AUDIT_ACTIONS,
    });
  } catch (error) {
    return apiError('INTERNAL_ERROR', 'Failed to fetch audit logs', 500);
  }
}
