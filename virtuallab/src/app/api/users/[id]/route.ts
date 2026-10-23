import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { updateUserSchema } from '@/lib/validations';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    
    if (session.user.role !== 'ADMIN' && session.user.id !== params.id) {
      return apiError(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        instructor: true
      }
    });

    if (!user) {
      return apiError(ErrorCodes.NOT_FOUND, 'User not found', 404);
    }

    const { passwordHash: _, ...userData } = user;
    return apiSuccess(userData);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}

export async function PATCH(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    
    if (session.user.role !== 'ADMIN' && session.user.id !== params.id) {
      return apiError(ErrorCodes.FORBIDDEN, 'Access denied', 403);
    }

    const body = await req.json();
    const validatedData = updateUserSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: params.id },
      data: validatedData
    });

    await logAudit({ userId: session.user.id, action: 'USER_UPDATE', entity: 'User', entityId: user.id, metadata: { email: user.email } });

    const { passwordHash: _, ...userData } = user;
    return apiSuccess(userData);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return apiError(ErrorCodes.VALIDATION_ERROR, error.errors[0].message, 400);
    }
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireAuth();
    if (error) return error;
    
    if (session.user.role !== 'ADMIN') {
      return apiError(ErrorCodes.FORBIDDEN, 'Admin access required', 403);
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { status: 'INACTIVE' }
    });

    await logAudit({ userId: session.user.id, action: 'USER_DELETE', entity: 'User', entityId: params.id });

    return apiSuccess({ message: 'User deleted successfully' });
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}
