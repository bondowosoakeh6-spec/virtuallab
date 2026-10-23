import { CalculationResult } from '../types';
import { displayValue } from '../rounding';

export const CARBOHYDRATE_CONVERSION_FACTORS: Record<string, number> = { 'Pati': 0.90, 'Sukrosa': 0.95 };

export interface LuffCarbohydrateInput { glucose_pct: number; jenis_sampel: string; }

export function calculateLuffCarbohydrate(input: LuffCarbohydrateInput): CalculationResult {
  const ts = new Date().toISOString();
  const key = Object.keys(CARBOHYDRATE_CONVERSION_FACTORS).find(k => k.toLowerCase() === input.jenis_sampel.trim().toLowerCase());
  const cf = key ? CARBOHYDRATE_CONVERSION_FACTORS[key] : 1;
  const pct = input.glucose_pct * cf;
  const warnings = !key ? [`Jenis sampel '${input.jenis_sampel}' tidak ditemukan, menggunakan faktor 1.0`] : [];
  return {
    calculationId: `lcarbo_${Date.now()}`, status: 'SUCCESS', result: pct, unit: '%',
    formula: '%Karbohidrat = %Glukosa × Faktor Konversi',
    formulaDisplay: `%Karbohidrat\n= %Glukosa × Faktor Konversi\n= ${displayValue(input.glucose_pct,4)} × ${displayValue(cf,2)}\n= ${displayValue(pct,4)}%`,
    intermediate: { conversion_factor: {value:cf,unit:''}, glucose_pct: {value:input.glucose_pct,unit:'%'} },
    steps: [{id:'LCARBO-001', name:'Konversi Karbohidrat', formula:'%Karbo = %Glu × CF', formulaDisplay:`= ${displayValue(input.glucose_pct,4)} × ${displayValue(cf,2)} = ${displayValue(pct,4)}%`, inputs:{glucose_pct:input.glucose_pct,CF:cf}, result:pct, unit:'%'}],
    formulaVersion: 1, warnings, errors: [],
    traceability: { formulaId: 'LUFF-CARBO-001', sourceWorkbook: 'Luff Schoorl', sourceSheet: 'karbo', sourceCells: ['C121','D122'], timestamp: ts },
  };
}
