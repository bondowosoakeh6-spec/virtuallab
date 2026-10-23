/**
 * Role Authorization Matrix (Item #32)
 * Centralized authorization system for VirtualLab AKUANALIS
 *
 * ADMIN: Full system access
 * INSTRUCTOR: Scoped to own classes/students, read-only on system resources
 * STUDENT: Scoped to own data only
 */

import type { UserRole } from '@/lib/auth-utils';
import { requireAuth } from '@/lib/auth-utils';
import { apiError, ErrorCodes } from '@/lib/api-response';

// ============================================================
// TYPES
// ============================================================

export type Resource =
  | 'users'
  | 'classes'
  | 'modules'
  | 'experiments'
  | 'formulas'
  | 'chemical_database'
  | 'luff_schoorl'
  | 'reports'
  | 'audit_logs'
  | 'system_settings'
  | 'students'
  | 'assignments'
  | 'grades'
  | 'feedback'
  | 'profile'
  | 'sessions'
  | 'submissions';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'list';

export type OwnershipScope = 'all' | 'own' | 'none';

export interface Permission {
  resource: Resource;
  actions: Action[];
  scope: OwnershipScope;
  description?: string;
}

export interface AuthorizationResult {
  allowed: boolean;
  scope: OwnershipScope;
  reason?: string;
}

