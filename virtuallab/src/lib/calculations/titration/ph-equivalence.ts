import { CalculationResult } from '../types';
import { displayValue } from '../rounding';

export interface PhEquivalenceInput { ka: number; konsentrasi_y: number; }

export function calculatePhAtEquivalence(input: PhEquivalenceInput): CalculationResult {
  const ts = new Date().toISOString();
  const kb = 1e-14 / input.ka;
  const c_salt = input.konsentrasi_y / 2;
  const poh = -Math.log10(Math.sqrt(kb * c_salt));
  let ph = 14 - poh;
  if (isNaN(ph) || !isFinite(ph)) ph = 7;
  return {
    calculationId: `pheq_${Date.now()}`, status: 'SUCCESS', result: ph, unit: '',
    formula: 'pH = 14 - (-log(√(Kb × C_salt)))',
    formulaDisplay: `pH at equivalence\n= 14 - (-log(√(Kb × C_salt)))\n= 14 - (-log(√(${displayValue(kb,6)} × ${displayValue(c_salt,4)})))\n= ${displayValue(ph,4)}`,
    intermediate: { kb: {value:kb,unit:''}, c_salt: {value:c_salt,unit:'M'} },
    steps: [{ id: 'PH-EQ-001', name: 'pH at equivalence', formula: 'pH = 14 - pOH', formulaDisplay: `= ${displayValue(ph,4)}`, inputs: { Ka: input.ka, Kb: kb }, result: ph, unit: '' }],
    formulaVersion: 1, warnings: [], errors: [],
    traceability: { formulaId: 'PH-EQ-001', sourceWorkbook: 'Format Analisis Volumetri.xlsx', sourceSheet: 'Curve Titration', sourceCells: [], timestamp: ts },
  };
}
