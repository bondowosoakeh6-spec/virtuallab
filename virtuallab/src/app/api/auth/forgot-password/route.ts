import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'Email is required', 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      await logAudit({ userId: user.id, action: 'PASSWORD_RESET_REQUEST', entity: 'User', entityId: user.id, metadata: { email } });
      // In a real app, you would send an email here
    }

    // Always return success to prevent email enumeration
    return apiSuccess({ message: 'If the email exists, a reset link has been sent' });
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}
