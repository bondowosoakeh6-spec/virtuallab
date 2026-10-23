import { CalculationResult } from '../types';
import { displayValue } from '../rounding';

export interface PhBeforeInput { ka: number; konsentrasi_x: number; volume_x: number; konsentrasi_y: number; volume_y: number; }

export function calculatePhBeforeEquivalence(input: PhBeforeInput): CalculationResult {
  const ts = new Date().toISOString();
  let ph: number;
  if (input.volume_x === 0) {
    ph = -Math.log10(Math.sqrt(input.ka * input.konsentrasi_y));
  } else {
    const molesBase = (input.volume_x / 1000) * input.konsentrasi_x;
    const molesAcid = (input.volume_y / 1000) * input.konsentrasi_y;
    const remaining = molesAcid - molesBase;
    if (remaining <= 0) { ph = 7; } else {
      ph = -Math.log10(input.ka) + Math.log10(molesBase / remaining);
    }
  }
  if (isNaN(ph) || !isFinite(ph)) ph = 0;
  return {
    calculationId: `phb_${Date.now()}`, status: 'SUCCESS', result: ph, unit: '',
    formula: 'pH = -log(Ka) + log(CxVx / (CyVy - CxVx))',
    formulaDisplay: `pH = ${displayValue(ph,4)}`,
    intermediate: {}, steps: [{ id: 'PH-B-001', name: 'pH before eq', formula: 'Henderson-Hasselbalch', formulaDisplay: `pH = ${displayValue(ph,4)}`, inputs: { Ka: input.ka, Vx: input.volume_x }, result: ph, unit: '' }],
    formulaVersion: 1, warnings: [], errors: [],
    traceability: { formulaId: 'PH-BEFORE-001', sourceWorkbook: 'Format Analisis Volumetri.xlsx', sourceSheet: 'Curve Titration', sourceCells: [], timestamp: ts },
  };
}
