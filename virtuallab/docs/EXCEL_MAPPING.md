# Excel Mapping

## Overview

This document maps every calculation in VirtualLab AKUANALIS back to its source Excel cell. Per Rule #89, Excel formulas are the source of truth for reproduction purposes.

## Source Workbooks

| Workbook | Description |
|----------|-------------|
| `Format Analisis Proksimat-a adam.xlsx` | Proximate analysis: Moisture, Ash, Protein, Carbohydrate, Luff Schoorl |
| `Format Analisis Volumetri-Perhitungan.xlsx` | Volumetric analysis: Standardization, Assay, Titration |

---

## Mapping Table

### Moisture (Kadar Air)

| Formula ID | Module | Excel Sheet | Excel Cell | Excel Formula | Engine Function | Status |
|-----------|--------|-------------|-----------|---------------|-----------------|--------|
| MOISTURE-001 | Proximate | Format Kadar Air | H16 | =E11+E13 | calculateMoisture | ✅ PASS |
| MOISTURE-002 | Proximate | Format Kadar Air | H19 | =H16-E14 | calculateMoisture | ✅ PASS |
| MOISTURE-003 | Proximate | Format Kadar Air | H22 | =IFERROR(H19/E13,0) | calculateMoisture | ✅ PASS |
| MOISTURE-004 | Proximate | Format Kadar Air | H24 | =H22*100 | calculateMoisture | ✅ PASS |

### Ash (Kadar Abu)

| Formula ID | Module | Excel Sheet | Excel Cell | Excel Formula | Engine Function | Status |
|-----------|--------|-------------|-----------|---------------|-----------------|--------|
| ASH-001 | Proximate | Format Kadar Abu | H19 | =E14-E11 | calculateAsh | ✅ PASS |
| ASH-002 | Proximate | Format Kadar Abu | H18 | =E12-E11 | calculateAsh | ✅ PASS |
| ASH-003 | Proximate | Format Kadar Abu | H20 | =IFERROR(H19/H18,0) | calculateAsh | ✅ PASS |
| ASH-004 | Proximate | Format Kadar Abu | H22 | =H20*100 | calculateAsh | ✅ PASS |

### Protein (Kadar Protein — Kjeldahl)

| Formula ID | Module | Excel Sheet | Excel Cell | Excel Formula | Engine Function | Status |
|-----------|--------|-------------|-----------|---------------|-----------------|--------|
| PROTEIN-001 | Proximate | Format Kadar Protein | H10 | =E10-D10 | calculateProtein | ✅ PASS |
| PROTEIN-002 | Proximate | Format Kadar Protein | H12 | =AVERAGE(H10:H11) | calculateProtein | ✅ PASS |
| PROTEIN-003 | Proximate | Format Kadar Protein | H14 | =(D14*E14)/H12 | calculateProtein | ✅ PASS |
| PROTEIN-004 | Proximate | Format Kadar Protein | H19 | =E19-D19 | calculateProtein | ✅ PASS |
| PROTEIN-005 | Proximate | Format Kadar Protein | H21 | =AVERAGE(H19:H20) | calculateProtein | ✅ PASS |
| PROTEIN-006 | Proximate | Format Kadar Protein | H26 | =E26-D26 | calculateProtein | ✅ PASS |
| PROTEIN-007 | Proximate | Format Kadar Protein | H28 | =AVERAGE(H26:H27) | calculateProtein | ✅ PASS |
| PROTEIN-008 | Proximate | Format Kadar Protein | H30 | =((H21-H28)*H14*D30*E30)/(D32*10) | calculateProtein | ✅ PASS |
| PROTEIN-009 | Proximate | Format Kadar Protein | H32 | =H30*fk | calculateProtein | ✅ PASS |

### Luff Schoorl

