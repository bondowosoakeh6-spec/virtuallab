import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getAuthSession } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { AuditAction, AuditEntity } from '@/lib/audit-actions';
import {
  calculateMoisture, calculateAsh, calculateProtein,
  calculateCarbohydrate, calculateMolarMass, calculateEquivalentWeight,
  calculateStandardization, calculateKadar, calculateTitrationCurve,
  type MoistureInput, type AshInput, type ProteinInput,
  type CarbohydrateInput, type MolarMassInput, type EquivalentWeightInput,
  type StandardizationInput, type KadarInput, type TitrationCurveInput,
} from '@/lib/calculations/engine';

/**
 * POST /api/calculations
 * Legacy unified calculation endpoint — dispatches by experimentType.
 * Prefer using individual routes: /api/calculations/moisture, /api/calculations/ash, etc.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return apiError('UNAUTHORIZED', 'Authentication required', 401);

    const body = await req.json();
    const { experimentType, input } = body;

    if (!experimentType || !input) {
      return apiError('INVALID_INPUT', 'Missing experimentType or input', 400);
    }

    let result: any;
    switch (experimentType) {
      case 'KADAR_AIR':
        result = calculateMoisture(input as MoistureInput); break;
      case 'KADAR_ABU':
        result = calculateAsh(input as AshInput); break;
      case 'KADAR_PROTEIN':
      case 'KADAR_PROTEIN_STANDARLESS':
        result = calculateProtein(input as ProteinInput); break;
      case 'KARBOHIDRAT':
      case 'KARBOHIDRAT_V2':
        result = calculateCarbohydrate(input as CarbohydrateInput); break;
      case 'MOLAR_MASS':
        result = calculateMolarMass(input as MolarMassInput); break;
      case 'EQUIVALENT_WEIGHT':
        result = calculateEquivalentWeight(input as EquivalentWeightInput); break;
      case 'STANDARDISASI':
        result = calculateStandardization(input as StandardizationInput); break;
      case 'PENETAPAN_KADAR':
        result = calculateKadar(input as KadarInput); break;
      case 'TITRATION_CURVE':
        result = calculateTitrationCurve(input as TitrationCurveInput); break;
      default:
        return apiError('INVALID_INPUT', `Unknown experiment type: ${experimentType}`, 400);
    }

    await logAudit({
      userId: session.user.id,
      action: AuditAction.CALCULATE,
      entity: AuditEntity.CALCULATION,
      metadata: { experimentType },
    });

    return apiSuccess({ experimentType, result });
  } catch (error: any) {
    return apiError('INTERNAL_ERROR', error.message || 'Calculation failed', 500);
  }
}
