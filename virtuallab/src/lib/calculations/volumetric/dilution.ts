import { CalculationResult, CalculationStep } from '../types';
import { safeDivide } from '../validation';
import { displayValue } from '../rounding';

export interface DilutionInput {
  v_initial: number;
  v_final: number;
  c_initial?: number;
}

export function calculateDilution(input: DilutionInput): CalculationResult {
  const ts = new Date().toISOString();
  const df = safeDivide(input.v_final, input.v_initial);
  const c_final = input.c_initial ? safeDivide(input.c_initial * input.v_initial, input.v_final) : null;

  return {
    calculationId: `dil_${Date.now()}`, status: 'SUCCESS', result: df, unit: '',
    formula: 'DF = V_final / V_initial',
    formulaDisplay: `Faktor Pengenceran\n= V_final / V_initial\n= ${displayValue(input.v_final,4)} / ${displayValue(input.v_initial,4)}\n= ${displayValue(df,4)}`,
    intermediate: { dilution_factor: {value:df,unit:''}, c_final: {value:c_final,unit:'M'} },
    steps: [{ id: 'DIL-001', name: 'Faktor Pengenceran', formula: 'DF = V_final / V_initial', formulaDisplay: `= ${displayValue(input.v_final,4)} / ${displayValue(input.v_initial,4)} = ${displayValue(df,4)}`, inputs: { V_final: input.v_final, V_initial: input.v_initial }, result: df, unit: '' }],
    formulaVersion: 1, warnings: [], errors: [],
    traceability: { formulaId: 'DILUTION-001', sourceWorkbook: 'General Chemistry', sourceSheet: 'Dilution', sourceCells: [], timestamp: ts },
  };
}
