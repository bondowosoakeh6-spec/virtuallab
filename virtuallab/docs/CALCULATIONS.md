# Calculations

## Philosophy

The Calculation Engine follows strict principles defined in Rule #79:

- **Deterministic**: Same inputs always produce the same outputs
- **Pure**: No side effects, no external state dependency
- **Testable**: Every function can be unit tested independently
- **Auditable**: Every calculation produces traceable steps with formula IDs
- **Versioned**: Formulas are versioned; results stored with the formula version used

**AI/LLM is never used for generating scientific numbers.** AI is only used for tutoring, explanation, and learning assistance.

## Formula Display Standard (Rule #80)

Every calculation must show the full derivation, not just the result:

```
Kadar Air
= Berat Air / Berat Sampel × 100
= 1.25 / 10.00 × 100
= 12.50%
```

This is implemented via `buildFormulaDisplay()` in `src/lib/calculations/formula-display.ts`.

## Excel Source of Truth (Rule #89)

All formulas are reverse-engineered from the source Excel workbooks:
- `Format Analisis Proksimat-a adam.xlsx`
- `Format Analisis Volumetri-Perhitungan.xlsx`

If any conflict exists between scientific convention and the Excel formula, **Excel is the source of truth** for reproduction purposes. Discrepancies are documented.

---

## Calculation Modules

### 1. Proximate Analysis — Moisture (Kadar Air)

**Source**: Format Kadar Air sheet

| ID | Name | Formula | Source Cell | Unit |
|----|------|---------|------------|------|
| MOISTURE-001 | Bobot Sebelum Pengeringan | wadah_kosong + sampel | H16 | g |
| MOISTURE-002 | Berat Air | bobot_sebelum − bobot_setelah | H19 | g |
| MOISTURE-003 | Fraksi Kadar Air | berat_air / bobot_sampel | H22 | — |
| MOISTURE-004 | Kadar Air (%) | fraksi × 100 | H24 | % |

**Inputs**: bobot_wadah_kosong, bobot_cawan_sampel, bobot_sampel, bobot_setelah

### 2. Proximate Analysis — Ash (Kadar Abu)

**Source**: Format Kadar Abu sheet

| ID | Name | Formula | Source Cell | Unit |
|----|------|---------|------------|------|
| ASH-001 | Berat Abu | bobot_setelah − wadah_kosong | H19 | g |
| ASH-002 | Bobot Sampel | cawan_sampel − wadah_kosong | H18 | g |
| ASH-003 | Fraksi Kadar Abu | berat_abu / bobot_sampel | H20 | — |
| ASH-004 | Kadar Abu (%) | fraksi × 100 | H22 | % |

### 3. Proximate Analysis — Protein (Kjeldahl)

**Source**: Format Kadar Protein sheet

| ID | Name | Formula | Unit |
|----|------|---------|------|
| PROTEIN-001 | Volume Titrasi (Simplo/Duplo) | akhir − awal | mL |
| PROTEIN-002 | Rata-rata Volume | AVERAGE(simplo, duplo) | mL |
| PROTEIN-003 | Konsentrasi X | (V_Y × N_Y) / V_X_avg | N |
| PROTEIN-004 | Vol Blanko (Simplo/Duplo) | akhir − awal | mL |
| PROTEIN-005 | Rata-rata Vol Blanko | AVERAGE(simplo, duplo) | mL |
| PROTEIN-006 | Vol Sampel (Simplo/Duplo) | akhir − awal | mL |
| PROTEIN-007 | Rata-rata Vol Sampel | AVERAGE(simplo, duplo) | mL |
| PROTEIN-008 | % N | ((V_blanko − V_sampel) × N × Ar_N × FP) / (massa × 10) | % |
| PROTEIN-009 | Kadar Protein | % N × faktor_konversi | % |

### 4. Proximate Analysis — Protein Standardless

Same as Protein but without the standardization step. Uses a known titrant concentration directly.

### 5. Proximate Analysis — Carbohydrate (By Difference)

| ID | Name | Formula | Unit |
|----|------|---------|------|
| CARBO-001 | Karbohidrat | 100 − (air + abu + protein + lemak) | % |

### 6. Luff Schoorl

**Source**: Konversi Tabel Luff Schoorl sheet

| ID | Name | Formula | Unit |
|----|------|---------|------|
| LUFF-001 | Volume Na₂S₂O₃ | blanko − sampel | mL |
| LUFF-002 | Glucose/Fructose (mg) | Lookup table interpolation | mg |
| LUFF-003 | Lactose (mg) | Lookup table interpolation | mg |
| LUFF-004 | Maltose (mg) | Lookup table interpolation | mg |
| LUFF-005 | Kadar Karbohidrat | (mg_gula × FP) / (massa_sampel × 10) | % |

The lookup table maps Na₂S₂O₃ volume (0.5–24.0 mL) to mg sugar. Linear interpolation is used between table entries.

### 7. Volumetric — Standardization

| ID | Name | Formula | Unit |
|----|------|---------|------|
| STANDARD-001 | Volume Simplo | akhir − awal | mL |
| STANDARD-002 | Volume Duplo | akhir − awal | mL |
| STANDARD-003 | Rata-rata Volume | AVERAGE(simplo, duplo) | mL |
| STANDARD-004 | Konsentrasi X | (V_Y × N_Y) / V_X | N |

### 8. Volumetric — Assay (Penetapan Kadar)

| ID | Name | Formula | Unit |
|----|------|---------|------|
| ASSAY-001 | Volume Titrasi | akhir − awal | mL |
| ASSAY-002 | Kadar | (V × N × BE × FP) / (massa × 10) × 100 | % |

### 9. Chemistry — Molar Mass

| ID | Name | Formula | Unit |
|----|------|---------|------|
| MOLAR-001 | Massa Molar | Σ (atomic_mass × count) | g/mol |

Uses the built-in periodic table with 118 elements.

### 10. Chemistry — Equivalent Weight

| ID | Name | Formula | Unit |
|----|------|---------|------|
| EQUIVALENT-001 | Bobot Ekuivalen | molar_mass / valence | g/eq |

### 11. Titration Curve

| ID | Name | Formula | Unit |
|----|------|---------|------|
| TITRATION-001 | pH before equivalence | Henderson-Hasselbalch / strong acid formula | — |
| TITRATION-002 | pH at equivalence | Hydrolysis calculation | — |
| TITRATION-003 | pH after equivalence | Excess titrant calculation | — |

Generates an array of (volume, pH) data points for plotting.

---

## Rounding Rules

- Default display: 4 decimal places
- Percentages: 2 decimal places
- `displayValue(value, decimals)` — formats numbers for display
- `safeDivide(a, b)` — returns 0 when denominator is 0 (matches Excel IFERROR pattern)

## Validation

Input validation is performed before calculation:
- Required fields checked
- Numeric range validation (min/max)
- Type checking
- Error messages returned in Indonesian

## Error Handling

Calculation-specific errors (Rule #85):
- `CALCULATION_DIVISION_BY_ZERO` — safeDivide returns 0
- `INVALID_INPUT` — input fails validation
- `MISSING_PARAMETER` — required input not provided
- `FORMULA_NOT_FOUND` — unknown formula ID
- `LOOKUP_VALUE_NOT_FOUND` — Luff Schoorl value outside table range
