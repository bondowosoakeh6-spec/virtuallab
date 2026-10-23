import { CalculationResult, CalculationStep, CalculationTraceability, InputFieldDescriptor } from '../types';
import { safeDivide, sanitizeNumber } from '../validation';
import { buildFormulaDisplay } from '../formula-display';
import { displayValue } from '../rounding';

export interface MoistureInput {
  bobot_wadah_kosong: number;
  bobot_cawan_sampel: number;
  bobot_sampel: number;
  bobot_setelah: number;
}

export const INPUT_FIELDS: InputFieldDescriptor[] = [
  { key: 'bobot_wadah_kosong', label: 'Bobot wadah kosong', unit: 'g', required: true, validation: { min: 0 } },
  { key: 'bobot_cawan_sampel', label: 'Bobot cawan + sampel sebelum dikeringkan', unit: 'g', required: true, validation: { min: 0 } },
  { key: 'bobot_sampel', label: 'Bobot sampel sebelum dikeringkan', unit: 'g', required: true, validation: { min: 0 } },
  { key: 'bobot_setelah', label: 'Bobot wadah + sampel setelah dikeringkan', unit: 'g', required: true, validation: { min: 0 } },
];

export function calculateMoisture(input: MoistureInput): CalculationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const steps: CalculationStep[] = [];
  const ts = new Date().toISOString();

  const w = input.bobot_wadah_kosong;
  const cs = input.bobot_cawan_sampel;
  const s = input.bobot_sampel;
  const a = input.bobot_setelah;

  if (s <= 0) errors.push('Bobot sampel harus > 0');
  if (w < 0 || cs < 0 || a < 0) errors.push('Input tidak boleh negatif');

  if (errors.length > 0) {
    return {
      calculationId: `moisture_${Date.now()}`, status: 'ERROR', result: null, unit: '%',
      formula: 'Kadar Air = (Berat Air / Berat Sampel) × 100', formulaDisplay: '',
      intermediate: {}, steps: [], formulaVersion: 1, warnings, errors,
      traceability: { formulaId: 'MOISTURE-001', sourceWorkbook: 'Format Analisis Proksimat-a adam.xlsx', sourceSheet: 'Format Kadar Air', sourceCells: ['E11','E12','E13','E14','H19','H20','H22','H24'], timestamp: ts },
    };
  }

  // Primary: weight_before = wadah + sampel
  const weight_before = w + s;
  steps.push({ id: 'MOISTURE-001', name: 'Bobot Sebelum Pengeringan', formula: 'H16 = bobot_wadah_kosong + bobot_sampel', formulaDisplay: `= ${displayValue(w,4)} + ${displayValue(s,4)}\n= ${displayValue(weight_before,4)} g`, inputs: { bobot_wadah_kosong: w, bobot_sampel: s }, result: weight_before, unit: 'g' });

  // Primary: berat_air = weight_before - setelah
  const berat_air = weight_before - a;
  steps.push({ id: 'MOISTURE-002', name: 'Berat Air', formula: 'H19 = bobot_sebelum - bobot_setelah', formulaDisplay: `= ${displayValue(weight_before,4)} - ${displayValue(a,4)}\n= ${displayValue(berat_air,4)} g`, inputs: { bobot_sebelum: weight_before, bobot_setelah: a }, result: berat_air, unit: 'g' });

  // Primary: fraction
  const fraction = safeDivide(berat_air, s);
  steps.push({ id: 'MOISTURE-003', name: 'Fraksi Kadar Air', formula: 'H22 = Berat Air / Berat Sampel', formulaDisplay: `= ${displayValue(berat_air,4)} / ${displayValue(s,4)}\n= ${displayValue(fraction,6)}`, inputs: { berat_air, bobot_sampel: s }, result: fraction, unit: '' });

  // Primary: percentage
  const pct = fraction * 100;
  steps.push({ id: 'MOISTURE-004', name: 'Kadar Air (%)', formula: 'H24 = fraksi × 100', formulaDisplay: `Kadar Air\n= Berat Air / Berat Sampel × 100\n= ${displayValue(berat_air,4)} / ${displayValue(s,4)} × 100\n= ${displayValue(pct,2)}%`, inputs: { fraksi: fraction }, result: pct, unit: '%' });

  // Alternative: berat_air_alt = cawan_sampel - setelah
  const berat_air_alt = cs - a;
  const fraction_alt = safeDivide(berat_air_alt, s);
  const pct_alt = fraction_alt * 100;
  steps.push({ id: 'MOISTURE-005', name: 'Berat Air (Alt)', formula: 'H33 = bobot_cawan_sampel - bobot_setelah', formulaDisplay: `= ${displayValue(cs,4)} - ${displayValue(a,4)}\n= ${displayValue(berat_air_alt,4)} g`, inputs: { bobot_cawan_sampel: cs, bobot_setelah: a }, result: berat_air_alt, unit: 'g' });
  steps.push({ id: 'MOISTURE-006', name: 'Kadar Air Alt (%)', formula: 'H38 = (H33/H34) × 100', formulaDisplay: `= ${displayValue(berat_air_alt,4)} / ${displayValue(s,4)} × 100\n= ${displayValue(pct_alt,2)}%`, inputs: { berat_air_alt, bobot_sampel: s }, result: pct_alt, unit: '%' });

  return {
    calculationId: `moisture_${Date.now()}`, status: 'SUCCESS', result: pct, unit: '%',
    formula: 'Kadar Air = (Berat Air / Berat Sampel) × 100',
    formulaDisplay: `Kadar Air\n= Berat Air / Berat Sampel × 100\n= ${displayValue(berat_air,4)} / ${displayValue(s,4)} × 100\n= ${displayValue(pct,2)}%`,
    intermediate: {
      weight_before: { value: weight_before, unit: 'g' },
      berat_air: { value: berat_air, unit: 'g' },
      berat_air_alt: { value: berat_air_alt, unit: 'g' },
      kadar_air_alt: { value: pct_alt, unit: '%' },
    },
    steps, formulaVersion: 1, warnings, errors: [],
    traceability: { formulaId: 'MOISTURE-001', sourceWorkbook: 'Format Analisis Proksimat-a adam.xlsx', sourceSheet: 'Format Kadar Air', sourceCells: ['E11','E12','E13','E14','H19','H20','H22','H24'], timestamp: ts },
  };
}
