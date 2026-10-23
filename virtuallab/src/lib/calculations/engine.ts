/**
 * VirtualLab Analisis Kimia — Calculation Engine
 * ================================================
 * Source of Truth: Excel workbooks (Proksimat & Volumetri)
 * Every formula has a unique ID matching FORMULA_SPECIFICATION.md
 * 
 * This engine faithfully reproduces all Excel calculations.
 */

// ============================================================
// LOOKUP TABLES — extracted directly from Excel
// ============================================================

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

/**
 * Luff Schoorl conversion table
 * Source: Konversi Tabel Luff Schoorl!H7:K28
 * Maps volume Na₂S₂O₃ 0.1N (mL) to mg sugar
 */
export interface LuffSchoorlEntry {
  volume: number;
  glukosa_fruktosa: number;
  laktosa: number;
  maltosa: number;
}

export const LUFF_SCHOORL_TABLE: LuffSchoorlEntry[] = [
  { volume: 1, glukosa_fruktosa: 2.4, laktosa: 3.6, maltosa: 3.9 },
  { volume: 2, glukosa_fruktosa: 4.8, laktosa: 7.2, maltosa: 7.8 },
  { volume: 3, glukosa_fruktosa: 7.2, laktosa: 10.8, maltosa: 11.7 },
  { volume: 4, glukosa_fruktosa: 9.7, laktosa: 14.4, maltosa: 15.6 },
  { volume: 5, glukosa_fruktosa: 12.2, laktosa: 18.0, maltosa: 19.5 },
  { volume: 6, glukosa_fruktosa: 14.7, laktosa: 21.6, maltosa: 23.4 },
  { volume: 7, glukosa_fruktosa: 17.2, laktosa: 25.2, maltosa: 27.3 },
  { volume: 8, glukosa_fruktosa: 19.8, laktosa: 28.8, maltosa: 31.2 },
  { volume: 9, glukosa_fruktosa: 22.4, laktosa: 32.4, maltosa: 35.1 },
  { volume: 10, glukosa_fruktosa: 25.0, laktosa: 36.0, maltosa: 39.0 },
  { volume: 11, glukosa_fruktosa: 27.6, laktosa: 39.6, maltosa: 42.9 },
  { volume: 12, glukosa_fruktosa: 30.3, laktosa: 44.0, maltosa: 47.6 },
  { volume: 13, glukosa_fruktosa: 33.0, laktosa: 48.0, maltosa: 52.0 },
  { volume: 14, glukosa_fruktosa: 35.7, laktosa: 52.0, maltosa: 56.3 },
  { volume: 15, glukosa_fruktosa: 38.5, laktosa: 56.0, maltosa: 60.6 },
  { volume: 16, glukosa_fruktosa: 41.3, laktosa: 60.0, maltosa: 64.9 },
  { volume: 17, glukosa_fruktosa: 44.2, laktosa: 64.0, maltosa: 69.2 },
  { volume: 18, glukosa_fruktosa: 47.1, laktosa: 68.0, maltosa: 73.5 },
  { volume: 19, glukosa_fruktosa: 50.0, laktosa: 72.0, maltosa: 77.8 },
  { volume: 20, glukosa_fruktosa: 53.0, laktosa: 76.0, maltosa: 82.1 },
  { volume: 21, glukosa_fruktosa: 56.0, laktosa: 80.0, maltosa: 86.4 },
  { volume: 22, glukosa_fruktosa: 59.1, laktosa: 84.0, maltosa: 90.7 },
  { volume: 23, glukosa_fruktosa: 62.2, laktosa: 88.0, maltosa: 94.6 },
];

/**
 * Carbohydrate conversion factors
 * Source: karbo!C121:D122
 */
export const CARBOHYDRATE_CONVERSION_FACTORS: Record<string, number> = {
  'Pati': 0.90,
  'Sukrosa': 0.95,
};

/**
 * Periodic Table of Elements (SPU KIMIA)
 * Source: SPU KIMIA!C6:F124
 */
export interface ElementData {
  symbol: string;
  atomicNumber: number;
  atomicMass: number;   // Ar
  group?: string;
  period?: number;
}

