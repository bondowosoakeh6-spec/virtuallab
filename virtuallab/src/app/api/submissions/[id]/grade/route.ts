import { NextResponse } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { AuditAction, AuditEntity } from '@/lib/audit-actions';
import prisma from '@/lib/prisma';

/**
 * GET /api/submissions/[id]/grade
 * Get grade for a submission
 */
export async function GET(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireRole(['INSTRUCTOR', 'ADMIN']);
    if (error) return error;

    const grade = await prisma.grade.findUnique({
      where: { submissionId: params.id },
    });

    return apiSuccess(grade);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }
}

/**
 * POST /api/submissions/[id]/grade
 * Grade a submission (Wireframe #40)
 * Body: { preTest, practical, calculation, report, postTest, feedback, allowResubmission? }
 * Total = preTest*0.15 + practical*0.25 + calculation*0.25 + report*0.20 + postTest*0.15
 */
export async function POST(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireRole(['INSTRUCTOR', 'ADMIN']);
    if (error) return error;

    const body = await req.json();
    const { preTest, practical, calculation, report, postTest, feedback, allowResubmission } = body;

    // Validate required fields
    if (preTest == null || practical == null || calculation == null || report == null || postTest == null) {
      return apiError(ErrorCodes.VALIDATION_ERROR, 'All grade components are required', 400);
    }

    // Validate ranges (0-100)
    const components = { preTest, practical, calculation, report, postTest };
    for (const [name, value] of Object.entries(components)) {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 100) {
        return apiError(ErrorCodes.VALIDATION_ERROR, `${name} must be between 0 and 100`, 400);
      }
    }

    // Calculate weighted total (Wireframe #40)
    const total = Number(
      (
        Number(preTest) * 0.15 +
        Number(practical) * 0.25 +
        Number(calculation) * 0.25 +
        Number(report) * 0.20 +
        Number(postTest) * 0.15
      ).toFixed(2)
    );

    // Check if grade already exists
    const existingGrade = await prisma.grade.findUnique({
      where: { submissionId: params.id },
    });

    let grade;
    if (existingGrade) {
      // Update existing grade
      grade = await prisma.grade.update({
        where: { submissionId: params.id },
        data: {
          preTest: Number(preTest),
          practical: Number(practical),
          calculation: Number(calculation),
          report: Number(report),
          postTest: Number(postTest),
          total,
          feedback: feedback || null,
        },
      });
    } else {
      // Create new grade
      grade = await prisma.grade.create({
        data: {
          submissionId: params.id,
          preTest: Number(preTest),
          practical: Number(practical),
          calculation: Number(calculation),
          report: Number(report),
          postTest: Number(postTest),
          total,
          feedback: feedback || null,
        },
      });
    }

    // Update submission status to GRADED
    await prisma.submission.update({
      where: { id: params.id },
      data: {
        status: 'GRADED',
        ...(allowResubmission != null ? { resubmissionAllowed: Boolean(allowResubmission) } : {}),
      },
    });

    await logAudit({
      userId: session!.user.id,
      action: 'GRADE_SUBMISSION',
      entity: 'Submission',
      entityId: params.id,
      metadata: { total, allowResubmission },
    });

    await logAudit({
      userId: session!.user.id,
      action: AuditAction.GRADE,
      entity: AuditEntity.GRADE,
      entityId: grade.id,
      metadata: { submissionId: params.id, total },
    });

    if (feedback) {
      await logAudit({
        userId: session!.user.id,
        action: AuditAction.FEEDBACK,
        entity: AuditEntity.GRADE,
        entityId: grade.id,
        metadata: { submissionId: params.id, feedback },
      });
    }

    return apiSuccess(grade);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Failed to grade', 500);
  }
}

/**
 * PATCH /api/submissions/[id]/grade
 * Update an existing grade
 */
export async function PATCH(req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const { session, error } = await requireRole(['INSTRUCTOR', 'ADMIN']);
    if (error) return error;

    const body = await req.json();

    // Recalculate total if components are provided
    let updateData: any = { ...body };
    if (body.preTest != null && body.practical != null && body.calculation != null && body.report != null && body.postTest != null) {
      updateData.total = Number(
        (
          Number(body.preTest) * 0.15 +
          Number(body.practical) * 0.25 +
          Number(body.calculation) * 0.25 +
          Number(body.report) * 0.20 +
          Number(body.postTest) * 0.15
        ).toFixed(2)
      );
    }

    const grade = await prisma.grade.update({
      where: { submissionId: params.id },
      data: updateData,
    });

    return apiSuccess(grade);
  } catch (error: any) {
    return apiError(ErrorCodes.INTERNAL_ERROR, error.message || 'Failed to update grade', 500);
  }
}
