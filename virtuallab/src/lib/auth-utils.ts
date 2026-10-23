import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiError, ErrorCodes } from './api-response';

export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Retrieves the typed authentication session
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  return session as AuthSession | null;
}

/**
 * Ensures the user is authenticated, otherwise returns an API error
 */
export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user) {
    return { session: null, error: apiError(ErrorCodes.UNAUTHORIZED, 'Unauthorized access', 401) };
  }
  return { session, error: null };
}

/**
 * Ensures the user has one of the required roles
 */
export async function requireRole(roles: UserRole[]) {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };
  
  if (!roles.includes(session.user.role)) {
    return { session: null, error: apiError(ErrorCodes.FORBIDDEN, 'Forbidden access', 403) };
  }
  return { session, error: null };
}

/**
 * Ensures the user is either the resource owner or has the required role
 */
export async function requireOwnerOrRole(userId: string, roles: UserRole[]) {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };
  
  if (session.user.id !== userId && !roles.includes(session.user.role)) {
    return { session: null, error: apiError(ErrorCodes.FORBIDDEN, 'Forbidden access', 403) };
  }
  return { session, error: null };
}

export function isAdmin(session: AuthSession | null): boolean {
  return session?.user?.role === 'ADMIN';
}

export function isInstructor(session: AuthSession | null): boolean {
  return session?.user?.role === 'INSTRUCTOR';
}

export function isStudent(session: AuthSession | null): boolean {
  return session?.user?.role === 'STUDENT';
}
