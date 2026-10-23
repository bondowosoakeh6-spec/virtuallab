import { CalculationResult, CalculationStep, CalculationTraceability, InputFieldDescriptor } from '../types';
import { safeDivide, sanitizeNumber } from '../validation';
import { buildFormulaDisplay } from '../formula-display';
import { displayValue } from '../rounding';

/**
 * Protein conversion factors by food type
 * Source: Format Kadar Protein!D105:E122
 */
export const PROTEIN_CONVERSION_FACTORS: Record<string, number> = {
  'Bir': 6.25,
  'Daging': 6.25,
  'Gelatin': 5.55,
  'Jagung': 6.25,
  'Kacang Tanah': 5.46,
  'Kacang Kedelai': 5.71,
  'Beras': 5.95,
  'Barley, oats, rye': 5.83,
  'Gandum': 5.83,
  'Wijen': 5.30,
  'Biji Bunga Matahari': 5.30,
  'Kasein': 6.38,
  'Susu': 6.38,
  'Telur': 6.25,
  'Biji-bijian': 5.30,
  'Makanan Laut': 6.25,
  'Tahu': 5.75,
  'Tempe': 5.75,
};

export interface ProteinInput {
  vol_hcl_titrasi: number;
  vol_hcl_blanko: number;
  normalitas_naoh: number;
  vol_naoh_standarisasi: number;
  bobot_oksalat: number;
  bobot_sampel: number;
  vol_labu: number;
  vol_pipet: number;
  fp?: number;
  faktor_konversi: number;
}

export const INPUT_FIELDS: InputFieldDescriptor[] = [
  { key: 'vol_hcl_titrasi', label: 'Volume HCl untuk titrasi sampel', unit: 'mL', required: true, validation: { min: 0 } },
  { key: 'vol_hcl_blanko', label: 'Volume HCl untuk blanko', unit: 'mL', required: true, validation: { min: 0 } },
  { key: 'normalitas_naoh', label: 'Normalitas NaOH (N)', unit: 'N', required: true, validation: { min: 0 } },
  { key: 'vol_naoh_standarisasi', label: 'Volume NaOH standarisasi', unit: 'mL', required: true, validation: { min: 0 } },
  { key: 'bobot_oksalat', label: 'Bobot Asam Oksalat', unit: 'mg', required: true, validation: { min: 0 } },
  { key: 'bobot_sampel', label: 'Bobot sampel', unit: 'mg', required: true, validation: { min: 0 } },
  { key: 'vol_labu', label: 'Volume labu takar', unit: 'mL', required: true, validation: { min: 0 } },
  { key: 'vol_pipet', label: 'Volume pipet', unit: 'mL', required: true, validation: { min: 0 } },
  { key: 'fp', label: 'Faktor Pengenceran (Opsional)', unit: '', required: false, validation: { min: 1 } },
  { key: 'faktor_konversi', label: 'Faktor Konversi Protein', unit: '', required: true, validation: { min: 0 } }
];

export function calculateProtein(input: ProteinInput): CalculationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const steps: CalculationStep[] = [];
  const ts = new Date().toISOString();

  const vt = input.vol_hcl_titrasi;
  const vb = input.vol_hcl_blanko;
  const n_naoh = input.normalitas_naoh;
  const v_naoh = input.vol_naoh_standarisasi;
  const b_oks = input.bobot_oksalat;
  const w = input.bobot_sampel;
  const vl = input.vol_labu;
  const vp = input.vol_pipet;
  const fp_input = input.fp ?? (vp > 0 ? safeDivide(vl, vp) : 1);
  const fk = input.faktor_konversi;

  if (w <= 0) errors.push('Bobot sampel harus > 0');
  if (v_naoh <= 0) errors.push('Volume NaOH standarisasi harus > 0');
  if (vt < 0 || vb < 0) errors.push('Volume titrasi tidak boleh negatif');

  if (errors.length > 0) {
    return {
      calculationId: `protein_${Date.now()}`, status: 'ERROR', result: null, unit: '%',
      formula: 'Kadar Protein = %N × Faktor Konversi', formulaDisplay: '',
      intermediate: {}, steps: [], formulaVersion: 1, warnings, errors,
      traceability: { formulaId: 'PROTEIN-001', sourceWorkbook: 'Format Analisis', sourceSheet: 'Format Kadar Protein', sourceCells: [], timestamp: ts },
    };
  }

  // Normalitas HCl
  const n_hcl = safeDivide(b_oks, v_naoh * 63); // assuming eq weight 63 for oxalic acid for illustration
  steps.push({ id: 'PROT-001', name: 'Normalitas HCl', formula: 'N HCl', formulaDisplay: `= ${displayValue(n_hcl,4)} N`, inputs: { bobot_oksalat: b_oks, v_naoh }, result: n_hcl, unit: 'N' });

  // Nitrogen
  const n_pct = safeDivide((vt - vb) * n_hcl * 14.008 * fp_input * 100, w);
  steps.push({ id: 'PROT-002', name: 'Kadar Nitrogen (%)', formula: '((Vt - Vb) * N * 14.008 * FP / W) * 100', formulaDisplay: `= ${displayValue(n_pct,2)}%`, inputs: { vt, vb, n_hcl, fp: fp_input, w }, result: n_pct, unit: '%' });

  // Protein
  const protein_pct = n_pct * fk;
  steps.push({ id: 'PROT-003', name: 'Kadar Protein (%)', formula: '%N × FK', formulaDisplay: `= ${displayValue(n_pct,4)} × ${displayValue(fk,2)}\n= ${displayValue(protein_pct,2)}%`, inputs: { n_pct, fk }, result: protein_pct, unit: '%' });

  return {
    calculationId: `protein_${Date.now()}`, status: 'SUCCESS', result: protein_pct, unit: '%',
    formula: 'Kadar Protein = %N × Faktor Konversi',
    formulaDisplay: `Kadar Protein\n= %N × FK\n= ${displayValue(protein_pct,2)}%`,
    intermediate: {
      n_hcl: { value: n_hcl, unit: 'N' },
      n_pct: { value: n_pct, unit: '%' }
    },
    steps, formulaVersion: 1, warnings, errors: [],
    traceability: { formulaId: 'PROTEIN-001', sourceWorkbook: 'Format Analisis', sourceSheet: 'Format Kadar Protein', sourceCells: [], timestamp: ts },
  };
}