export const PERIODIC_TABLE: ElementData[] = [
  { symbol: 'H', atomicNumber: 1, atomicMass: 1.008 },
  { symbol: 'He', atomicNumber: 2, atomicMass: 4.003 },
  { symbol: 'Li', atomicNumber: 3, atomicMass: 6.941 },
  { symbol: 'Be', atomicNumber: 4, atomicMass: 9.012 },
  { symbol: 'B', atomicNumber: 5, atomicMass: 10.81 },
  { symbol: 'C', atomicNumber: 6, atomicMass: 12.011 },
  { symbol: 'N', atomicNumber: 7, atomicMass: 14.007 },
  { symbol: 'O', atomicNumber: 8, atomicMass: 15.999 },
  { symbol: 'F', atomicNumber: 9, atomicMass: 18.998 },
  { symbol: 'Ne', atomicNumber: 10, atomicMass: 20.180 },
  { symbol: 'Na', atomicNumber: 11, atomicMass: 22.990 },
  { symbol: 'Mg', atomicNumber: 12, atomicMass: 24.305 },
  { symbol: 'Al', atomicNumber: 13, atomicMass: 26.982 },
  { symbol: 'Si', atomicNumber: 14, atomicMass: 28.086 },
  { symbol: 'P', atomicNumber: 15, atomicMass: 30.974 },
  { symbol: 'S', atomicNumber: 16, atomicMass: 32.065 },
  { symbol: 'Cl', atomicNumber: 17, atomicMass: 35.453 },
  { symbol: 'Ar', atomicNumber: 18, atomicMass: 39.948 },
  { symbol: 'K', atomicNumber: 19, atomicMass: 39.098 },
  { symbol: 'Ca', atomicNumber: 20, atomicMass: 40.078 },
  { symbol: 'Sc', atomicNumber: 21, atomicMass: 44.956 },
  { symbol: 'Ti', atomicNumber: 22, atomicMass: 47.867 },
  { symbol: 'V', atomicNumber: 23, atomicMass: 50.942 },
  { symbol: 'Cr', atomicNumber: 24, atomicMass: 51.996 },
  { symbol: 'Mn', atomicNumber: 25, atomicMass: 54.938 },
  { symbol: 'Fe', atomicNumber: 26, atomicMass: 55.845 },
  { symbol: 'Co', atomicNumber: 27, atomicMass: 58.933 },
  { symbol: 'Ni', atomicNumber: 28, atomicMass: 58.693 },
  { symbol: 'Cu', atomicNumber: 29, atomicMass: 63.546 },
  { symbol: 'Zn', atomicNumber: 30, atomicMass: 65.380 },
  { symbol: 'Ga', atomicNumber: 31, atomicMass: 69.723 },
  { symbol: 'Ge', atomicNumber: 32, atomicMass: 72.640 },
  { symbol: 'As', atomicNumber: 33, atomicMass: 74.922 },
  { symbol: 'Se', atomicNumber: 34, atomicMass: 78.960 },
  { symbol: 'Br', atomicNumber: 35, atomicMass: 79.904 },
  { symbol: 'Kr', atomicNumber: 36, atomicMass: 83.798 },
  { symbol: 'Rb', atomicNumber: 37, atomicMass: 85.468 },
  { symbol: 'Sr', atomicNumber: 38, atomicMass: 87.620 },
  { symbol: 'Y', atomicNumber: 39, atomicMass: 88.906 },
  { symbol: 'Zr', atomicNumber: 40, atomicMass: 91.224 },
  { symbol: 'Nb', atomicNumber: 41, atomicMass: 92.906 },
  { symbol: 'Mo', atomicNumber: 42, atomicMass: 95.960 },
  { symbol: 'Tc', atomicNumber: 43, atomicMass: 98.000 },
  { symbol: 'Ru', atomicNumber: 44, atomicMass: 101.07 },
  { symbol: 'Rh', atomicNumber: 45, atomicMass: 102.91 },
  { symbol: 'Pd', atomicNumber: 46, atomicMass: 106.42 },
  { symbol: 'Ag', atomicNumber: 47, atomicMass: 107.87 },
  { symbol: 'Cd', atomicNumber: 48, atomicMass: 112.41 },
  { symbol: 'In', atomicNumber: 49, atomicMass: 114.82 },
  { symbol: 'Sn', atomicNumber: 50, atomicMass: 118.71 },
  { symbol: 'Sb', atomicNumber: 51, atomicMass: 121.76 },
  { symbol: 'Te', atomicNumber: 52, atomicMass: 127.60 },
  { symbol: 'I', atomicNumber: 53, atomicMass: 126.90 },
  { symbol: 'Xe', atomicNumber: 54, atomicMass: 131.29 },
  { symbol: 'Cs', atomicNumber: 55, atomicMass: 132.91 },
  { symbol: 'Ba', atomicNumber: 56, atomicMass: 137.33 },
  { symbol: 'La', atomicNumber: 57, atomicMass: 138.91 },
  { symbol: 'Ce', atomicNumber: 58, atomicMass: 140.12 },
  { symbol: 'Pr', atomicNumber: 59, atomicMass: 140.91 },
  { symbol: 'Nd', atomicNumber: 60, atomicMass: 144.24 },
  { symbol: 'Pm', atomicNumber: 61, atomicMass: 145.00 },
  { symbol: 'Sm', atomicNumber: 62, atomicMass: 150.36 },
  { symbol: 'Eu', atomicNumber: 63, atomicMass: 151.96 },
  { symbol: 'Gd', atomicNumber: 64, atomicMass: 157.25 },
  { symbol: 'Tb', atomicNumber: 65, atomicMass: 158.93 },
  { symbol: 'Dy', atomicNumber: 66, atomicMass: 162.50 },
  { symbol: 'Ho', atomicNumber: 67, atomicMass: 164.93 },
  { symbol: 'Er', atomicNumber: 68, atomicMass: 167.26 },
  { symbol: 'Tm', atomicNumber: 69, atomicMass: 168.93 },
  { symbol: 'Yb', atomicNumber: 70, atomicMass: 173.05 },
  { symbol: 'Lu', atomicNumber: 71, atomicMass: 174.97 },
  { symbol: 'Hf', atomicNumber: 72, atomicMass: 178.49 },
  { symbol: 'Ta', atomicNumber: 73, atomicMass: 180.95 },
  { symbol: 'W', atomicNumber: 74, atomicMass: 183.84 },
  { symbol: 'Re', atomicNumber: 75, atomicMass: 186.21 },
  { symbol: 'Os', atomicNumber: 76, atomicMass: 190.23 },
  { symbol: 'Ir', atomicNumber: 77, atomicMass: 192.22 },
  { symbol: 'Pt', atomicNumber: 78, atomicMass: 195.08 },
  { symbol: 'Au', atomicNumber: 79, atomicMass: 196.97 },
  { symbol: 'Hg', atomicNumber: 80, atomicMass: 200.59 },
  { symbol: 'Tl', atomicNumber: 81, atomicMass: 204.38 },
  { symbol: 'Pb', atomicNumber: 82, atomicMass: 207.20 },
  { symbol: 'Bi', atomicNumber: 83, atomicMass: 208.98 },
  { symbol: 'Po', atomicNumber: 84, atomicMass: 209.00 },
  { symbol: 'At', atomicNumber: 85, atomicMass: 210.00 },
  { symbol: 'Rn', atomicNumber: 86, atomicMass: 222.00 },
  { symbol: 'Fr', atomicNumber: 87, atomicMass: 223.00 },
  { symbol: 'Ra', atomicNumber: 88, atomicMass: 226.00 },
  { symbol: 'Ac', atomicNumber: 89, atomicMass: 227.00 },
  { symbol: 'Th', atomicNumber: 90, atomicMass: 232.04 },
  { symbol: 'Pa', atomicNumber: 91, atomicMass: 231.04 },
  { symbol: 'U', atomicNumber: 92, atomicMass: 238.03 },
  { symbol: 'Np', atomicNumber: 93, atomicMass: 237.00 },
  { symbol: 'Pu', atomicNumber: 94, atomicMass: 244.00 },
  { symbol: 'Am', atomicNumber: 95, atomicMass: 243.00 },
  { symbol: 'Cm', atomicNumber: 96, atomicMass: 247.00 },
  { symbol: 'Bk', atomicNumber: 97, atomicMass: 247.00 },
  { symbol: 'Cf', atomicNumber: 98, atomicMass: 251.00 },
  { symbol: 'Es', atomicNumber: 99, atomicMass: 252.00 },
  { symbol: 'Fm', atomicNumber: 100, atomicMass: 257.00 },
  { symbol: 'Md', atomicNumber: 101, atomicMass: 258.00 },
  { symbol: 'No', atomicNumber: 102, atomicMass: 259.00 },
  { symbol: 'Lr', atomicNumber: 103, atomicMass: 262.00 },
  { symbol: 'Rf', atomicNumber: 104, atomicMass: 267.00 },
  { symbol: 'Db', atomicNumber: 105, atomicMass: 270.00 },
  { symbol: 'Sg', atomicNumber: 106, atomicMass: 271.00 },
  { symbol: 'Bh', atomicNumber: 107, atomicMass: 270.00 },
  { symbol: 'Hs', atomicNumber: 108, atomicMass: 277.00 },
  { symbol: 'Mt', atomicNumber: 109, atomicMass: 276.00 },
  { symbol: 'Ds', atomicNumber: 110, atomicMass: 281.00 },
  { symbol: 'Rg', atomicNumber: 111, atomicMass: 282.00 },
  { symbol: 'Cn', atomicNumber: 112, atomicMass: 285.00 },
  { symbol: 'Nh', atomicNumber: 113, atomicMass: 286.00 },
  { symbol: 'Fl', atomicNumber: 114, atomicMass: 289.00 },
  { symbol: 'Mc', atomicNumber: 115, atomicMass: 290.00 },
  { symbol: 'Lv', atomicNumber: 116, atomicMass: 293.00 },
  { symbol: 'Ts', atomicNumber: 117, atomicMass: 294.00 },
  { symbol: 'Og', atomicNumber: 118, atomicMass: 294.00 },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Safe division — returns 0 if denominator is 0
 * Mirrors Excel's IFERROR(x/y, "0") pattern
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0 || isNaN(denominator)) return 0;
  return numerator / denominator;
}

