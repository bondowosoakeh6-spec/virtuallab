import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
  meta?: any;
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED'
} as const;

/**
 * Returns a standardized success response
 */
export function apiSuccess<T>(data: T, meta?: any, status = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    error: null,
    ...(meta ? { meta } : {})
  };
  return NextResponse.json(response, { status });
}

/**
 * Returns a standardized error response
 */
export function apiError(code: string, message: string, status = 400) {
  const response: ApiResponse<null> = {
    success: false,
    data: null,
    error: {
      code,
      message
    }
  };
  return NextResponse.json(response, { status });
}

/**
 * Returns a standardized paginated response
 */
export function apiPaginated<T>(data: T[], total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  const meta = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
  return apiSuccess(data, meta);
}