// ============================================================
// ROLE PERMISSION MATRIX
// ============================================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'list'], scope: 'all', description: 'Full user management' },
    { resource: 'classes', actions: ['create', 'read', 'update', 'delete', 'list'], scope: 'all', description: 'Full class management' },
    { resource: 'modules', actions: ['create', 'read', 'update', 'delete', 'list'], scope: 'all', description: 'Full module management' },
    { resource: 'experiments', actions: ['create', 'read', 'update', 'delete', 'list'], scope: 'all', description: 'Full experiment management' },
    { resource: 'formulas', actions: ['create', 'read', 'update', 'delete', 'list'], scope: 'all', description: 'Controlled update with versioning for system formulas' },
    { resource: 'chemical_database', actions: ['create', 'read', 'update', 'delete', 'list'], scope: 'all', description: 'Full chemical database access' },
    { resource: 'luff_schoorl', actions: ['create', 'read', 'update', 'delete', 'list'], scope: 'all', description: 'Full Luff Schoorl table management' },
    { resource: 'reports', actions: ['create', 'read', 'list'], scope: 'all', description: 'Generate and view all reports' },
    { resource: 'audit_logs', actions: ['read', 'list'], scope: 'all', description: 'View all audit logs' },
    { resource: 'system_settings', actions: ['read', 'update'], scope: 'all', description: 'System configuration' },
    { resource: 'students', actions: ['create', 'read', 'update', 'delete', 'list'], scope: 'all', description: 'Full student management' },
    { resource: 'assignments', actions: ['create', 'read', 'update', 'delete', 'list'], scope: 'all', description: 'Full assignment management' },
    { resource: 'grades', actions: ['create', 'read', 'update', 'delete', 'list'], scope: 'all', description: 'Full grade management' },
    { resource: 'feedback', actions: ['create', 'read', 'update', 'delete', 'list'], scope: 'all', description: 'Full feedback management' },
    { resource: 'submissions', actions: ['read', 'update', 'list'], scope: 'all', description: 'View and manage all submissions' },
    { resource: 'sessions', actions: ['read', 'list'], scope: 'all', description: 'View all experiment sessions' },
    { resource: 'profile', actions: ['read', 'update'], scope: 'all', description: 'View and update any profile' },
  ],

  INSTRUCTOR: [
    { resource: 'classes', actions: ['create', 'read', 'update', 'list'], scope: 'own', description: 'Manage own classes only' },
    { resource: 'students', actions: ['read', 'list'], scope: 'own', description: 'View students in own classes only' },
    { resource: 'experiments', actions: ['create', 'read', 'update', 'list'], scope: 'own', description: 'Manage experiments in own classes' },
    { resource: 'assignments', actions: ['create', 'read', 'update', 'delete', 'list'], scope: 'own', description: 'Manage assignments for own classes' },
    { resource: 'grades', actions: ['create', 'read', 'update', 'list'], scope: 'own', description: 'Grade students in own classes' },
    { resource: 'feedback', actions: ['create', 'read', 'update', 'list'], scope: 'own', description: 'Provide feedback to own students' },
    { resource: 'reports', actions: ['read', 'list'], scope: 'own', description: 'View reports for own classes' },
    { resource: 'submissions', actions: ['read', 'update', 'list'], scope: 'own', description: 'View and grade submissions from own classes' },
    { resource: 'formulas', actions: ['read', 'list'], scope: 'all', description: 'Read-only access to formulas' },
    { resource: 'modules', actions: ['read', 'list'], scope: 'all', description: 'Read-only access to modules' },
    { resource: 'chemical_database', actions: ['read', 'list'], scope: 'all', description: 'Read-only access to chemical database' },
    { resource: 'luff_schoorl', actions: ['read', 'list'], scope: 'all', description: 'Read-only access to Luff Schoorl tables' },
    { resource: 'profile', actions: ['read', 'update'], scope: 'own', description: 'Manage own profile' },
    { resource: 'sessions', actions: ['read', 'list'], scope: 'own', description: 'View sessions from own classes' },
    // Explicitly denied
    // - Cannot modify admin users
    // - Cannot modify audit logs
    // - Cannot delete system formulas without authorization
  ],

  STUDENT: [
    { resource: 'profile', actions: ['read', 'update'], scope: 'own', description: 'View and update own profile' },
    { resource: 'classes', actions: ['read', 'list'], scope: 'own', description: 'View enrolled classes only' },
    { resource: 'experiments', actions: ['read', 'list'], scope: 'own', description: 'View experiments in enrolled classes' },
    { resource: 'sessions', actions: ['create', 'read', 'update', 'list'], scope: 'own', description: 'Manage own experiment sessions' },
    { resource: 'submissions', actions: ['create', 'read', 'update', 'list'], scope: 'own', description: 'Manage own submissions' },
    { resource: 'grades', actions: ['read'], scope: 'own', description: 'View own grades only' },
    { resource: 'modules', actions: ['read', 'list'], scope: 'all', description: 'Read module content' },
    { resource: 'chemical_database', actions: ['read', 'list'], scope: 'all', description: 'Read-only access to chemical database' },
    { resource: 'luff_schoorl', actions: ['read', 'list'], scope: 'all', description: 'Read-only access to Luff Schoorl tables' },
    // Explicitly denied:
    // - Cannot view other students' submissions
    // - Cannot modify grades
    // - Cannot modify formulas
    // - Cannot access admin API (users, audit_logs, system_settings)
  ],
};

// ============================================================
// EXPLICIT DENIALS — actions that must never be allowed
// ============================================================

interface Denial {
  role: UserRole;
  resource: Resource;
  actions: Action[];
  reason: string;
}

const EXPLICIT_DENIALS: Denial[] = [
  { role: 'INSTRUCTOR', resource: 'users', actions: ['create', 'update', 'delete'], reason: 'Instructors cannot modify user accounts' },
  { role: 'INSTRUCTOR', resource: 'audit_logs', actions: ['create', 'update', 'delete'], reason: 'Instructors cannot modify audit logs' },
  { role: 'INSTRUCTOR', resource: 'formulas', actions: ['delete'], reason: 'Instructors cannot delete system formulas without authorization' },
  { role: 'INSTRUCTOR', resource: 'system_settings', actions: ['read', 'update'], reason: 'Instructors cannot access system settings' },
  { role: 'STUDENT', resource: 'users', actions: ['create', 'read', 'update', 'delete', 'list'], reason: 'Students cannot access user management' },
  { role: 'STUDENT', resource: 'audit_logs', actions: ['read', 'list'], reason: 'Students cannot access audit logs' },
  { role: 'STUDENT', resource: 'system_settings', actions: ['read', 'update'], reason: 'Students cannot access system settings' },
  { role: 'STUDENT', resource: 'formulas', actions: ['create', 'read', 'update', 'delete', 'list'], reason: 'Students cannot access formulas' },
  { role: 'STUDENT', resource: 'grades', actions: ['create', 'update', 'delete'], reason: 'Students cannot modify grades' },
];