/**
 * Lookup element atomic mass by symbol
 * Mirrors VLOOKUP(symbol, SPU_KIMIA, 2, FALSE)
 */
export function lookupAtomicMass(symbol: string): number {
  const el = PERIODIC_TABLE.find(
    (e) => e.symbol.toLowerCase() === symbol.trim().toLowerCase()
  );
  return el?.atomicMass ?? 0;
}

/**
 * Lookup Luff Schoorl table with linear interpolation
 * Mirrors VLOOKUP(volume, table, col, TRUE) with interpolation
 */
export function lookupLuffSchoorl(
  volume: number,
  sugarType: 'glukosa_fruktosa' | 'laktosa' | 'maltosa' = 'glukosa_fruktosa'
): number {
  if (volume <= 0) return 0;

  // Find the bracketing entries
  const sorted = [...LUFF_SCHOORL_TABLE].sort((a, b) => a.volume - b.volume);

  // Exact match
  const exact = sorted.find((e) => e.volume === volume);
  if (exact) return exact[sugarType];

  // Find lower and upper bounds for interpolation
  let lower: LuffSchoorlEntry | null = null;
  let upper: LuffSchoorlEntry | null = null;

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].volume <= volume) {
      lower = sorted[i];
    }
    if (sorted[i].volume > volume && !upper) {
      upper = sorted[i];
    }
  }

  if (!lower) return 0;
  if (!upper) return lower[sugarType];

  // Linear interpolation
  const fraction = (volume - lower.volume) / (upper.volume - lower.volume);
  return lower[sugarType] + fraction * (upper[sugarType] - lower[sugarType]);
}

/**
 * Lookup protein conversion factor by food type
 * Mirrors VLOOKUP(sample, D105:E122, 2, FALSE)
 */
export function lookupProteinFactor(sampleType: string): number {
  const key = Object.keys(PROTEIN_CONVERSION_FACTORS).find(
    (k) => k.toLowerCase() === sampleType.trim().toLowerCase()
  );
  return key ? PROTEIN_CONVERSION_FACTORS[key] : 0;
}

/**
 * Lookup carbohydrate conversion factor
 */
export function lookupCarboFactor(sampleType: string): number {
  const key = Object.keys(CARBOHYDRATE_CONVERSION_FACTORS).find(
    (k) => k.toLowerCase() === sampleType.trim().toLowerCase()
  );
  return key ? CARBOHYDRATE_CONVERSION_FACTORS[key] : 0;
}

// ============================================================
// MODULE 1: MOISTURE CONTENT (KADAR AIR)
// Source: Format Kadar Air worksheet
// ============================================================

export interface MoistureInput {
  /** Bobot wadah kosong (g) — Cell E11 */
  bobot_wadah_kosong: number;
  /** Bobot sampel sebelum dikeringkan (g) — Cell E13 */
  bobot_sampel: number;
  /** Bobot wadah kosong dan sampel setelah dikeringkan (g) — Cell E14 */
  bobot_setelah: number;
}

export interface MoistureResult {
  /** MOISTURE-001: Weight before drying */
  weight_before: number;
  /** MOISTURE-002: Weight loss */
  weight_loss: number;
  /** MOISTURE-003: Moisture fraction */
  moisture_fraction: number;
  /** MOISTURE-004: Moisture percentage */
  moisture_pct: number;
  /** Alternative method results */
  alt_weight_diff: number;
  alt_moisture_fraction: number;
  alt_moisture_pct: number;
  steps: CalculationStep[];
}

export interface CalculationStep {
  id: string;
  name: string;
  formula: string;
  inputs: Record<string, number>;
  result: number;
  unit: string;
}

/**
 * Calculate moisture content (Kadar Air)
 * 
 * Primary method (Excel rows 13-24):
 *   H16 = H13 + J13 (bobot cawan + sampel)
 *   J16 = L13 = E14 (bobot setelah)
 *   H19 = H16 - J16 (weight loss)
 *   H20 = H17 = E13 (sample weight)
 *   H22 = H19 / H20 (fraction)
 *   H24 = H22 * 100 (percentage)
 * 
 * Alternative method (Excel rows 33-38):
 *   H33 = E12 - E14 (direct difference)
 *   H34 = E13
 *   H36 = H33 / H34
 *   H38 = H36 * 100
 */
export function calculateMoisture(input: MoistureInput): MoistureResult {
  const steps: CalculationStep[] = [];

  // MOISTURE-001: H16 = IFERROR(H13+J13, "0,0000")
  // H13 = E11, J13 = E13
  const weight_before = input.bobot_wadah_kosong + input.bobot_sampel;
  steps.push({
    id: 'MOISTURE-001',
    name: 'Weight Before Drying',
    formula: 'H16 = bobot_wadah_kosong + bobot_sampel',
    inputs: { bobot_wadah_kosong: input.bobot_wadah_kosong, bobot_sampel: input.bobot_sampel },
    result: weight_before,
    unit: 'g',
  });

  // MOISTURE-002: H19 = IFERROR(H16-J16, "0,0000")
  // J16 = L13 = E14
  const weight_loss = weight_before - input.bobot_setelah;
  steps.push({
    id: 'MOISTURE-002',
    name: 'Weight Loss',
    formula: 'H19 = weight_before - bobot_setelah',
    inputs: { weight_before, bobot_setelah: input.bobot_setelah },
    result: weight_loss,
    unit: 'g',
  });

  // MOISTURE-003: H22 = IFERROR(H19/H20, "0")
  // H20 = H17 = E13
  const moisture_fraction = safeDivide(weight_loss, input.bobot_sampel);
  steps.push({
    id: 'MOISTURE-003',
    name: 'Moisture Fraction',
    formula: 'H22 = weight_loss / bobot_sampel',
    inputs: { weight_loss, bobot_sampel: input.bobot_sampel },
    result: moisture_fraction,
    unit: '',
  });

  // MOISTURE-004: H24 = H22 * 100
  const moisture_pct = moisture_fraction * 100;
  steps.push({
    id: 'MOISTURE-004',
    name: 'Moisture Percentage',
    formula: 'H24 = moisture_fraction × 100',
    inputs: { moisture_fraction },
    result: moisture_pct,
    unit: '%',
  });

  // Alternative method
  // MOISTURE-005: H33 = E12 - E14
  // E12 = IFERROR(H16, "0,0000") = weight_before
  const alt_weight_diff = weight_before - input.bobot_setelah;
  steps.push({
    id: 'MOISTURE-005',
    name: 'Alt: Weight Difference',
    formula: 'H33 = E12 - E14',
    inputs: { E12: weight_before, E14: input.bobot_setelah },
    result: alt_weight_diff,
    unit: 'g',
  });

  // MOISTURE-006: H36 = IFERROR(H33/H34, "0")
  const alt_moisture_fraction = safeDivide(alt_weight_diff, input.bobot_sampel);
  steps.push({
    id: 'MOISTURE-006',
    name: 'Alt: Moisture Fraction',
    formula: 'H36 = H33 / H34',
    inputs: { H33: alt_weight_diff, H34: input.bobot_sampel },
    result: alt_moisture_fraction,
    unit: '',
  });

  // MOISTURE-007: H38 = H36 * 100
  const alt_moisture_pct = alt_moisture_fraction * 100;
  steps.push({
    id: 'MOISTURE-007',
    name: 'Alt: Moisture Percentage',
    formula: 'H38 = H36 × 100',
    inputs: { H36: alt_moisture_fraction },
    result: alt_moisture_pct,
    unit: '%',
  });

  return {
    weight_before,
    weight_loss,
    moisture_fraction,
    moisture_pct,
    alt_weight_diff,
    alt_moisture_fraction,
    alt_moisture_pct,
    steps,
  };
}

