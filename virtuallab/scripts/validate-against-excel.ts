/**
 * AUTOMATED EXCEL REGRESSION TEST (Prompt #60)
 * ===============================================
 * scripts/validate-against-excel.ts
 *
 * Workflow:
 *   Read Excel → Extract input cells → Extract formula cells
 *   → Calculate expected output → Run application calculation engine
 *   → Compare → Generate report
 *
 * Since we cannot read .xlsx at test time without the actual workbook open,
 * this script validates against KNOWN Excel values extracted from
 * FORMULA_SPECIFICATION.md and EXCEL_WORKBOOK_ANALYSIS.md.
 *
 * Every expected value is documented with its source cell reference.
 */

import {
  calculateMoisture,
  calculateAsh,
  calculateStandardization,
  calculateMolarMass,
  calculateEquivalentWeight,
  calculateCarbohydrate,
  calculateProtein,
  calculateKadar,
  calculateTitrationCurve,
  lookupLuffSchoorl,
  lookupAtomicMass,
} from '../src/lib/calculations/engine';

// ============================================================
// EXCEL CELL REFERENCES → KNOWN VALUES
// ============================================================
interface ExcelTestCase {
  module: string;
  description: string;
  excelCells: string;
  expected: number;
  actual: number;
  tolerance: number;
}

function runValidation(): ExcelTestCase[] {
  const cases: ExcelTestCase[] = [];

  // ── MOISTURE ──────────────────────────────────────────
  const moisture = calculateMoisture({
    bobot_wadah_kosong: 25.3420,
    bobot_sampel: 2.0015,
    bobot_setelah: 27.1230,
  });

  cases.push({
    module: 'Moisture',
    description: 'Weight before drying (H16)',
    excelCells: 'Format Kadar Air!H16',
    expected: 27.3435,
    actual: moisture.weight_before,
    tolerance: 1e-4,
  });

  cases.push({
    module: 'Moisture',
    description: 'Weight loss (H19)',
    excelCells: 'Format Kadar Air!H19',
    expected: 0.2205,
    actual: moisture.weight_loss,
    tolerance: 1e-4,
  });

  cases.push({
    module: 'Moisture',
    description: 'Moisture % (H24)',
    excelCells: 'Format Kadar Air!H24',
    expected: (0.2205 / 2.0015) * 100,
    actual: moisture.moisture_pct,
    tolerance: 1e-4,
  });

  // ── ASH ───────────────────────────────────────────────
  const ash = calculateAsh({
    bobot_wadah_kosong: 20.0120,
    bobot_cawan_sampel: 22.5430,
    bobot_setelah: 20.2610,
  });

  cases.push({
    module: 'Ash',
    description: 'Ash weight (H16)',
    excelCells: 'Format Kadar Abu!H16',
    expected: 0.2490,
    actual: ash.ash_weight,
    tolerance: 1e-4,
  });

  cases.push({
    module: 'Ash',
    description: 'Ash % (H21)',
    excelCells: 'Format Kadar Abu!H21',
    expected: (0.2490 / 2.5310) * 100,
    actual: ash.ash_pct,
    tolerance: 1e-2,
  });

  // ── STANDARDIZATION ───────────────────────────────────
  const std = calculateStandardization({
    volume_y: 10,
    konsentrasi_y: 0.1,
    simplo_awal: 0, simplo_akhir: 9.8,
    duplo_awal: 0, duplo_akhir: 10.2,
  });

  cases.push({
    module: 'Standardization',
    description: 'Volume avg (H14)',
    excelCells: 'FORMAT STANDARDISASI!H14',
    expected: 10.0,
    actual: std.volume_avg,
    tolerance: 1e-10,
  });

  cases.push({
    module: 'Standardization',
    description: 'Cx (P21)',
    excelCells: 'FORMAT STANDARDISASI!P21',
    expected: 0.1,
    actual: std.konsentrasi_x,
    tolerance: 1e-10,
  });

  // ── LUFF SCHOORL ──────────────────────────────────────
  cases.push({
    module: 'Luff Schoorl',
    description: 'Glucose at vol=10 (VLOOKUP)',
    excelCells: 'Konversi Tabel!lookup(10)',
    expected: 25.0,
    actual: lookupLuffSchoorl(10, 'glukosa_fruktosa'),
    tolerance: 1e-10,
  });

  cases.push({
    module: 'Luff Schoorl',
    description: 'Lactose at vol=10 (VLOOKUP)',
    excelCells: 'Konversi Tabel!lookup(10)',
    expected: 36.0,
    actual: lookupLuffSchoorl(10, 'laktosa'),
    tolerance: 1e-10,
  });

  // ── MOLAR MASS ────────────────────────────────────────
  const mm = calculateMolarMass({
    groups: [[
      { symbol: 'H', quantity: 2 },
      { symbol: 'O', quantity: 1 },
    ]],
  });

  cases.push({
    module: 'Molar Mass',
    description: 'H2O molar mass (Massa Molar)',
    excelCells: 'Massa Molar!G7+G8',
    expected: 2 * 1.008 + 15.999,
    actual: mm.totalMass,
    tolerance: 1e-6,
  });

  // ── EQUIVALENT WEIGHT ─────────────────────────────────
  const eq = calculateEquivalentWeight({
    groups: [[
      { symbol: 'H', quantity: 2 },
      { symbol: 'S', quantity: 1 },
      { symbol: 'O', quantity: 4 },
    ]],
    nValues: [2],
  });

  cases.push({
    module: 'Equivalent Weight',
    description: 'H2SO4 equivalent weight (K7)',
    excelCells: 'Bobot Ekuivalen!K7',
    expected: (2 * 1.008 + 32.065 + 4 * 15.999) / 2,
    actual: eq.equivalentWeights[0],
    tolerance: 1e-3,
  });

  // ── PROTEIN ───────────────────────────────────────────
  const protein = calculateProtein({
    std_simplo_awal: 0, std_simplo_akhir: 10.5,
    std_duplo_awal: 0, std_duplo_akhir: 10.3,
    volume_y: 10, konsentrasi_y: 0.1,
    blanko_simplo_awal: 0, blanko_simplo_akhir: 25.5,
    blanko_duplo_awal: 0, blanko_duplo_akhir: 25.3,
    sample_simplo_awal: 0, sample_simplo_akhir: 18.3,
    sample_duplo_awal: 0, sample_duplo_akhir: 18.5,
    konsentrasi_penitar: 0.1, ketetapan_protein: 14.007,
    faktor_pengenceran: 1, massa_sampel: 500,
    jenis_sampel: 'Tahu',
  });

  cases.push({
    module: 'Protein',
    description: 'Std Volume Avg (H12)',
    excelCells: 'Kadar Protein!H12',
    expected: 10.4,
    actual: protein.std_volume_avg,
    tolerance: 1e-10,
  });

  cases.push({
    module: 'Protein',
    description: 'Protein % (I66)',
    excelCells: 'Kadar Protein!I66',
    expected: ((7.0 * 0.1 * 14.007 * 1) / 500) * 5.75,
    actual: protein.protein_pct,
    tolerance: 1e-9,
  });

  // ── KADAR (ASSAY) ─────────────────────────────────────
  const kadar = calculateKadar({
    simplo_awal: 0, simplo_akhir: 12.5,
    duplo_awal: 0, duplo_akhir: 12.7,
    unsur_senyawa: 'Na',
    konsentrasi_penitar: 0.1,
    volume_sampel: 25,
    faktor_pengenceran: 1,
  });

  cases.push({
    module: 'Assay',
    description: 'Kadar Na (H30)',
    excelCells: 'FORMAT PENETAPAN KADAR!H30',
    expected: (12.6 * 22.990 * 0.1 * 1) / 25,
    actual: kadar.kadar,
    tolerance: 1e-4,
  });

  // ── TITRATION CURVE ───────────────────────────────────
  const tc = calculateTitrationCurve({
    ka: 1.82e-5,
    volume_y: 100,
    konsentrasi_y: 0.1,
    volume_increment: 10,
  });

  cases.push({
    module: 'Titration Curve',
    description: 'Kb (=10^-14/Ka)',
    excelCells: 'Curve Titration!calculated',
    expected: 1e-14 / 1.82e-5,
    actual: tc.kb,
    tolerance: 1e-15,
  });

  return cases;
}

