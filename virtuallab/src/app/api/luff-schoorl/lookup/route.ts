import { NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { lookupLuffSchoorl } from '@/lib/calculations/engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { volume, sugarType } = body;
    if (typeof volume !== 'number' || !sugarType) {
      return NextResponse.json(apiError('VALIDATION_ERROR', 'Missing volume or sugarType'), { status: 400 });
    }
    const result = lookupLuffSchoorl(volume, sugarType);
    return NextResponse.json(apiSuccess(result));
  } catch (error: any) {
    return NextResponse.json(apiError('SERVER_ERROR', error.message), { status: 500 });
  }
}