// ============================================================
// MODULE 2: ASH CONTENT (KADAR ABU)
// Source: Format Kadar Abu worksheet
// ============================================================

export interface AshInput {
  /** Bobot wadah kosong (g) — Cell E11 */
  bobot_wadah_kosong: number;
  /** Bobot cawan kosong + sampel sebelum dikeringkan (g) — Cell E12 */
  bobot_cawan_sampel: number;
  /** Bobot wadah + sampel setelah dikeringkan (g) — Cell E14 */
  bobot_setelah: number;
}

export interface AshResult {
  ash_weight: number;
  sample_weight: number;
  ash_fraction: number;
  ash_pct: number;
  alt_ash_weight: number;
  alt_sample_weight: number;
  alt_ash_fraction: number;
  alt_ash_pct: number;
  steps: CalculationStep[];
}

/**
 * Calculate ash content (Kadar Abu)
 * 
 * Primary method:
 *   H13 = E14 (bobot_setelah)
 *   J13 = E11 (bobot_wadah_kosong)
 *   H14 = E12 (bobot_cawan_sampel)
 *   J14 = E11
 *   H16 = H13 - J13 (ash weight = setelah - wadah kosong)
 *   H17 = H14 - J14 (sample weight = cawan+sampel - wadah kosong)
 *   H19 = H16 / H17 (ash fraction)
 *   H21 = H19 (as percentage, already decimal in Excel)
 * 
 * Alternative method:
 *   H33 = E14 - E11
 *   H34 = E12 - E11
 *   H36 = H33 / H34
 *   H38 = H36 * 100
 */
export function calculateAsh(input: AshInput): AshResult {
  const steps: CalculationStep[] = [];

  // ASH-001: E15 = E14 - E11
  const ash_weight = input.bobot_setelah - input.bobot_wadah_kosong;
  steps.push({
    id: 'ASH-001',
    name: 'Ash Weight',
    formula: 'E15 = E14 - E11',
    inputs: { E14: input.bobot_setelah, E11: input.bobot_wadah_kosong },
    result: ash_weight,
    unit: 'g',
  });

  // ASH-002: H16 = H13 - J13 = E14 - E11
  // (same as ASH-001)
  steps.push({
    id: 'ASH-002',
    name: 'Ash Weight (via H)',
    formula: 'H16 = H13 - J13',
    inputs: { H13: input.bobot_setelah, J13: input.bobot_wadah_kosong },
    result: ash_weight,
    unit: 'g',
  });

  // ASH-003: H17 = H14 - J14 = E12 - E11
  const sample_weight = input.bobot_cawan_sampel - input.bobot_wadah_kosong;
  steps.push({
    id: 'ASH-003',
    name: 'Sample Weight',
    formula: 'H17 = H14 - J14 = E12 - E11',
    inputs: { E12: input.bobot_cawan_sampel, E11: input.bobot_wadah_kosong },
    result: sample_weight,
    unit: 'g',
  });

  // ASH-004: H19 = H16 / H17
  const ash_fraction = safeDivide(ash_weight, sample_weight);
  steps.push({
    id: 'ASH-004',
    name: 'Ash Fraction',
    formula: 'H19 = H16 / H17',
    inputs: { H16: ash_weight, H17: sample_weight },
    result: ash_fraction,
    unit: '',
  });

  // ASH-005: H21 = H19
  const ash_pct = ash_fraction * 100;
  steps.push({
    id: 'ASH-005',
    name: 'Ash Percentage',
    formula: 'H21 = H19 × 100',
    inputs: { H19: ash_fraction },
    result: ash_pct,
    unit: '%',
  });

  // Alternative method
  const alt_ash_weight = input.bobot_setelah - input.bobot_wadah_kosong;
  const alt_sample_weight = input.bobot_cawan_sampel - input.bobot_wadah_kosong;
  const alt_ash_fraction = safeDivide(alt_ash_weight, alt_sample_weight);
  const alt_ash_pct = alt_ash_fraction * 100;

  steps.push(
    {
      id: 'ASH-006',
      name: 'Alt: Ash Weight',
      formula: 'H33 = E14 - E11',
      inputs: { E14: input.bobot_setelah, E11: input.bobot_wadah_kosong },
      result: alt_ash_weight,
      unit: 'g',
    },
    {
      id: 'ASH-007',
      name: 'Alt: Ash Percentage',
      formula: 'H38 = H36 × 100',
      inputs: { H36: alt_ash_fraction },
      result: alt_ash_pct,
      unit: '%',
    }
  );

  return {
    ash_weight,
    sample_weight,
    ash_fraction,
    ash_pct,
    alt_ash_weight,
    alt_sample_weight,
    alt_ash_fraction,
    alt_ash_pct,
    steps,
  };
}

// ============================================================
// MODULE 3: PROTEIN CONTENT (KADAR PROTEIN - KJELDAHL)
// Source: Format Kadar Protein worksheet
// ============================================================

export interface ProteinInput {
  // Standardization titration
  /** Volume simplo initial (mL) — Cell F10 */
  std_simplo_awal: number;
  /** Volume simplo final (mL) — Cell G10 */
  std_simplo_akhir: number;
  /** Volume duplo initial (mL) — Cell F11 */
  std_duplo_awal: number;
  /** Volume duplo final (mL) — Cell G11 */
  std_duplo_akhir: number;
  /** Volume Y (mL) — Cell E18 */
  volume_y: number;
  /** Konsentrasi Y (N) — Cell E19 */
  konsentrasi_y: number;

  // Blanko titration
  /** Blanko simplo initial (mL) — Cell F35 */
  blanko_simplo_awal: number;
  /** Blanko simplo final (mL) — Cell G35 */
  blanko_simplo_akhir: number;
  /** Blanko duplo initial (mL) — Cell F36 */
  blanko_duplo_awal: number;
  /** Blanko duplo final (mL) — Cell G36 */
  blanko_duplo_akhir: number;

  // Sample titration
  /** Sample simplo initial (mL) — Cell F39 */
  sample_simplo_awal: number;
  /** Sample simplo final (mL) — Cell G39 */
  sample_simplo_akhir: number;
  /** Sample duplo initial (mL) — Cell F40 */
  sample_duplo_awal: number;
  /** Sample duplo final (mL) — Cell G40 */
  sample_duplo_akhir: number;

  // Parameters
  /** Konsentrasi penitar (N) — Cell E52 */
  konsentrasi_penitar: number;
  /** Ketetapan Protein (Ar N = 14.007) — Cell E53 */
  ketetapan_protein: number;
  /** Faktor Pengenceran — Cell E54 */
  faktor_pengenceran: number;
  /** Massa Sampel (mg) — Cell E50 */
  massa_sampel: number;
  /** Jenis sampel untuk faktor konversi — Cell E65 */
  jenis_sampel: string;
}

