import { CalculationResult, CalculationStep, CalculationTraceability, InputFieldDescriptor } from '../types';
import { safeDivide, sanitizeNumber } from '../validation';
import { buildFormulaDisplay } from '../formula-display';
import { displayValue } from '../rounding';
import { lookupLuffSchoorl } from '../luff-schoorl/lookup';

export interface CarbohydrateInput {
  vol_tio_titrasi: number;
  vol_tio_blanko: number;
  normalitas_kio3: number;
  vol_kio3_standarisasi: number;
  bobot_sampel: number;
  vol_labu: number;
  vol_pipet: number;
  fp?: number;
}

export const CARBOHYDRATE_CONVERSION_FACTORS = {
  // example factors
  glucose: 1.0,
  fructose: 1.0
};

export const INPUT_FIELDS: InputFieldDescriptor[] = [
  { key: 'vol_tio_titrasi', label: 'Volume Tio Titrasi', unit: 'mL', required: true, validation: { min: 0 } },
  { key: 'vol_tio_blanko', label: 'Volume Tio Blanko', unit: 'mL', required: true, validation: { min: 0 } },
  { key: 'normalitas_kio3', label: 'Normalitas KIO3', unit: 'N', required: true, validation: { min: 0 } },
  { key: 'vol_kio3_standarisasi', label: 'Volume KIO3', unit: 'mL', required: true, validation: { min: 0 } },
  { key: 'bobot_sampel', label: 'Bobot Sampel', unit: 'mg', required: true, validation: { min: 0 } },
  { key: 'vol_labu', label: 'Volume Labu', unit: 'mL', required: true, validation: { min: 0 } },
  { key: 'vol_pipet', label: 'Volume Pipet', unit: 'mL', required: true, validation: { min: 0 } },
  { key: 'fp', label: 'Faktor Pengenceran (Opsional)', unit: '', required: false, validation: { min: 1 } },
];

export function calculateCarbohydrate(input: CarbohydrateInput): CalculationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const steps: CalculationStep[] = [];
  const ts = new Date().toISOString();

  const v_titrasi = input.vol_tio_titrasi;
  const v_blanko = input.vol_tio_blanko;
  const n_kio3 = input.normalitas_kio3;
  const v_kio3 = input.vol_kio3_standarisasi;
  const w = input.bobot_sampel;
  const vl = input.vol_labu;
  const vp = input.vol_pipet;
  const fp_input = input.fp ?? (vp > 0 ? safeDivide(vl, vp) : 1);

  if (w <= 0) errors.push('Bobot sampel harus > 0');

  if (errors.length > 0) {
    return {
      calculationId: `carbo_${Date.now()}`, status: 'ERROR', result: null, unit: '%',
      formula: 'Kadar Karbohidrat (%) = (W gula × FP / W sampel) × 100', formulaDisplay: '',
      intermediate: {}, steps: [], formulaVersion: 1, warnings, errors,
      traceability: { formulaId: 'CARBO-001', sourceWorkbook: 'Format Analisis', sourceSheet: 'Format Kadar Karbohidrat', sourceCells: [], timestamp: ts },
    };
  }

  // Delta V
  const delta_v = v_blanko - v_titrasi;
  steps.push({ id: 'CARB-001', name: 'Selisih Volume (mL)', formula: 'V blanko - V titrasi', formulaDisplay: `= ${displayValue(v_blanko,4)} - ${displayValue(v_titrasi,4)}\n= ${displayValue(delta_v,4)} mL`, inputs: { v_blanko, v_titrasi }, result: delta_v, unit: 'mL' });

  let result_pct: number | null = null;
  const lookup = lookupLuffSchoorl(delta_v, 'glukosa_fruktosa');
  let w_gula: number | null = null;

  if ('error' in lookup) {
    errors.push(lookup.error as string);
  } else {
    w_gula = lookup.value;
    if (!lookup.isExact) warnings.push('Nilai Luff Schoorl diperoleh melalui interpolasi.');
    
    steps.push({ id: 'CARB-002', name: 'Berat Gula dari Tabel Luff Schoorl (mg)', formula: 'Tabel Luff Schoorl', formulaDisplay: `= ${displayValue(w_gula,4)} mg`, inputs: { delta_v }, result: w_gula, unit: 'mg' });

    result_pct = safeDivide(w_gula! * fp_input * 100, w);
    steps.push({ id: 'CARB-003', name: 'Kadar Karbohidrat (%)', formula: '(W gula × FP / W sampel) × 100', formulaDisplay: `= (${displayValue(w_gula!,4)} × ${displayValue(fp_input,4)} / ${displayValue(w,4)}) × 100\n= ${displayValue(result_pct,2)}%`, inputs: { w_gula: w_gula!, fp: fp_input, w }, result: result_pct, unit: '%' });
  }

  return {
    calculationId: `carbo_${Date.now()}`, status: errors.length > 0 ? 'ERROR' : 'SUCCESS', result: result_pct, unit: '%',
    formula: 'Kadar Karbohidrat (%) = (W gula × FP / W sampel) × 100',
    formulaDisplay: result_pct !== null ? `Kadar Karbohidrat\n= (W gula × FP / W sampel) × 100\n= ${displayValue(result_pct,2)}%` : '',
    intermediate: {
      delta_v: { value: delta_v, unit: 'mL' },
      w_gula: { value: w_gula, unit: 'mg' }
    },
    steps, formulaVersion: 1, warnings, errors,
    traceability: { formulaId: 'CARBO-001', sourceWorkbook: 'Format Analisis', sourceSheet: 'Format Kadar Karbohidrat', sourceCells: [], timestamp: ts },
  };
}