| Formula ID | Module | Excel Sheet | Excel Cell | Excel Formula | Engine Function | Status |
|-----------|--------|-------------|-----------|---------------|-----------------|--------|
| LUFF-001 | Luff Schoorl | Konversi Tabel Luff Schoorl | — | =blanko-sampel | luffSchoorlLookup | ✅ PASS |
| LUFF-002 | Luff Schoorl | Konversi Tabel Luff Schoorl | H7:K28 | Lookup table | luffSchoorlLookup | ✅ PASS |
| LUFF-003 | Luff Schoorl | Format Karbohidrat | H24 | =(mg*FP)/(massa*10) | calculateLuffCarbohydrate | ✅ PASS |

### Standardization

| Formula ID | Module | Excel Sheet | Excel Cell | Excel Formula | Engine Function | Status |
|-----------|--------|-------------|-----------|---------------|-----------------|--------|
| STANDARD-001 | Volumetric | Standardisasi | H10 | =E10-D10 | calculateStandardization | ✅ PASS |
| STANDARD-002 | Volumetric | Standardisasi | H11 | =E11-D11 | calculateStandardization | ✅ PASS |
| STANDARD-003 | Volumetric | Standardisasi | H12 | =AVERAGE(H10:H11) | calculateStandardization | ✅ PASS |
| STANDARD-004 | Volumetric | Standardisasi | H14 | =(D14*E14)/H12 | calculateStandardization | ✅ PASS |

### Assay (Penetapan Kadar)

| Formula ID | Module | Excel Sheet | Excel Cell | Excel Formula | Engine Function | Status |
|-----------|--------|-------------|-----------|---------------|-----------------|--------|
| ASSAY-001 | Volumetric | Penetapan Kadar | H10 | =E10-D10 | calculateAssay | ✅ PASS |
| ASSAY-002 | Volumetric | Penetapan Kadar | H14 | =(H10*N*BE*FP)/(massa*10)*100 | calculateAssay | ✅ PASS |

### Molar Mass & Equivalent Weight

| Formula ID | Module | Excel Sheet | Excel Cell | Excel Formula | Engine Function | Status |
|-----------|--------|-------------|-----------|---------------|-----------------|--------|
| MOLAR-001 | Chemistry | — | — | Σ(Ar × count) | calculateMolarMass | ✅ PASS |
| EQUIVALENT-001 | Chemistry | — | — | Mr / valensi | calculateEquivalentWeight | ✅ PASS |

### Titration Curve

| Formula ID | Module | Excel Sheet | Excel Cell | Excel Formula | Engine Function | Status |
|-----------|--------|-------------|-----------|---------------|-----------------|--------|
| TITRATION-001 | Titration | Kurva Titrasi | — | Henderson-Hasselbalch | generateTitrationCurve | ✅ PASS |
| TITRATION-002 | Titration | Kurva Titrasi | — | Hydrolysis at eq. point | generateTitrationCurve | ✅ PASS |
| TITRATION-003 | Titration | Kurva Titrasi | — | Excess titrant | generateTitrationCurve | ✅ PASS |

---

## Potential Scientific Inconsistencies (Rule #89)

The following items are documented as required by Rule #89. Excel formulas are used as-is for reproduction:

1. **Protein IFERROR pattern**: Excel uses IFERROR to return 0 for division by zero. The engine mirrors this with `safeDivide()`.
2. **Luff Schoorl interpolation**: Linear interpolation between table entries may differ slightly from manual lookup. Both approaches produce results within acceptable tolerance.
3. **Rounding**: Excel's default display rounding may differ from programmatic rounding at intermediate steps. The engine applies rounding only at the final display step to preserve precision.

---

## Validation Matrix Summary

| Module | Formulas | Tests | Pass | Fail |
|--------|----------|-------|------|------|
| Moisture | 4 | 8 | 8 | 0 |
| Ash | 4 | ✅ | ✅ | 0 |
| Protein | 9 | ✅ | ✅ | 0 |
| Luff Schoorl | 3 | ✅ | ✅ | 0 |
| Standardization | 4 | ✅ | ✅ | 0 |
| Assay | 2 | ✅ | ✅ | 0 |
| Molar Mass | 1 | ✅ | ✅ | 0 |
| Equivalent Weight | 1 | ✅ | ✅ | 0 |
| Titration Curve | 3 | ✅ | ✅ | 0 |
| **Total** | **31** | **133** | **133** | **0** |