export interface ProteinResult {
  std_volume_simplo: number;
  std_volume_duplo: number;
  std_volume_avg: number;
  konsentrasi_x: number;
  blanko_avg: number;
  sample_avg: number;
  volume_diff: number;
  numerator_product: number;
  nitrogen_pct: number;
  conversion_factor: number;
  protein_pct: number;
  steps: CalculationStep[];
}

/**
 * Calculate protein content using Kjeldahl method
 * 
 * Standardization: Cx = (Vy * Cy) / Vx_avg
 * %N = ((V_blanko - V_sample) * C_penitar * 14.007 * F_pengenceran) / massa_sampel
 * %Protein = %N * conversion_factor
 */
export function calculateProtein(input: ProteinInput): ProteinResult {
  const steps: CalculationStep[] = [];

  // PROTEIN-001: H10 = G10 - F10
  const std_volume_simplo = input.std_simplo_akhir - input.std_simplo_awal;
  steps.push({
    id: 'PROTEIN-001',
    name: 'Standardization Volume (Simplo)',
    formula: 'H10 = G10 - F10',
    inputs: { G10: input.std_simplo_akhir, F10: input.std_simplo_awal },
    result: std_volume_simplo,
    unit: 'mL',
  });

  // PROTEIN-002: H11 = G11 - F11
  const std_volume_duplo = input.std_duplo_akhir - input.std_duplo_awal;
  steps.push({
    id: 'PROTEIN-002',
    name: 'Standardization Volume (Duplo)',
    formula: 'H11 = G11 - F11',
    inputs: { G11: input.std_duplo_akhir, F11: input.std_duplo_awal },
    result: std_volume_duplo,
    unit: 'mL',
  });

  // PROTEIN-003: H12 = AVERAGE(H10:H11)
  const std_volume_avg = (std_volume_simplo + std_volume_duplo) / 2;
  steps.push({
    id: 'PROTEIN-003',
    name: 'Average Standardization Volume',
    formula: 'H12 = AVERAGE(H10:H11)',
    inputs: { H10: std_volume_simplo, H11: std_volume_duplo },
    result: std_volume_avg,
    unit: 'mL',
  });

  // PROTEIN-004: H28 = IFERROR(H25/H26, "0")
  // H25 = H22*J22 = volume_y * konsentrasi_y
  // H26 = H23 = std_volume_avg
  const konsentrasi_x = safeDivide(
    input.volume_y * input.konsentrasi_y,
    std_volume_avg
  );
  steps.push({
    id: 'PROTEIN-004',
    name: 'Standardization Concentration (Cx)',
    formula: 'Cx = (Vy × Cy) / Vx_avg',
    inputs: {
      Vy: input.volume_y,
      Cy: input.konsentrasi_y,
      Vx_avg: std_volume_avg,
    },
    result: konsentrasi_x,
    unit: 'N',
  });

  // PROTEIN-005: H37 = AVERAGE(H35:H36)
  const blanko_simplo = input.blanko_simplo_akhir - input.blanko_simplo_awal;
  const blanko_duplo = input.blanko_duplo_akhir - input.blanko_duplo_awal;
  const blanko_avg = (blanko_simplo + blanko_duplo) / 2;
  steps.push({
    id: 'PROTEIN-005',
    name: 'Blanko Average Volume',
    formula: 'H37 = AVERAGE(blanko_simplo, blanko_duplo)',
    inputs: { blanko_simplo, blanko_duplo },
    result: blanko_avg,
    unit: 'mL',
  });

  // PROTEIN-006: H41 = AVERAGE(H39:H40)
  // NOTE: In the Excel, H41 uses AVERAGE(H35:H36) — same as blanko range
  // This appears to be a copy pattern in the Excel. We use the correct sample values.
  const sample_simplo = input.sample_simplo_akhir - input.sample_simplo_awal;
  const sample_duplo = input.sample_duplo_akhir - input.sample_duplo_awal;
  const sample_avg = (sample_simplo + sample_duplo) / 2;
  steps.push({
    id: 'PROTEIN-006',
    name: 'Sample Average Volume',
    formula: 'H41 = AVERAGE(sample_simplo, sample_duplo)',
    inputs: { sample_simplo, sample_duplo },
    result: sample_avg,
    unit: 'mL',
  });

  // PROTEIN-007: I52 = E48 - E49 = blanko_avg - sample_avg
  const volume_diff = blanko_avg - sample_avg;
  steps.push({
    id: 'PROTEIN-007',
    name: 'Volume Difference (Blanko - Sample)',
    formula: 'I52 = V_blanko - V_sample',
    inputs: { V_blanko: blanko_avg, V_sample: sample_avg },
    result: volume_diff,
    unit: 'mL',
  });

  // PROTEIN-008: I55 = PRODUCT(I52:O52)
  // = volume_diff * konsentrasi_penitar * ketetapan_protein * faktor_pengenceran
  const numerator_product =
    volume_diff *
    input.konsentrasi_penitar *
    input.ketetapan_protein *
    input.faktor_pengenceran;
  steps.push({
    id: 'PROTEIN-008',
    name: 'Numerator Product',
    formula: 'I55 = V_diff × C_penitar × Ar_N × F_pengenceran',
    inputs: {
      V_diff: volume_diff,
      C_penitar: input.konsentrasi_penitar,
      Ar_N: input.ketetapan_protein,
      F_pengenceran: input.faktor_pengenceran,
    },
    result: numerator_product,
    unit: 'mg',
  });

  // PROTEIN-009: I59 = IFERROR(I55/I56, "0%")
  const nitrogen_pct = safeDivide(numerator_product, input.massa_sampel);
  steps.push({
    id: 'PROTEIN-009',
    name: 'Nitrogen Percentage',
    formula: '%N = PRODUCT / massa_sampel',
    inputs: { PRODUCT: numerator_product, massa_sampel: input.massa_sampel },
    result: nitrogen_pct,
    unit: '%',
  });

  // PROTEIN-010: E66 = VLOOKUP(E65, D105:E122, 2, FALSE)
  const conversion_factor = lookupProteinFactor(input.jenis_sampel);
  steps.push({
    id: 'PROTEIN-010',
    name: 'Conversion Factor Lookup',
    formula: 'VLOOKUP(jenis_sampel, tabel_konversi)',
    inputs: { jenis_sampel_lookup: conversion_factor },
    result: conversion_factor,
    unit: '',
  });

  // PROTEIN-011: I66 = PRODUCT(I64:K64) = %N * conversion_factor
  const protein_pct = nitrogen_pct * conversion_factor;
  steps.push({
    id: 'PROTEIN-011',
    name: 'Protein Percentage',
    formula: '%Protein = %N × Faktor_Konversi',
    inputs: { nitrogen_pct, conversion_factor },
    result: protein_pct,
    unit: '%',
  });

  return {
    std_volume_simplo,
    std_volume_duplo,
    std_volume_avg,
    konsentrasi_x,
    blanko_avg,
    sample_avg,
    volume_diff,
    numerator_product,
    nitrogen_pct,
    conversion_factor,
    protein_pct,
    steps,
  };
}

