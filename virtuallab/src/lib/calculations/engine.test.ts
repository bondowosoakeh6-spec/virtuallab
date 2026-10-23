/**
 * Calculation Engine Tests
 * Validates all formulas against the Excel Source of Truth
 * 
 * Each test maps to a formula ID from FORMULA_SPECIFICATION.md
 */
import {
  calculateMoisture,
  calculateAsh,
  calculateProtein,
  calculateCarbohydrate,
  calculateMolarMass,
  calculateEquivalentWeight,
  calculateStandardization,
  calculateKadar,
  calculateTitrationCurve,
  lookupAtomicMass,
  lookupLuffSchoorl,
  lookupProteinFactor,
  safeDivide,
} from './engine';

// ============================================================
// Helper
// ============================================================
function expectClose(actual: number, expected: number, tolerance = 0.01) {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(
      `FAIL: Expected ${expected} ± ${tolerance}, got ${actual} (diff=${diff})`
    );
  }
  return true;
}

// ============================================================
// TEST SUITE
// ============================================================
interface TestResult {
  id: string;
  module: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'SKIPPED';
  expected?: number;
  actual?: number;
  error?: string;
}

const results: TestResult[] = [];

function runTest(
  id: string,
  module: string,
  description: string,
  fn: () => void
) {
  try {
    fn();
    results.push({ id, module, description, status: 'PASS' });
  } catch (e: any) {
    results.push({ id, module, description, status: 'FAIL', error: e.message });
  }
}

// ============================================================
// 1. MOISTURE CONTENT TESTS
// ============================================================
runTest('MOISTURE-001', 'Kadar Air', 'Weight before drying', () => {
  const r = calculateMoisture({
    bobot_wadah_kosong: 25.3420,
    bobot_sampel: 2.0015,
    bobot_setelah: 27.1230,
  });
  // H16 = 25.3420 + 2.0015 = 27.3435
  expectClose(r.weight_before, 27.3435);
});

runTest('MOISTURE-002', 'Kadar Air', 'Weight loss', () => {
  const r = calculateMoisture({
    bobot_wadah_kosong: 25.3420,
    bobot_sampel: 2.0015,
    bobot_setelah: 27.1230,
  });
  // H19 = 27.3435 - 27.1230 = 0.2205
  expectClose(r.weight_loss, 0.2205);
});

runTest('MOISTURE-003', 'Kadar Air', 'Moisture fraction', () => {
  const r = calculateMoisture({
    bobot_wadah_kosong: 25.3420,
    bobot_sampel: 2.0015,
    bobot_setelah: 27.1230,
  });
  // H22 = 0.2205 / 2.0015 = 0.11017
  expectClose(r.moisture_fraction, 0.11017, 0.001);
});

runTest('MOISTURE-004', 'Kadar Air', 'Moisture percentage', () => {
  const r = calculateMoisture({
    bobot_wadah_kosong: 25.3420,
    bobot_sampel: 2.0015,
    bobot_setelah: 27.1230,
  });
  // H24 = 0.11017 * 100 = 11.017%
  expectClose(r.moisture_pct, 11.017, 0.1);
});

runTest('MOISTURE-005', 'Kadar Air', 'Zero division handling', () => {
  const r = calculateMoisture({
    bobot_wadah_kosong: 0,
    bobot_sampel: 0,
    bobot_setelah: 0,
  });
  // IFERROR pattern should return 0
  expectClose(r.moisture_fraction, 0);
  expectClose(r.moisture_pct, 0);
});

// ============================================================
// 2. ASH CONTENT TESTS
// ============================================================
runTest('ASH-001', 'Kadar Abu', 'Ash weight', () => {
  const r = calculateAsh({
    bobot_wadah_kosong: 20.0120,
    bobot_cawan_sampel: 22.5430,
    bobot_setelah: 20.2610,
  });
  // E15 = 20.2610 - 20.0120 = 0.2490
  expectClose(r.ash_weight, 0.2490);
});

runTest('ASH-002', 'Kadar Abu', 'Sample weight', () => {
  const r = calculateAsh({
    bobot_wadah_kosong: 20.0120,
    bobot_cawan_sampel: 22.5430,
    bobot_setelah: 20.2610,
  });
  // H17 = 22.5430 - 20.0120 = 2.5310
  expectClose(r.sample_weight, 2.531);
});

runTest('ASH-003', 'Kadar Abu', 'Ash percentage', () => {
  const r = calculateAsh({
    bobot_wadah_kosong: 20.0120,
    bobot_cawan_sampel: 22.5430,
    bobot_setelah: 20.2610,
  });
  // H19 = 0.2490 / 2.5310 = 0.09838
  // H21 = 9.838%
  expectClose(r.ash_pct, 9.838, 0.1);
});

