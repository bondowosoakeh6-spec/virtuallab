import { CalculationResult, CalculationStep } from '../types';
import { safeDivide } from '../validation';
import { displayValue } from '../rounding';
import { lookupAtomicMass } from '../chemistry/element-lookup';

export interface AssayInput {
  simplo_awal: number;
  simplo_akhir: number;
  duplo_awal: number;
  duplo_akhir: number;
  unsur_senyawa: string;
  konsentrasi_penitar: number;
  volume_sampel: number;
  faktor_pengenceran: number;
}

export function calculateAssay(input: AssayInput): CalculationResult {
  const ts = new Date().toISOString();
  const steps: CalculationStep[] = [];
  const vol_s = input.simplo_akhir - input.simplo_awal;
  const vol_d = input.duplo_akhir - input.duplo_awal;
  const vol_avg = (vol_s + vol_d) / 2;
  const ar = lookupAtomicMass(input.unsur_senyawa);

  steps.push(
    { id: 'ASSAY-001', name: 'Volume Rata-rata', formula: 'V_avg = AVERAGE(simplo,duplo)', formulaDisplay: `= AVERAGE(${displayValue(vol_s,4)}, ${displayValue(vol_d,4)}) = ${displayValue(vol_avg,4)} mL`, inputs: { simplo: vol_s, duplo: vol_d }, result: vol_avg, unit: 'mL' },
    { id: 'ASSAY-002', name: 'Ar/Mr Lookup', formula: `VLOOKUP(${input.unsur_senyawa}, SPU_KIMIA)`, formulaDisplay: `Ar(${input.unsur_senyawa}) = ${displayValue(ar,4)} g/mol`, inputs: { unsur: input.unsur_senyawa }, result: ar, unit: 'g/mol' },
  );

  const numerator = vol_avg * ar * input.konsentrasi_penitar * input.faktor_pengenceran;
  const kadar = safeDivide(numerator, input.volume_sampel);

  steps.push(
    { id: 'ASSAY-003', name: 'Numerator', formula: 'H27 = V × Ar × C × F', formulaDisplay: `= ${displayValue(vol_avg,4)} × ${displayValue(ar,4)} × ${displayValue(input.konsentrasi_penitar,4)} × ${displayValue(input.faktor_pengenceran,2)} = ${displayValue(numerator,6)}`, inputs: { V: vol_avg, Ar: ar, C: input.konsentrasi_penitar, F: input.faktor_pengenceran }, result: numerator, unit: '' },
    { id: 'ASSAY-004', name: 'Kadar', formula: 'Kadar = numerator / V_sampel', formulaDisplay: `Kadar\n= (V × Ar × C × F) / V_sampel\n= ${displayValue(numerator,6)} / ${displayValue(input.volume_sampel,4)}\n= ${displayValue(kadar,6)} g/L`, inputs: { numerator, V_sampel: input.volume_sampel }, result: kadar, unit: 'g/L' },
  );

  return {
    calculationId: `assay_${Date.now()}`, status: 'SUCCESS', result: kadar, unit: 'g/L',
    formula: 'Kadar = (V × Ar × C × F) / V_sampel',
    formulaDisplay: `Penetapan Kadar\n= (V × Ar/Mr × C_penitar × F_pengenceran) / V_sampel\n= (${displayValue(vol_avg,4)} × ${displayValue(ar,4)} × ${displayValue(input.konsentrasi_penitar,4)} × ${displayValue(input.faktor_pengenceran,2)}) / ${displayValue(input.volume_sampel,4)}\n= ${displayValue(kadar,6)} g/L`,
    intermediate: { volume_avg: {value:vol_avg,unit:'mL'}, ar_mr: {value:ar,unit:'g/mol'}, numerator: {value:numerator,unit:''} },
    steps, formulaVersion: 1, warnings: [], errors: [],
    traceability: { formulaId: 'ASSAY-001', sourceWorkbook: 'Format Analisis Volumetri.xlsx', sourceSheet: 'FORMAT PENETAPAN KADAR', sourceCells: ['H12','H13','H14','E21','H27','H30'], timestamp: ts },
  };
}