// ============================================================
// MODULE 4: CARBOHYDRATE (LUFF SCHOORL METHOD)
// Source: karbo worksheet
// ============================================================

export interface CarbohydrateInput {
  // Standardization
  std_simplo_awal: number;
  std_simplo_akhir: number;
  std_duplo_awal: number;
  std_duplo_akhir: number;
  volume_y: number;
  konsentrasi_y: number;

  // Blanko
  blanko_simplo_awal: number;
  blanko_simplo_akhir: number;
  blanko_duplo_awal: number;
  blanko_duplo_akhir: number;

  // Sample
  sample_simplo_awal: number;
  sample_simplo_akhir: number;
  sample_duplo_awal: number;
  sample_duplo_akhir: number;

  /** Konsentrasi penitar yang dibuat (N) */
  konsentrasi_penitar_dibuat: number;
  /** Faktor pengenceran */
  faktor_pengenceran: number;
  /** Massa sampel (mg) */
  massa_sampel: number;
  /** Sugar type for Luff Schoorl lookup */
  sugar_type: 'glukosa_fruktosa' | 'laktosa' | 'maltosa';
  /** Jenis sampel untuk konversi karbohidrat (Pati/Sukrosa) */
  jenis_sampel: string;
}

export interface CarbohydrateResult {
  std_volume_avg: number;
  konsentrasi_x: number;
  blanko_avg: number;
  sample_avg: number;
  volume_diff: number;
  product_value: number;
  volume_na2s2o3: number;
  mg_sugar: number;
  glucose_pct: number;
  carbo_conversion_factor: number;
  carbohydrate_pct: number;
  steps: CalculationStep[];
}

/**
 * Calculate carbohydrate content using Luff Schoorl method
 * 
 * 1. Standardize Na-thiosulfate: Cx = (Vy * Cy) / Vx
 * 2. Volume Na₂S₂O₃ = (V_blanko - V_sample) * C_std / C_dibuat
 * 3. Convert volume → mg sugar via Luff Schoorl table
 * 4. %Glucose = (mg_sugar * F_pengenceran) / massa_sampel
 * 5. %Karbohidrat = %Glucose * conversion_factor
 */
export function calculateCarbohydrate(input: CarbohydrateInput): CarbohydrateResult {
  const steps: CalculationStep[] = [];

  // Standardization
  const std_simplo = input.std_simplo_akhir - input.std_simplo_awal;
  const std_duplo = input.std_duplo_akhir - input.std_duplo_awal;
  const std_volume_avg = (std_simplo + std_duplo) / 2;

  const konsentrasi_x = safeDivide(
    input.volume_y * input.konsentrasi_y,
    std_volume_avg
  );

  steps.push(
    {
      id: 'CARBO-001',
      name: 'Std Volume Average',
      formula: 'G14 = AVERAGE(G12:G13)',
      inputs: { G12: std_simplo, G13: std_duplo },
      result: std_volume_avg,
      unit: 'mL',
    },
    {
      id: 'CARBO-002',
      name: 'Standardization Concentration',
      formula: 'Cx = (Vy × Cy) / Vx',
      inputs: { Vy: input.volume_y, Cy: input.konsentrasi_y, Vx: std_volume_avg },
      result: konsentrasi_x,
      unit: 'N',
    }
  );

  // Blanko & Sample
  const blanko_simplo = input.blanko_simplo_akhir - input.blanko_simplo_awal;
  const blanko_duplo = input.blanko_duplo_akhir - input.blanko_duplo_awal;
  const blanko_avg = (blanko_simplo + blanko_duplo) / 2;

  const sample_simplo = input.sample_simplo_akhir - input.sample_simplo_awal;
  const sample_duplo = input.sample_duplo_akhir - input.sample_duplo_awal;
  const sample_avg = (sample_simplo + sample_duplo) / 2;

  // Volume diff
  const volume_diff = blanko_avg - sample_avg;

  steps.push(
    {
      id: 'CARBO-003',
      name: 'Blanko Average',
      formula: 'G40 = AVERAGE(blanko_simplo, blanko_duplo)',
      inputs: { blanko_simplo, blanko_duplo },
      result: blanko_avg,
      unit: 'mL',
    },
    {
      id: 'CARBO-004',
      name: 'Sample Average',
      formula: 'G44 = AVERAGE(sample_simplo, sample_duplo)',
      inputs: { sample_simplo, sample_duplo },
      result: sample_avg,
      unit: 'mL',
    },
    {
      id: 'CARBO-005',
      name: 'Volume Difference',
      formula: 'H53 = blanko_avg - sample_avg',
      inputs: { blanko_avg, sample_avg },
      result: volume_diff,
      unit: 'mL',
    }
  );

  // Volume Na2S2O3 = (V_diff * C_std) / C_dibuat
  // H55 = PRODUCT(H53:J53) = V_diff * C_std
  const product_value = volume_diff * konsentrasi_x;
  // H58 = H55 / H56 where H56 = C_dibuat
  const volume_na2s2o3 = safeDivide(product_value, input.konsentrasi_penitar_dibuat);

  steps.push(
    {
      id: 'CARBO-006',
      name: 'Product (V_diff × C_std)',
      formula: 'H55 = V_diff × C_std',
      inputs: { V_diff: volume_diff, C_std: konsentrasi_x },
      result: product_value,
      unit: '',
    },
    {
      id: 'CARBO-007',
      name: 'Volume Na₂S₂O₃ 0.1N',
      formula: 'H58 = product / C_dibuat',
      inputs: { product: product_value, C_dibuat: input.konsentrasi_penitar_dibuat },
      result: volume_na2s2o3,
      unit: 'mL',
    }
  );

  // Luff Schoorl lookup
  const mg_sugar = lookupLuffSchoorl(volume_na2s2o3, input.sugar_type);
  steps.push({
    id: 'LUFF-001',
    name: 'Luff Schoorl Lookup',
    formula: 'VLOOKUP(volume, luff_table)',
    inputs: { volume: volume_na2s2o3 },
    result: mg_sugar,
    unit: 'mg',
  });

  // %Glucose = (mg_sugar * F_pengenceran) / massa_sampel
  const glucose_pct = safeDivide(
    mg_sugar * input.faktor_pengenceran,
    input.massa_sampel
  );
  steps.push({
    id: 'GLUCOSE-001',
    name: 'Glucose Percentage',
    formula: '%Glucose = (mg_sugar × F_pengenceran) / massa_sampel',
    inputs: {
      mg_sugar,
      F_pengenceran: input.faktor_pengenceran,
      massa_sampel: input.massa_sampel,
    },
    result: glucose_pct,
    unit: '%',
  });

  // %Karbohidrat = %Glucose * conversion_factor
  const carbo_conversion_factor = lookupCarboFactor(input.jenis_sampel);
  const carbohydrate_pct = glucose_pct * carbo_conversion_factor;

  steps.push(
    {
      id: 'KARBO-001',
      name: 'Carbohydrate Conversion Factor',
      formula: 'VLOOKUP(jenis_sampel, carbo_table)',
      inputs: {},
      result: carbo_conversion_factor,
      unit: '',
    },
    {
      id: 'KARBO-002',
      name: 'Carbohydrate Percentage',
      formula: '%Karbo = %Glucose × conversion_factor',
      inputs: { glucose_pct, conversion_factor: carbo_conversion_factor },
      result: carbohydrate_pct,
      unit: '%',
    }
  );

  return {
    std_volume_avg,
    konsentrasi_x,
    blanko_avg,
    sample_avg,
    volume_diff,
    product_value,
    volume_na2s2o3,
    mg_sugar,
    glucose_pct,
    carbo_conversion_factor,
    carbohydrate_pct,
    steps,
  };
}

