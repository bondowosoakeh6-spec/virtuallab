import { CalculationResult, CalculationStep, CalculationTraceability, InputFieldDescriptor } from '../types';
import { safeDivide, sanitizeNumber } from '../validation';
import { buildFormulaDisplay } from '../formula-display';
import { displayValue } from '../rounding';

export interface AshInput {
  bobot_wadah_kosong: number;
  bobot_cawan_sampel: number;
  bobot_setelah: number;
}

export const INPUT_FIELDS: InputFieldDescriptor[] = [
  { key: 'bobot_wadah_kosong', label: 'Bobot wadah kosong', unit: 'g', required: true, validation: { min: 0 } },
  { key: 'bobot_cawan_sampel', label: 'Bobot cawan + sampel sebelum diabukan', unit: 'g', required: true, validation: { min: 0 } },
  { key: 'bobot_setelah', label: 'Bobot cawan + sampel setelah diabukan', unit: 'g', required: true, validation: { min: 0 } },
];

export function calculateAsh(input: AshInput): CalculationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const steps: CalculationStep[] = [];
  const ts = new Date().toISOString();

  const w = input.bobot_wadah_kosong;
  const cs = input.bobot_cawan_sampel;
  const a = input.bobot_setelah;

  const s = cs - w;
  if (s <= 0) errors.push('Bobot sampel harus > 0 (bobot cawan + sampel harus lebih besar dari bobot wadah)');
  if (w < 0 || cs < 0 || a < 0) errors.push('Input tidak boleh negatif');

  if (errors.length > 0) {
    return {
      calculationId: `ash_${Date.now()}`, status: 'ERROR', result: null, unit: '%',
      formula: 'Kadar Abu = (Bobot Abu / Bobot Sampel) × 100', formulaDisplay: '',
      intermediate: {}, steps: [], formulaVersion: 1, warnings, errors,
      traceability: { formulaId: 'ASH-001', sourceWorkbook: 'Format Analisis Proksimat-a adam.xlsx', sourceSheet: 'Format Kadar Abu', sourceCells: ['E11','E12','E13','H15','H16','H17'], timestamp: ts },
    };
  }

  steps.push({ id: 'ASH-001', name: 'Bobot Sampel', formula: 'bobot_cawan_sampel - bobot_wadah_kosong', formulaDisplay: `= ${displayValue(cs,4)} - ${displayValue(w,4)}\n= ${displayValue(s,4)} g`, inputs: { bobot_cawan_sampel: cs, bobot_wadah_kosong: w }, result: s, unit: 'g' });

  const bobot_abu = a - w;
  steps.push({ id: 'ASH-002', name: 'Bobot Abu', formula: 'bobot_setelah - bobot_wadah_kosong', formulaDisplay: `= ${displayValue(a,4)} - ${displayValue(w,4)}\n= ${displayValue(bobot_abu,4)} g`, inputs: { bobot_setelah: a, bobot_wadah_kosong: w }, result: bobot_abu, unit: 'g' });

  const fraction = safeDivide(bobot_abu, s);
  const pct = fraction * 100;
  
  steps.push({ id: 'ASH-003', name: 'Kadar Abu (%)', formula: '(Bobot Abu / Bobot Sampel) × 100', formulaDisplay: `Kadar Abu\n= Bobot Abu / Bobot Sampel × 100\n= ${displayValue(bobot_abu,4)} / ${displayValue(s,4)} × 100\n= ${displayValue(pct,2)}%`, inputs: { bobot_abu, bobot_sampel: s }, result: pct, unit: '%' });

  return {
    calculationId: `ash_${Date.now()}`, status: 'SUCCESS', result: pct, unit: '%',
    formula: 'Kadar Abu = (Bobot Abu / Bobot Sampel) × 100',
    formulaDisplay: `Kadar Abu\n= Bobot Abu / Bobot Sampel × 100\n= ${displayValue(bobot_abu,4)} / ${displayValue(s,4)} × 100\n= ${displayValue(pct,2)}%`,
    intermediate: {
      bobot_sampel: { value: s, unit: 'g' },
      bobot_abu: { value: bobot_abu, unit: 'g' },
    },
    steps, formulaVersion: 1, warnings, errors: [],
    traceability: { formulaId: 'ASH-001', sourceWorkbook: 'Format Analisis Proksimat-a adam.xlsx', sourceSheet: 'Format Kadar Abu', sourceCells: ['E11','E12','E13','H15','H16','H17'], timestamp: ts },
  };
}
