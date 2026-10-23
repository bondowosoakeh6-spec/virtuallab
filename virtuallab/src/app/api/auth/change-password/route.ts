import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { changePasswordSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const validatedData = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return apiError(ErrorCodes.NOT_FOUND, 'User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return apiError(ErrorCodes.INVALID_INPUT, 'Incorrect current password', 400);
    }

    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });

    await logAudit({ userId: user.id, action: 'PASSWORD_CHANGE', entity: 'User', entityId: user.id });

    return apiSuccess({ message: 'Password updated successfully' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return apiError(ErrorCodes.VALIDATION_ERROR, error.errors[0].message, 400);
    }
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}
