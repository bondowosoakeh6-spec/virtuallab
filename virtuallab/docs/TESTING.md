# Testing

## Overview

VirtualLab AKUANALIS uses a comprehensive testing strategy to ensure all calculations faithfully reproduce Excel workbook results.

## Test Pyramid

```
         ╱  E2E Tests  ╲         ← Playwright (browser-level)
        ╱  Integration   ╲       ← Vitest (API + cross-module)
       ╱   Unit Tests     ╲      ← Vitest (133 tests, 12 files)
      ╱  Excel Validation  ╲     ← Vitest (regression against Excel)
```

## Test Tools

| Tool | Purpose | Config |
|------|---------|--------|
| Vitest | Unit + Integration tests | `vitest.config.ts` |
| Playwright | E2E browser tests | `playwright.config.ts` |

## Commands

| Command | Description |
|---------|-------------|
| `npm run test` | Run all Vitest tests |
| `npm run test:watch` | Watch mode (re-run on changes) |
| `npm run test:acceptance` | Run calculation acceptance tests only |
| `npm run test:excel` | Run Excel validation/regression tests only |
| `npm run test:integration` | Run integration tests |
| `npm run test:coverage` | Run with code coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run validate:excel` | Run Excel validation script |

## Unit Tests (Vitest)

All 133 tests PASS. Located in `tests/calculations/`:

### Test Files

| File | Module | Tests | Description |
|------|--------|-------|-------------|
| `moisture.test.ts` | Kadar Air | 8 | Standard case, zero denominator, negative mass, decimal precision, safeDivide |
| `ash.test.ts` | Kadar Abu | Multiple | Standard case, edge cases, step traceability |
| `protein.test.ts` | Kadar Protein | Multiple | Full Kjeldahl pipeline, conversion factors, edge cases |
| `carbohydrate.test.ts` | Karbohidrat | Multiple | By-difference calculation |
| `luff-schoorl.test.ts` | Luff Schoorl | Multiple | Lookup table, interpolation, boundary values |
| `standardization.test.ts` | Standardisasi | Multiple | Volume calculation, concentration, zero handling |
| `average.test.ts` | Average | Multiple | Excel AVERAGE equivalent |
| `element-lookup.test.ts` | Element Lookup | 11 | Na lookup, unknown element, database integrity (118 elements) |
| `molar-mass.test.ts` | Massa Molar | Multiple | H2O, NaCl, H2SO4, NaOH, unknown element |
| `titration-curve.test.ts` | Kurva Titrasi | Multiple | Curve generation, pH calculations |
| `titration-volume.test.ts` | Volume Titrasi | Multiple | Standard case, edge cases |
| `excel-regression.test.ts` | Excel Validation | Multiple | Compares engine output to Excel expected values |

### Test Principles

1. **Every formula has a test** — mapped by formula ID (MOISTURE-001, ASH-001, etc.)
2. **Excel comparison** — expected values taken directly from Excel workbooks
3. **Edge cases** — zero denominators, negative values, missing inputs
4. **Traceability** — tests verify step IDs and formula displays
5. **Tolerance** — floating-point comparisons use appropriate precision (±0.001)

## Excel Validation

### Automated Script

`scripts/validate-against-excel.ts` runs all formulas against known Excel input/output pairs:

```bash
npm run validate:excel
```

Output format:
```
MOISTURE-001: PASS (expected: 27.3435, got: 27.3435)
MOISTURE-002: PASS (expected: 0.2205, got: 0.2205)
...
```

### Regression Tests

`tests/excel-validation/excel-regression.test.ts` contains:
- Input datasets extracted from Excel workbooks
- Expected outputs copied from Excel cells
- Comparison with configurable tolerance

### Test Case Generation (Rule #94)

For every critical formula:
1. Input taken from Excel workbook
2. Expected output calculated in Excel
3. Engine runs the calculation
4. Results compared
5. Result stored as PASS / FAIL / SKIPPED

**No UNKNOWN status** for critical formulas.

## Integration Tests

Located in `tests/integration/`:

- `api-calculations.test.ts` — Cross-module calculation pipelines
- `formula-display.test.ts` — Formula display output format (Rule #80)
- `formula-versioning.test.ts` — Formula ID patterns, rounding, validation

## E2E Tests (Playwright)

Located in `tests/e2e/`:

| File | Scope | Tests |
|------|-------|-------|
| `auth.spec.ts` | Authentication | Login, logout, protected routes |
| `student-flow.spec.ts` | Student workflow | Dashboard, experiments, calculations, grades |
| `instructor-flow.spec.ts` | Instructor workflow | Classes, submissions, grading |
| `admin-flow.spec.ts` | Admin workflow | Users, formulas, audit log, chemistry DB |

### Running E2E Tests

```bash
# Make sure dev server is running
npm run dev

# In another terminal
npm run test:e2e
```

## Adding New Test Cases

### For a new calculation formula:

1. Create test in `tests/calculations/[module].test.ts`
2. Add Excel expected values from the source workbook
3. Call the calculation function with test inputs
4. Assert result matches expected value within tolerance
5. Verify step IDs are present in the output

```typescript
import { describe, it, expect } from 'vitest';
import { calculateMoisture } from '@/lib/calculations';

describe('New Formula Test', () => {
  it('should match Excel expected value', () => {
    const result = calculateMoisture({
      bobot_wadah_kosong: 25.342,
      bobot_cawan_sampel: 27.343,
      bobot_sampel: 2.001,
      bobot_setelah: 27.123,
    });
    expect(result.status).toBe('SUCCESS');
    expect(result.result).toBeCloseTo(10.99, 2);
  });
});
```

## Final Acceptance Gate (Rule #96)

Project achieves PRODUCTION READY only when:

```bash
npm run test          # ✅ ALL PASS
npm run test:e2e      # ✅ ALL PASS
npm run validate:excel # ✅ ALL PASS
npm run build         # ✅ SUCCESS
```

And no critical security issues exist.