// ============================================================
// AUTHORIZATION FUNCTIONS
// ============================================================

/**
 * Check if a role has permission for a specific resource+action
 */
export function hasPermission(role: UserRole, resource: string, action: string): boolean {
  // Check explicit denials first
  const denied = EXPLICIT_DENIALS.find(
    d => d.role === role && d.resource === resource && d.actions.includes(action as Action)
  );
  if (denied) return false;

  // Check permissions
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.some(
    p => p.resource === resource && p.actions.includes(action as Action)
  );
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check resource access with ownership consideration
 * - scope 'all': any user with the role can access
 * - scope 'own': only the resource owner can access (ownerId must match userId)
 * - scope 'none': no access
 */
export function canAccessResource(
  role: UserRole,
  resource: string,
  action: string,
  ownerId?: string,
  userId?: string
): AuthorizationResult {
  // Check explicit denials first
  const denied = EXPLICIT_DENIALS.find(
    d => d.role === role && d.resource === resource && d.actions.includes(action as Action)
  );
  if (denied) {
    return { allowed: false, scope: 'none', reason: denied.reason };
  }

  // Find matching permission
  const permissions = ROLE_PERMISSIONS[role] || [];
  const perm = permissions.find(
    p => p.resource === resource && p.actions.includes(action as Action)
  );

  if (!perm) {
    return { allowed: false, scope: 'none', reason: `Role ${role} does not have ${action} access to ${resource}` };
  }

  // Check ownership scope
  if (perm.scope === 'own' && ownerId && userId && ownerId !== userId) {
    return { allowed: false, scope: 'own', reason: `Access restricted to own ${resource} only` };
  }

  return { allowed: true, scope: perm.scope };
}

/**
 * Get the ownership scope for a role+resource+action combo
 */
export function getScope(role: UserRole, resource: string, action: string): OwnershipScope {
  const permissions = ROLE_PERMISSIONS[role] || [];
  const perm = permissions.find(
    p => p.resource === resource && p.actions.includes(action as Action)
  );
  return perm?.scope || 'none';
}

/**
 * Middleware-style authorization helper for API routes
 * Usage: const { session, error } = await withAuthorization('formulas', 'update');
 */
export async function withAuthorization(resource: string, action: string) {
  const { session, error } = await requireAuth();
  if (error) return { session: null as any, error };

  const result = canAccessResource(session.user.role, resource, action);
  if (!result.allowed) {
    return {
      session: null as any,
      error: apiError(
        ErrorCodes.FORBIDDEN,
        result.reason || `You do not have permission to ${action} ${resource}`,
        403
      ),
    };
  }

  return { session, error: null };
}

/**
 * Check if a formula operation is allowed based on immutability rules (Item #82)
 */
export function getFormulaAccessLevel(role: UserRole, isSystem: boolean): 'NO_ACCESS' | 'READ_ONLY' | 'CONTROLLED_UPDATE' | 'FULL_ACCESS' {
  if (role === 'STUDENT') return 'NO_ACCESS';
  if (role === 'INSTRUCTOR') return 'READ_ONLY';
  if (role === 'ADMIN') {
    return isSystem ? 'CONTROLLED_UPDATE' : 'FULL_ACCESS';
  }
  return 'NO_ACCESS';
}
