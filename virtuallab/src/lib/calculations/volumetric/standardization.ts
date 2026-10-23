import { CalculationResult, CalculationStep, CalculationTraceability } from '../types';
import { safeDivide } from '../validation';
import { displayValue } from '../rounding';

export interface StandardizationInput {
  volume_y: number;
  konsentrasi_y: number;
  simplo_awal: number;
  simplo_akhir: number;
  duplo_awal: number;
  duplo_akhir: number;
}

export function calculateStandardization(input: StandardizationInput): CalculationResult {
  const steps: CalculationStep[] = [];
  const ts = new Date().toISOString();

  const vol_s = input.simplo_akhir - input.simplo_awal;
  const vol_d = input.duplo_akhir - input.duplo_awal;
  const vol_avg = (vol_s + vol_d) / 2;
  const cx = safeDivide(input.volume_y * input.konsentrasi_y, vol_avg);

  steps.push(
    { id: 'STD-001', name: 'Volume Simplo', formula: 'V = Akhir - Awal', formulaDisplay: `= ${displayValue(input.simplo_akhir,4)} - ${displayValue(input.simplo_awal,4)} = ${displayValue(vol_s,4)} mL`, inputs: { akhir: input.simplo_akhir, awal: input.simplo_awal }, result: vol_s, unit: 'mL' },
    { id: 'STD-002', name: 'Volume Duplo', formula: 'V = Akhir - Awal', formulaDisplay: `= ${displayValue(input.duplo_akhir,4)} - ${displayValue(input.duplo_awal,4)} = ${displayValue(vol_d,4)} mL`, inputs: { akhir: input.duplo_akhir, awal: input.duplo_awal }, result: vol_d, unit: 'mL' },
    { id: 'STD-003', name: 'Volume Rata-rata', formula: 'V_avg = AVERAGE(simplo, duplo)', formulaDisplay: `= AVERAGE(${displayValue(vol_s,4)}, ${displayValue(vol_d,4)}) = ${displayValue(vol_avg,4)} mL`, inputs: { simplo: vol_s, duplo: vol_d }, result: vol_avg, unit: 'mL' },
    { id: 'STD-004', name: 'Konsentrasi X', formula: 'Cx = (Vy × Cy) / Vx_avg', formulaDisplay: `Konsentrasi X\n= (Vy × Cy) / Vx_avg\n= (${displayValue(input.volume_y,4)} × ${displayValue(input.konsentrasi_y,4)}) / ${displayValue(vol_avg,4)}\n= ${displayValue(cx,6)} N`, inputs: { Vy: input.volume_y, Cy: input.konsentrasi_y, Vx_avg: vol_avg }, result: cx, unit: 'N' },
  );

  return {
    calculationId: `std_${Date.now()}`, status: 'SUCCESS', result: cx, unit: 'N',
    formula: 'Cx = (Vy × Cy) / Vx_avg',
    formulaDisplay: `Konsentrasi X\n= (Vy × Cy) / Vx_avg\n= (${displayValue(input.volume_y,4)} × ${displayValue(input.konsentrasi_y,4)}) / ${displayValue(vol_avg,4)}\n= ${displayValue(cx,6)} N`,
    intermediate: { volume_simplo: {value: vol_s, unit:'mL'}, volume_duplo: {value: vol_d, unit:'mL'}, volume_avg: {value: vol_avg, unit:'mL'} },
    steps, formulaVersion: 1, warnings: [], errors: [],
    traceability: { formulaId: 'STANDARDIZATION-001', sourceWorkbook: 'Format Analisis Volumetri.xlsx', sourceSheet: 'FORMAT STANDARDISASI', sourceCells: ['F12','G12','F13','G13','H14','P21'], timestamp: ts },
  };
}
