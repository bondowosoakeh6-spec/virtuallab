import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ============================================================
// RATE LIMITING — In-memory store (per-process)
// For production, use Redis or similar distributed store
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

// Auth endpoints get stricter limits
const AUTH_RATE_LIMIT_MAX = 10;
const AUTH_RATE_LIMIT_WINDOW_MS = 60000;

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  return ip;
}

function checkRateLimit(key: string, maxRequests: number, windowMs: number): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  return { allowed: entry.count <= maxRequests, remaining, resetAt: entry.resetAt };
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) rateLimitStore.delete(key);
    }
  }, 300000);
}

// ============================================================
// MIDDLEWARE
// ============================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ----------------------------------------------------------
  // 1. SECURITY HEADERS (applied to all responses)
  // ----------------------------------------------------------
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // ----------------------------------------------------------
  // 2. RATE LIMITING for API routes
  // ----------------------------------------------------------
  if (pathname.startsWith('/api/')) {
    const clientKey = getRateLimitKey(request);

    // Auth endpoints get stricter limits
    const isAuthRoute = pathname.startsWith('/api/auth/');
    const maxReqs = isAuthRoute ? AUTH_RATE_LIMIT_MAX : RATE_LIMIT_MAX_REQUESTS;
    const windowMs = isAuthRoute ? AUTH_RATE_LIMIT_WINDOW_MS : RATE_LIMIT_WINDOW_MS;

    const rateKey = `${clientKey}:${isAuthRoute ? 'auth' : 'api'}`;
    const { allowed, remaining, resetAt } = checkRateLimit(rateKey, maxReqs, windowMs);

    response.headers.set('X-RateLimit-Limit', maxReqs.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(resetAt).toISOString());

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': maxReqs.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetAt).toISOString(),
          },
        }
      );
    }
  }

  // ----------------------------------------------------------
  // 3. ROLE-BASED API PROTECTION (Authorization Matrix #32)
  // ----------------------------------------------------------
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      const role = token.role as string;
      const method = request.method;

      // Admin-only routes
      const adminOnlyRoutes = ['/api/audit-log', '/api/system-settings'];
      if (adminOnlyRoutes.some(r => pathname.startsWith(r)) && role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
          { status: 403 }
        );
      }

      // Users API — only ADMIN can access (GET also restricted)
      if (pathname.startsWith('/api/users') && role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
          { status: 403 }
        );
      }

      // Formulas API — mutation restricted to ADMIN
      if (pathname.startsWith('/api/formulas') && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) && role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Only administrators can modify formulas' } },
          { status: 403 }
        );
      }

      // Students cannot access formula management at all
      if (pathname.startsWith('/api/formulas') && role === 'STUDENT') {
        return NextResponse.json(
          { success: false, data: null, error: { code: 'FORBIDDEN', message: 'Students do not have access to formulas' } },
          { status: 403 }
        );
      }
    }
  }

  // ----------------------------------------------------------
  // 4. AUTH GUARD for dashboard routes
  // ----------------------------------------------------------
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ],
};