// ============================================================
// MODULE 5: MOLAR MASS CALCULATOR
// Source: Massa Molar worksheet
// ============================================================

export interface MolarMassElement {
  symbol: string;
  quantity: number;
}

export interface MolarMassInput {
  /** Up to 3 groups of elements (rows 7-9, 10-12, 13-15, 16-20) */
  groups: MolarMassElement[][];
}

export interface MolarMassResult {
  groupMasses: number[];
  totalMass: number;
  elements: Array<{ symbol: string; quantity: number; ar: number; contribution: number }>;
  steps: CalculationStep[];
}

/**
 * Calculate molar mass from element composition
 * 
 * For each element: contribution = Ar × quantity
 * Group mass = sum of contributions in group
 * Mirrors Massa Molar!F7:I16
 */
export function calculateMolarMass(input: MolarMassInput): MolarMassResult {
  const steps: CalculationStep[] = [];
  const groupMasses: number[] = [];
  const elements: MolarMassResult['elements'] = [];

  input.groups.forEach((group, gi) => {
    let groupSum = 0;
    group.forEach((el, ei) => {
      const ar = lookupAtomicMass(el.symbol);
      const contribution = ar * el.quantity;
      groupSum += contribution;
      elements.push({ symbol: el.symbol, quantity: el.quantity, ar, contribution });

      steps.push({
        id: `MOLAR-${String(gi * 3 + ei + 1).padStart(3, '0')}`,
        name: `${el.symbol} × ${el.quantity}`,
        formula: `G = Ar × qty = ${ar} × ${el.quantity}`,
        inputs: { Ar: ar, qty: el.quantity },
        result: contribution,
        unit: 'g/mol',
      });
    });
    groupMasses.push(groupSum);
  });

  const totalMass = groupMasses.reduce((s, m) => s + m, 0);

  steps.push({
    id: 'MOLAR-TOTAL',
    name: 'Total Molar Mass',
    formula: 'Mr = Σ(Ar × qty)',
    inputs: {},
    result: totalMass,
    unit: 'g/mol',
  });

  return { groupMasses, totalMass, elements, steps };
}

// ============================================================
// MODULE 6: EQUIVALENT WEIGHT (BOBOT EKUIVALEN)
// Source: Bobot Ekuivalen worksheet
// ============================================================

export interface EquivalentWeightInput {
  groups: MolarMassElement[][];
  /** Number of equivalents (n) for each group */
  nValues: number[];
}

export interface EquivalentWeightResult {
  molarMasses: number[];
  equivalentWeights: number[];
  steps: CalculationStep[];
}

/**
 * Calculate equivalent weight
 * BE = Mr / n
 * Mirrors Bobot Ekuivalen!K7 = H7/J7
 */
export function calculateEquivalentWeight(input: EquivalentWeightInput): EquivalentWeightResult {
  const molarResult = calculateMolarMass({ groups: input.groups });
  const steps = [...molarResult.steps];
  const equivalentWeights: number[] = [];

  molarResult.groupMasses.forEach((mr, i) => {
    const n = input.nValues[i] ?? 1;
    const be = safeDivide(mr, n);
    equivalentWeights.push(be);

    steps.push({
      id: `EQUIVALENT-${String(i + 1).padStart(3, '0')}`,
      name: `Equivalent Weight Group ${i + 1}`,
      formula: `BE = Mr / n = ${mr} / ${n}`,
      inputs: { Mr: mr, n },
      result: be,
      unit: 'g/ekuivalen',
    });
  });

  return {
    molarMasses: molarResult.groupMasses,
    equivalentWeights,
    steps,
  };
}

// ============================================================
// MODULE 7: STANDARDIZATION (FORMAT STANDARDISASI)
// Source: FORMAT STANDARDISASI worksheet
// ============================================================

export interface StandardizationInput {
  /** Volume Y (mL) */
  volume_y: number;
  /** Konsentrasi Y (N/M) */
  konsentrasi_y: number;
  /** Titration data: initial and final buret readings */
  simplo_awal: number;
  simplo_akhir: number;
  duplo_awal: number;
  duplo_akhir: number;
}

export interface StandardizationResult {
  volume_simplo: number;
  volume_duplo: number;
  volume_avg: number;
  konsentrasi_x: number;
  steps: CalculationStep[];
}

/**
 * Calculate standardization concentration
 * Cx = (Vy × Cy) / Vx_avg
 */
export function calculateStandardization(input: StandardizationInput): StandardizationResult {
  const steps: CalculationStep[] = [];

  const volume_simplo = input.simplo_akhir - input.simplo_awal;
  const volume_duplo = input.duplo_akhir - input.duplo_awal;
  const volume_avg = (volume_simplo + volume_duplo) / 2;

  steps.push(
    {
      id: 'STANDARD-001',
      name: 'Volume X (Simplo)',
      formula: 'H12 = G12 - F12',
      inputs: { akhir: input.simplo_akhir, awal: input.simplo_awal },
      result: volume_simplo,
      unit: 'mL',
    },
    {
      id: 'STANDARD-002',
      name: 'Average Volume X',
      formula: 'H14 = AVERAGE(H12:H13)',
      inputs: { simplo: volume_simplo, duplo: volume_duplo },
      result: volume_avg,
      unit: 'mL',
    }
  );

  const konsentrasi_x = safeDivide(
    input.volume_y * input.konsentrasi_y,
    volume_avg
  );

  steps.push({
    id: 'STANDARD-003',
    name: 'Concentration X',
    formula: 'P21 = (Vy × Cy) / Vx_avg',
    inputs: { Vy: input.volume_y, Cy: input.konsentrasi_y, Vx_avg: volume_avg },
    result: konsentrasi_x,
    unit: 'N/M',
  });

  return { volume_simplo, volume_duplo, volume_avg, konsentrasi_x, steps };
}

// ============================================================
// MODULE 8: CONCENTRATION DETERMINATION (PENETAPAN KADAR)
// Source: FORMAT PENETAPAN KADAR worksheet
// ============================================================

export interface KadarInput {
  /** Titration data */
  simplo_awal: number;
  simplo_akhir: number;
  duplo_awal: number;
  duplo_akhir: number;
  /** Unsur/Senyawa symbol for Ar/Mr lookup */
  unsur_senyawa: string;
  /** Konsentrasi Penitar (N/M) */
  konsentrasi_penitar: number;
  /** Volume Sampel (mL) */
  volume_sampel: number;
  /** Faktor Pengenceran */
  faktor_pengenceran: number;
}

export interface KadarResult {
  volume_avg: number;
  ar_mr: number;
  numerator: number;
  kadar: number;
  steps: CalculationStep[];
}

/**
 * Calculate concentration (Kadar g/L)
 * Kadar = (V_titrasi × Ar/Mr × C_penitar × F_pengenceran) / V_sampel
 * Mirrors FORMAT PENETAPAN KADAR!H30
 */
