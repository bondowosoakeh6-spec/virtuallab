import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { logAudit } from '@/lib/audit';
import { registerSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return apiError(ErrorCodes.CONFLICT, 'Email is already registered', 400);
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          passwordHash,
          role: validatedData.role,
          status: 'ACTIVE'
        }
      });

      if (validatedData.role === 'STUDENT' && validatedData.studentNumber) {
        await tx.student.create({
          data: {
            userId: user.id,
            studentNumber: validatedData.studentNumber,
            program: validatedData.program || '',
            semester: validatedData.semester || 1
          }
        });
      } else if (validatedData.role === 'INSTRUCTOR' && validatedData.employeeNumber) {
        await tx.instructor.create({
          data: {
            userId: user.id,
            employeeNumber: validatedData.employeeNumber,
            expertise: validatedData.expertise || ''
          }
        });
      }

      return user;
    });

    await logAudit({
      userId: result.id,
      action: 'USER_REGISTER',
      entity: 'User',
      entityId: result.id,
      metadata: { email: result.email, role: result.role }
    });

    const { passwordHash: _, ...userData } = result;

    return apiSuccess(userData, undefined, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return apiError(ErrorCodes.VALIDATION_ERROR, error.errors[0].message, 400);
    }
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}
