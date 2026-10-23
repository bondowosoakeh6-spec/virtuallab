import prisma from '@/lib/prisma';

export interface AuditLogParams {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Logs an action to the AuditLog table
 */
export async function logAudit(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      }
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
