import { NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { PERIODIC_TABLE } from '@/lib/calculations/engine';

export async function GET(req: Request, { params: paramsPromise }: { params: Promise<{ symbol: string }> }) {
  try {
    const params = await paramsPromise;
    const symbol = params.symbol.toUpperCase();
    const element = PERIODIC_TABLE.find(e => e.symbol === symbol || e.symbol.toUpperCase() === symbol);
    if (!element) {
      return NextResponse.json(apiError('NOT_FOUND', 'Element not found'), { status: 404 });
    }
    return NextResponse.json(apiSuccess(element));
  } catch (error: any) {
    return NextResponse.json(apiError('SERVER_ERROR', error.message), { status: 500 });
  }
}
