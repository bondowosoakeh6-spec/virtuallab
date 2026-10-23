import { NextRequest } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import prisma from '@/lib/prisma';
import { createLabModuleSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;
    const modules = await prisma.labModule.findMany({
      where: { isActive: true },
      include: { _count: { select: { experiments: true } } }
    });
    return apiSuccess(modules);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;
    if (session.user.role !== 'ADMIN') return apiError(ErrorCodes.FORBIDDEN, 'Admin access required', 403);
    const body = await req.json();
    const parsed = createLabModuleSchema.parse(body);
    
    const newModule = await prisma.labModule.create({ data: parsed });
    await logAudit({ userId: session.user.id, action: 'CREATE_LAB_MODULE', entity: 'LabModule', entityId: newModule.id });
    return apiSuccess(newModule, undefined, 201);
  } catch (e) { return apiError(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500); }
}