// ============================================================
// 3. PROTEIN TESTS (Kjeldahl)
// ============================================================
runTest('PROTEIN-001', 'Kadar Protein', 'Standardization average', () => {
  const r = calculateProtein({
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
  // AVERAGE(10.5, 10.3) = 10.4
  expectClose(r.std_volume_avg, 10.4);
});

runTest('PROTEIN-002', 'Kadar Protein', 'Concentration X', () => {
  const r = calculateProtein({
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
  // Cx = (10 * 0.1) / 10.4 = 0.09615
  expectClose(r.konsentrasi_x, 0.09615, 0.001);
});

runTest('PROTEIN-003', 'Kadar Protein', 'Nitrogen percentage', () => {
  const r = calculateProtein({
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
  // blanko_avg = 25.4, sample_avg = 18.4
  // V_diff = 7.0, product = 7.0 * 0.1 * 14.007 * 1 = 9.8049
  // %N = 9.8049 / 500 = 0.019610
  expectClose(r.nitrogen_pct, 0.01961, 0.001);
});

runTest('PROTEIN-004', 'Kadar Protein', 'Protein percentage with Tahu factor', () => {
  const r = calculateProtein({
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
  // %Protein = %N * 5.75
  expectClose(r.conversion_factor, 5.75);
  expectClose(r.protein_pct, 0.01961 * 5.75, 0.01);
});

// ============================================================
// 4. MOLAR MASS TESTS
// ============================================================
runTest('MOLAR-001', 'Massa Molar', 'H2O molar mass', () => {
  const r = calculateMolarMass({
    groups: [[
      { symbol: 'H', quantity: 2 },
      { symbol: 'O', quantity: 1 },
    ]],
  });
  // Mr(H2O) = 2*1.008 + 15.999 = 18.015
  expectClose(r.totalMass, 18.015, 0.01);
});

runTest('MOLAR-002', 'Massa Molar', 'NaCl molar mass', () => {
  const r = calculateMolarMass({
    groups: [[
      { symbol: 'Na', quantity: 1 },
      { symbol: 'Cl', quantity: 1 },
    ]],
  });
  // Mr(NaCl) = 22.990 + 35.453 = 58.443
  expectClose(r.totalMass, 58.443, 0.01);
});

runTest('MOLAR-003', 'Massa Molar', 'H2SO4 molar mass', () => {
  const r = calculateMolarMass({
    groups: [[
      { symbol: 'H', quantity: 2 },
      { symbol: 'S', quantity: 1 },
      { symbol: 'O', quantity: 4 },
    ]],
  });
  // Mr(H2SO4) = 2*1.008 + 32.065 + 4*15.999 = 98.077
  expectClose(r.totalMass, 98.077, 0.01);
});

// ============================================================
// 5. EQUIVALENT WEIGHT TESTS
// ============================================================
runTest('EQUIVALENT-001', 'Bobot Ekuivalen', 'H2SO4 equivalent weight', () => {
  const r = calculateEquivalentWeight({
    groups: [[
      { symbol: 'H', quantity: 2 },
      { symbol: 'S', quantity: 1 },
      { symbol: 'O', quantity: 4 },
    ]],
    nValues: [2],
  });
  // BE = 98.077 / 2 = 49.039
  expectClose(r.equivalentWeights[0], 49.039, 0.1);
});

runTest('EQUIVALENT-002', 'Bobot Ekuivalen', 'NaOH equivalent weight', () => {
  const r = calculateEquivalentWeight({
    groups: [[
      { symbol: 'Na', quantity: 1 },
      { symbol: 'O', quantity: 1 },
      { symbol: 'H', quantity: 1 },
    ]],
    nValues: [1],
  });
  // BE = (22.990+15.999+1.008) / 1 = 39.997
  expectClose(r.equivalentWeights[0], 39.997, 0.01);
});

// ============================================================
// 6. STANDARDIZATION TESTS
// ============================================================
runTest('STANDARD-001', 'Standardisasi', 'Concentration calculation', () => {
  const r = calculateStandardization({
    volume_y: 10,
    konsentrasi_y: 0.1,
    simplo_awal: 0, simplo_akhir: 9.8,
    duplo_awal: 0, duplo_akhir: 10.2,
  });
  // V_avg = 10.0, Cx = (10*0.1)/10.0 = 0.1
  expectClose(r.volume_avg, 10.0);
  expectClose(r.konsentrasi_x, 0.1);
});

// ============================================================
// 7. KADAR (CONCENTRATION) TESTS
// ============================================================
runTest('KADAR-001', 'Penetapan Kadar', 'Kadar calculation', () => {
  const r = calculateKadar({
    simplo_awal: 0, simplo_akhir: 12.5,
    duplo_awal: 0, duplo_akhir: 12.7,
    unsur_senyawa: 'Na',
    konsentrasi_penitar: 0.1,
    volume_sampel: 25,
    faktor_pengenceran: 1,
  });
  // V_avg = 12.6, Ar(Na) = 22.990
  // Kadar = (12.6 * 22.990 * 0.1 * 1) / 25 = 1.1587
  expectClose(r.volume_avg, 12.6);
  expectClose(r.kadar, 1.1587, 0.01);
});

// ============================================================
// 8. TITRATION CURVE TESTS
// ============================================================
runTest('TITRATION-001', 'Kurva Titrasi', 'Kb calculation', () => {
  const r = calculateTitrationCurve({
    ka: 1.82e-5,
    volume_y: 100,
    konsentrasi_y: 0.1,
    volume_increment: 10,
  });
  // Kb = 1e-14 / 1.82e-5 = 5.4945e-10
  expectClose(r.kb, 5.4945e-10, 1e-12);
});

runTest('TITRATION-002', 'Kurva Titrasi', 'pH at equivalence point', () => {
  const r = calculateTitrationCurve({
    ka: 1.82e-5,
    volume_y: 100,
    konsentrasi_y: 0.1,
    volume_increment: 10,
  });
  // pH = -log(sqrt(Ka*Kb)) = -log(sqrt(1.82e-5 * 5.4945e-10))
  // = -log(sqrt(1e-14)) = -log(1e-7) = 7
  // Actually: -log(sqrt(1.82e-5 * 5.4945e-10)) ≈ 8.72
  expectClose(r.point_at_equivalence.ph, 8.72, 0.1);
});

runTest('TITRATION-003', 'Kurva Titrasi', 'Correct number of data points', () => {
  const r = calculateTitrationCurve({
    ka: 1.82e-5,
    volume_y: 100,
    konsentrasi_y: 0.1,
    volume_increment: 10,
  });
  // Before: 0,10,20,...,90 = up to 10 points
  // After: 110,120,...,200 = 10 points
  if (r.points_before.length < 5) throw new Error(`Too few before points: ${r.points_before.length}`);
  if (r.points_after.length < 5) throw new Error(`Too few after points: ${r.points_after.length}`);
});

// ============================================================
// 9. LOOKUP TESTS
// ============================================================
runTest('LOOKUP-001', 'Lookups', 'Atomic mass lookup - Na', () => {
  expectClose(lookupAtomicMass('Na'), 22.990, 0.001);
});

runTest('LOOKUP-002', 'Lookups', 'Atomic mass lookup - invalid', () => {
  expectClose(lookupAtomicMass('Xx'), 0);
});

runTest('LOOKUP-003', 'Lookups', 'Luff Schoorl exact match', () => {
  expectClose(lookupLuffSchoorl(1, 'glukosa_fruktosa'), 2.4);
  expectClose(lookupLuffSchoorl(10, 'laktosa'), 36.0);
  expectClose(lookupLuffSchoorl(23, 'maltosa'), 94.6);
});

runTest('LOOKUP-004', 'Lookups', 'Luff Schoorl interpolation', () => {
  // 12.5 should interpolate between vol 12 (30.3) and vol 13 (33.0)
  // = 30.3 + 0.5 * (33.0 - 30.3) = 30.3 + 1.35 = 31.65
  expectClose(lookupLuffSchoorl(12.5, 'glukosa_fruktosa'), 31.65, 0.1);
});

runTest('LOOKUP-005', 'Lookups', 'Protein factor - Tahu', () => {
  expectClose(lookupProteinFactor('Tahu'), 5.75);
  expectClose(lookupProteinFactor('tahu'), 5.75); // case insensitive
});

runTest('EDGE-001', 'Edge Cases', 'Safe divide by zero', () => {
  expectClose(safeDivide(10, 0), 0);
  expectClose(safeDivide(0, 0), 0);
});

// ============================================================
// PRINT RESULTS
// ============================================================
console.log('\n' + '='.repeat(80));
console.log('CALCULATION ENGINE TEST RESULTS');
console.log('='.repeat(80));

let pass = 0, fail = 0;
for (const r of results) {
  const icon = r.status === 'PASS' ? '✓' : '✗';
  const color = r.status === 'PASS' ? '' : ' *** ';
  console.log(`  ${icon} [${r.id}] ${r.module} — ${r.description} ${color}${r.error || ''}`);
  if (r.status === 'PASS') pass++;
  else fail++;
}

console.log('\n' + '-'.repeat(80));
console.log(`TOTAL: ${results.length} | PASS: ${pass} | FAIL: ${fail}`);
console.log('='.repeat(80));

if (fail > 0) {
  console.log('\n❌ Some tests FAILED');
  process.exit(1);
} else {
  console.log('\n✅ All tests PASSED');
}
