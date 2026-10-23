import { NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { LUFF_SCHOORL_TABLE } from '@/lib/calculations/engine';

export async function GET() {
  try {
    return NextResponse.json(apiSuccess(LUFF_SCHOORL_TABLE));
  } catch (error: any) {
    return NextResponse.json(apiError('SERVER_ERROR', error.message), { status: 500 });
  }
}
