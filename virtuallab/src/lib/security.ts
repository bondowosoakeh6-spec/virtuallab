/**
 * Security Utilities
 * Feature #68: Security Requirements
 *
 * Provides helper functions for input sanitization, password validation,
 * sensitive data redaction, and secure token generation.
 */

import crypto from 'crypto';

/**
 * Strips HTML tags and trims whitespace from input.
 * Prevents XSS via user-submitted content.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '')   // Strip HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

/**
 * Validates password strength.
 * Requirements: min 8 chars, uppercase, lowercase, number, special char.
 */
export function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password harus minimal 8 karakter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung huruf besar' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung huruf kecil' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung angka' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung karakter spesial (!@#$%^&*...)' };
  }
  return { valid: true, message: 'Password kuat' };
}

/**
 * Redacts sensitive fields from an object.
 * Replaces specified keys' values with '***'.
 */
export function redactSensitiveData<T extends Record<string, any>>(
  obj: T,
  keys: string[] = ['password', 'passwordHash', 'token', 'secret', 'apiKey']
): T {
  if (!obj || typeof obj !== 'object') return obj;

  const redacted = { ...obj };
  for (const key of Object.keys(redacted)) {
    if (keys.includes(key)) {
      (redacted as any)[key] = '***';
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      (redacted as any)[key] = redactSensitiveData(redacted[key], keys);
    }
  }
  return redacted;
}

/**
 * Generates a cryptographically secure random hex token.
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validates that a CSRF token matches the expected value.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false;
  if (token.length !== expectedToken.length) return false;

  try {
    const tokenBuf = Buffer.from(token);
    const expectedBuf = Buffer.from(expectedToken);
    return crypto.timingSafeEqual(tokenBuf, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Masks an email address for display (e.g., j***@example.com)
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const maskedLocal = local.charAt(0) + '***';
  return `${maskedLocal}@${domain}`;
}
