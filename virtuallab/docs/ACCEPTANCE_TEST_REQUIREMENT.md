# ACCEPTANCE TEST REQUIREMENT (Prompt #61)

> Application **CANNOT** be declared production-ready if **any critical formula test = FAIL**.

## Critical Modules

| # | Module | Test File | Status Gate |
|---|--------|-----------|-------------|
| 1 | **Moisture** | `tests/calculations/moisture.test.ts` | CRITICAL |
| 2 | **Ash** | `tests/calculations/ash.test.ts` | CRITICAL |
| 3 | **Protein** | `tests/calculations/protein.test.ts` | CRITICAL |
| 4 | **Protein Standardless** | `tests/calculations/protein.test.ts` | CRITICAL |
| 5 | **Carbohydrate** | `tests/calculations/carbohydrate.test.ts` | CRITICAL |
| 6 | **Standardization** | `tests/calculations/standardization.test.ts` | CRITICAL |
| 7 | **Assay** | `tests/excel-validation/excel-regression.test.ts` | CRITICAL |
| 8 | **Molar Mass** | `tests/calculations/molar-mass.test.ts` | CRITICAL |
| 9 | **Equivalent Weight** | `tests/excel-validation/excel-regression.test.ts` | CRITICAL |
| 10 | **Luff Schoorl** | `tests/calculations/luff-schoorl.test.ts` | CRITICAL |
| 11 | **Titration Curve** | `tests/calculations/titration-curve.test.ts` | CRITICAL |

## Acceptance Criteria

### Formula Correctness
- Every formula **MUST** match the Excel workbook within configured tolerance
- Tolerance: `1e-9` absolute for exact formulas, `1e-4` for floating-point sensitive formulas
- All Luff Schoorl table values must match exactly

### Edge Cases
- Zero denominator → IFERROR returns 0
- Negative mass → handled by validation layer
- Missing input → error status returned
- Decimal precision → must match Excel to 4+ decimal places

### Traceability
- Every calculation step has a unique formula ID (e.g., `MOISTURE-001`)
- Every step references the source Excel cell

## How to Run

```bash
# All acceptance tests
npm run test:acceptance

# Excel validation regression
npm run test:excel

# Full suite (acceptance + excel)
npm test

# With coverage report
npm run test:coverage

# Legacy engine test (non-Vitest)
npm run test:calc

# Excel validation report (standalone script)
npm run validate:excel
```

## Gate Rule

```
IF any test in critical modules = FAIL
THEN deployment is BLOCKED
```

No exceptions. All critical formula tests must pass before release.