// ============================================================
// GENERATE REPORT
// ============================================================
function generateReport(cases: ExcelTestCase[]): string {
  const header = `
╔══════════════════════════════════════════════════════════════════════════╗
║                     EXCEL VALIDATION REPORT                            ║
║   Generated: ${new Date().toISOString()}                    ║
╚══════════════════════════════════════════════════════════════════════════╝
`;

  const colModule = 22;
  const colExpected = 14;
  const colActual = 14;
  const colDiff = 14;
  const colStatus = 8;

  const separator = '-'.repeat(colModule + colExpected + colActual + colDiff + colStatus + 10);

  let report = header + '\n';
  report += `${'Module'.padEnd(colModule)} ${'Expected'.padStart(colExpected)} ${'Actual'.padStart(colActual)} ${'Difference'.padStart(colDiff)} ${'Status'.padStart(colStatus)}\n`;
  report += separator + '\n';

  let passCount = 0;
  let failCount = 0;

  for (const c of cases) {
    const diff = Math.abs(c.actual - c.expected);
    const status = diff <= c.tolerance ? 'PASS' : 'FAIL';
    if (status === 'PASS') passCount++;
    else failCount++;

    const moduleName = `${c.module}`.padEnd(colModule);
    const expected = c.expected.toFixed(6).padStart(colExpected);
    const actual = c.actual.toFixed(6).padStart(colActual);
    const diffStr = diff.toExponential(2).padStart(colDiff);
    const statusStr = status.padStart(colStatus);

    report += `${moduleName} ${expected} ${actual} ${diffStr} ${statusStr}\n`;
  }

  report += separator + '\n';
  report += `\nTOTAL: ${cases.length} | PASS: ${passCount} | FAIL: ${failCount}\n`;

  if (failCount > 0) {
    report += '\n❌ VALIDATION FAILED — Some formulas do not match Excel expected values.\n';
  } else {
    report += '\n✅ ALL VALIDATIONS PASSED — All formulas match Excel expected values.\n';
  }

  return report;
}

// ============================================================
// MAIN
// ============================================================
const cases = runValidation();
const report = generateReport(cases);

console.log(report);

// Exit with error code if any test failed
const failures = cases.filter(c => Math.abs(c.actual - c.expected) > c.tolerance);
if (failures.length > 0) {
  console.error('\nFailed cases:');
  for (const f of failures) {
    console.error(`  ✗ ${f.module}: ${f.description}`);
    console.error(`    Expected: ${f.expected}, Actual: ${f.actual}, Diff: ${Math.abs(f.actual - f.expected)}`);
  }
  process.exit(1);
} else {
  process.exit(0);
}
