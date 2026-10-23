import { CalculationResult, CalculationStep } from '../types';
import { safeDivide } from '../validation';
import { displayValue } from '../rounding';

export interface ConcentrationInput {
  moles: number;
  volume_L: number;
}

export interface DilutionConcentrationInput {
  c1: number;
  v1: number;
  v2: number;
}

export function calculateConcentration(input: ConcentrationInput): CalculationResult {
  const ts = new Date().toISOString();
  const c = safeDivide(input.moles, input.volume_L);
  return {
    calculationId: `conc_${Date.now()}`, status: 'SUCCESS', result: c, unit: 'M',
    formula: 'C = n / V', formulaDisplay: `C = n / V\n= ${displayValue(input.moles,6)} / ${displayValue(input.volume_L,4)}\n= ${displayValue(c,6)} M`,
    intermediate: { moles: {value: input.moles, unit:'mol'}, volume: {value: input.volume_L, unit:'L'} },
    steps: [{ id: 'CONC-001', name: 'Konsentrasi', formula: 'C = n / V', formulaDisplay: `= ${displayValue(input.moles,6)} / ${displayValue(input.volume_L,4)} = ${displayValue(c,6)} M`, inputs: { n: input.moles, V: input.volume_L }, result: c, unit: 'M' }],
    formulaVersion: 1, warnings: [], errors: [],
    traceability: { formulaId: 'CONCENTRATION-001', sourceWorkbook: 'General Chemistry', sourceSheet: 'Concentration', sourceCells: [], timestamp: ts },
  };
}

export function calculateDilutionConcentration(input: DilutionConcentrationInput): CalculationResult {
  const ts = new Date().toISOString();
  const c2 = safeDivide(input.c1 * input.v1, input.v2);
  return {
    calculationId: `dilconc_${Date.now()}`, status: 'SUCCESS', result: c2, unit: 'M',
    formula: 'C2 = (C1 × V1) / V2', formulaDisplay: `C2 = (C1 × V1) / V2\n= (${displayValue(input.c1,4)} × ${displayValue(input.v1,4)}) / ${displayValue(input.v2,4)}\n= ${displayValue(c2,6)} M`,
    intermediate: { c1: {value:input.c1,unit:'M'}, v1: {value:input.v1,unit:'mL'}, v2: {value:input.v2,unit:'mL'} },
    steps: [{ id: 'DILCONC-001', name: 'Konsentrasi setelah pengenceran', formula: 'C2 = (C1×V1)/V2', formulaDisplay: `= (${displayValue(input.c1,4)} × ${displayValue(input.v1,4)}) / ${displayValue(input.v2,4)} = ${displayValue(c2,6)} M`, inputs: { C1: input.c1, V1: input.v1, V2: input.v2 }, result: c2, unit: 'M' }],
    formulaVersion: 1, warnings: [], errors: [],
    traceability: { formulaId: 'DILUTION-CONC-001', sourceWorkbook: 'General Chemistry', sourceSheet: 'Dilution', sourceCells: [], timestamp: ts },
  };
}