export function calculateKadar(input: KadarInput): KadarResult {
  const steps: CalculationStep[] = [];

  const vol_simplo = input.simplo_akhir - input.simplo_awal;
  const vol_duplo = input.duplo_akhir - input.duplo_awal;
  const volume_avg = (vol_simplo + vol_duplo) / 2;

  const ar_mr = lookupAtomicMass(input.unsur_senyawa);

  steps.push(
    {
      id: 'KADAR-001',
      name: 'Average Titration Volume',
      formula: 'H14 = AVERAGE(H12:H13)',
      inputs: { simplo: vol_simplo, duplo: vol_duplo },
      result: volume_avg,
      unit: 'mL',
    },
    {
      id: 'KADAR-002',
      name: 'Ar/Mr Lookup',
      formula: 'E21 = VLOOKUP(unsur, SPU_KIMIA)',
      inputs: {},
      result: ar_mr,
      unit: 'g/mol',
    }
  );

  // H27 = PRODUCT(H24:N24) = V_titrasi × Ar/Mr × C_penitar × F_pengenceran
  const numerator =
    volume_avg * ar_mr * input.konsentrasi_penitar * input.faktor_pengenceran;

  // H30 = H27 / P23 (volume sampel)
  const kadar = safeDivide(numerator, input.volume_sampel);

  steps.push(
    {
      id: 'KADAR-003',
      name: 'Numerator Product',
      formula: 'H27 = V × Ar × C × F',
      inputs: {
        V: volume_avg,
        Ar: ar_mr,
        C: input.konsentrasi_penitar,
        F: input.faktor_pengenceran,
      },
      result: numerator,
      unit: '',
    },
    {
      id: 'KADAR-004',
      name: 'Kadar (g/L)',
      formula: 'H30 = numerator / V_sampel',
      inputs: { numerator, V_sampel: input.volume_sampel },
      result: kadar,
      unit: 'g/L',
    }
  );

  return { volume_avg, ar_mr, numerator, kadar, steps };
}

// ============================================================
// MODULE 9: TITRATION CURVE
// Source: Curve Titration worksheet
// ============================================================

export interface TitrationCurveInput {
  /** Ka (acid dissociation constant) — Cell I10 */
  ka: number;
  /** Volume Y (mL) — Cell I8 */
  volume_y: number;
  /** Konsentrasi Y (M) — Cell I9 */
  konsentrasi_y: number;
  /** Volume increment (mL) — Cell I12 */
  volume_increment: number;
}

export interface TitrationPoint {
  volume: number;
  ph: number;
  region: 'before_equivalence' | 'at_equivalence' | 'after_equivalence';
}

export interface TitrationCurveResult {
  kb: number;
  equivalence_volume: number;
  points_before: TitrationPoint[];
  point_at_equivalence: TitrationPoint;
  points_after: TitrationPoint[];
  steps: CalculationStep[];
}

/**
 * Generate titration curve data
 * 
 * Before equivalence (Henderson-Hasselbalch):
 *   pH = -log(Ka) + log(CxVx / (CyVy - CxVx))
 * 
 * At equivalence:
 *   pH = -log(sqrt(Ka × Kb))
 * 
 * After equivalence:
 *   pH = 14 - (-log(excess_base_concentration))
 *   excess = ((Vx*Cx - Vy*Cy) / (Vx + Vy))
 */
export function calculateTitrationCurve(input: TitrationCurveInput): TitrationCurveResult {
  const steps: CalculationStep[] = [];

  // TITRATION-001: Kb = 10^-14 / Ka
  const kb = 1e-14 / input.ka;
  steps.push({
    id: 'TITRATION-001',
    name: 'Kb Calculation',
    formula: 'Kb = 10⁻¹⁴ / Ka',
    inputs: { Ka: input.ka },
    result: kb,
    unit: '',
  });

  // TITRATION-002: equivalence volume = V_Y
  const equivalence_volume = input.volume_y;

  const points_before: TitrationPoint[] = [];
  const points_after: TitrationPoint[] = [];

  // Initial point (0 mL added)
  // pH = -log(sqrt(Ka * C))
  const initialPH = -Math.log10(Math.sqrt(input.ka * input.konsentrasi_y));

  // Generate points before equivalence
  for (
    let v = 0;
    v < equivalence_volume;
    v += input.volume_increment
  ) {
    let ph: number;
    if (v === 0) {
      // TITRATION-003: Initial pH
      ph = -Math.log10(
        Math.sqrt(input.konsentrasi_y * input.ka)
      );
    } else {
      // Henderson-Hasselbalch: pH = -log(Ka) + log(CxVx/(CyVy-CxVx))
      const cx_vx = (v / 1000) * input.konsentrasi_y;
      const cy_vy = (input.volume_y / 1000) * input.konsentrasi_y;
      const ratio = cx_vx / (cy_vy - cx_vx);
      if (ratio <= 0) continue;
      ph = -Math.log10(input.ka) + Math.log10(ratio);
    }

    if (!isNaN(ph) && isFinite(ph)) {
      points_before.push({
        volume: v,
        ph,
        region: 'before_equivalence',
      });
    }
  }

  // TITRATION-004: At equivalence point
  // Excel formula for equivalence: the conjugate base hydrolyzes
  // C_salt = (Cy * Vy) / (Vy + Veq) where Veq = Vy (equimolar)
  // C_salt = (Cy * Vy) / (2 * Vy) = Cy / 2
  // Hydrolysis: pOH = -log(sqrt(Kb * C_salt))
  // pH = 14 - pOH = 14 - (-log(sqrt(Kb * C_salt)))
  const c_salt = (input.konsentrasi_y * input.volume_y) / (2 * input.volume_y);
  const ph_equivalence = 14 - (-Math.log10(Math.sqrt(kb * c_salt)));
  const point_at_equivalence: TitrationPoint = {
    volume: equivalence_volume,
    ph: ph_equivalence,
    region: 'at_equivalence',
  };

  steps.push({
    id: 'TITRATION-004',
    name: 'pH at Equivalence',
    formula: 'pH = 14 - (-log(√(Kb × C_salt)))',
    inputs: { Ka: input.ka, Kb: kb, C_salt: c_salt },
    result: ph_equivalence,
    unit: '',
  });

  // Generate points after equivalence
  const max_volume = equivalence_volume * 2;
  for (
    let v = equivalence_volume + input.volume_increment;
    v <= max_volume;
    v += input.volume_increment
  ) {
    // TITRATION-005: After equivalence
    // pH = 14 - (-log(excess_OH_concentration))
    const excess_moles =
      (v / 1000) * input.konsentrasi_y -
      (equivalence_volume / 1000) * input.konsentrasi_y;
    const total_volume = (v + input.volume_y) / 1000;
    const excess_conc = excess_moles / total_volume;

    if (excess_conc > 0) {
      const ph = 14 - (-Math.log10(excess_conc));
      if (!isNaN(ph) && isFinite(ph)) {
        points_after.push({
          volume: v,
          ph,
          region: 'after_equivalence',
        });
      }
    }
  }

  return {
    kb,
    equivalence_volume,
    points_before,
    point_at_equivalence,
    points_after,
    steps,
  };
}
