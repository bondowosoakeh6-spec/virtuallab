import { CalculationResult } from '../types';
import { displayValue } from '../rounding';

export interface PhAfterInput { konsentrasi_x: number; volume_x: number; konsentrasi_y: number; volume_y: number; }

export function calculatePhAfterEquivalence(input: PhAfterInput): CalculationResult {
  const ts = new Date().toISOString();
  const excessMoles = (input.volume_x/1000)*input.konsentrasi_x - (input.volume_y/1000)*input.konsentrasi_y;
  const totalVol = (input.volume_x + input.volume_y) / 1000;
  const excessConc = excessMoles / totalVol;
  let ph = excessConc > 0 ? 14 - (-Math.log10(excessConc)) : 14;
  if (isNaN(ph) || !isFinite(ph)) ph = 14;
  return {
    calculationId: `pha_${Date.now()}`, status: 'SUCCESS', result: ph, unit: '',
    formula: 'pH = 14 - (-log([OH⁻]excess))',
    formulaDisplay: `pH = 14 + log([OH⁻]) = ${displayValue(ph,4)}`,
    intermediate: { excess_conc: {value:excessConc,unit:'M'} },
    steps: [{ id: 'PH-A-001', name: 'pH after eq', formula: 'pH = 14 + log(excess)', formulaDisplay: `pH = ${displayValue(ph,4)}`, inputs: { Vx: input.volume_x, Vy: input.volume_y }, result: ph, unit: '' }],
    formulaVersion: 1, warnings: [], errors: [],
    traceability: { formulaId: 'PH-AFTER-001', sourceWorkbook: 'Format Analisis Volumetri.xlsx', sourceSheet: 'Curve Titration', sourceCells: [], timestamp: ts },
  };
}
