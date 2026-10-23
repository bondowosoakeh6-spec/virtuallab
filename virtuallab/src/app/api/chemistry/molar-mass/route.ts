import { NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { calculateMolarMass } from '@/lib/calculations/engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = calculateMolarMass(body);
    return NextResponse.json(apiSuccess(result));
  } catch (error: any) {
    return NextResponse.json(apiError('SERVER_ERROR', error.message), { status: 500 });
  }
}
