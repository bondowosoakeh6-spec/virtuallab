# Excel Workbook Analysis

A comprehensive mapping of both workbooks.

## Workbook 1: Format Analisis Proksimat-a adam.xlsx

### Summary
- Total sheets: 8
- Sheets: Format Kadar Air, Format Kadar Abu, Format Kadar Protein, Format %Protein_standarless, karbo, karbo (2), Konversi Tabel Luff Schoorl, Rekap Kegiatan

### Sheet: Format Kadar Air
**Summary:** Moisture Content calculation.
- **INPUT CELLS:** E11, E13, E14
- **OUTPUT CELLS:** H24, H38
- **DEPENDENCY CHAIN:** E11, E13, E14 -> H16, J16 -> H19, H20 -> H22 -> H24

**Detailed Formula Table**
| Cell | Formula | Type | Inputs | Label/Description | Unit | Cached Value |
|------|---------|------|--------|-------------------|------|--------------|
| E12 | `=IFERROR(H16,"0,0000")` | conditional | H16 | Bobot cawan kosong + sampel | mg | 0,0000 |
| E16 | `=H24` | calculation | H24 | Kadar Air (%) | % | 0 |
| H16 | `=IFERROR(H13+J13,"0,0000")` | conditional | H13, J13 | =H24 | - | 0,0000 |
| H19 | `=IFERROR(H16-J16,"0,0000")` | conditional | H16, J16 | weight loss | - | 0,0000 |
| H22 | `=IFERROR(H19/H20,"0")` | conditional | H19, H20 | moisture fraction | - | 0 |
| H24 | `=H22*100` | calculation | H22 | moisture % | % | 0 |
| H33 | `=IFERROR(E12-E14,"0,0000")` | conditional | E12, E14 | Berat sampel | - | 0,0000 |
| H36 | `=IFERROR(H33/H34,"0")` | conditional | H33, H34 | - | - | 0 |
| H38 | `=H36*100` | calculation | H36 | Kadar Air (%) | % | 0 |

### Sheet: Format Kadar Abu
**Summary:** Ash Content calculation.
- **INPUT CELLS:** E11, E12, E14
- **OUTPUT CELLS:** H21, H38
- **DEPENDENCY CHAIN:** E11, E12, E14 -> H16, H17 -> H19 -> H21

**Detailed Formula Table**
| Cell | Formula | Type | Inputs | Label/Description | Unit | Cached Value |
|------|---------|------|--------|-------------------|------|--------------|
| E15 | `=E14-$E$11` | calculation | E14, E11 | Bobot sampel sesudah pemanasan | - | 0 |
| H16 | `=H13-$J$13` | calculation | H13, J13 | Hasil | - | 0 |
| H17 | `=H14-$J$14` | calculation | H14, J14 | =H21 | - | 0 |
| H19 | `=IFERROR($H$16/$H$17,"0")` | conditional | H16, H17 | ratio | - | 0 |
| H21 | `=IFERROR($H$19,"0%")` | conditional | H19 | as % | % | 0 |

### Sheet: Format Kadar Protein
**Summary:** Protein Content with standardization (Kjeldahl method).
- **INPUT CELLS:** D18, D19, F10, G10, F11, G11, F35, G35, F36, G36, F39, G39, F40, G40, D50
- **OUTPUT CELLS:** E68, E97
- **DEPENDENCY CHAIN:** Titration volumes -> Average volumes -> Standardization -> %Nitrogen -> %Protein

**Detailed Formula Table**
| Cell | Formula | Type | Inputs | Label/Description | Unit | Cached Value |
|------|---------|------|--------|-------------------|------|--------------|
| H12 | `=AVERAGE(H10:H11)` | aggregation | H10, H11 | Volume rata-rata penitar | ml | 0 |
| H28 | `=IFERROR(H25/H26,"0")` | conditional | H25, H26 | Konsentrasi X | - | 0 |
| H37 | `=AVERAGE(H35:H36)` | aggregation | H35, H36 | Vol rata-rata blanko | ml | 0 |
| H41 | `=AVERAGE(H39:H40)` | aggregation | H39, H40 | Vol rata-rata sampel | ml | 0 |
| I55 | `=PRODUCT(I52:O52)` | calculation | I52:O52 | product (vol_diff * conc * 14.007 * dil) | - | 0 |
| I59 | `=IFERROR(I55/I56,"0%")` | conditional | I55, I56 | % Nitrogen | % | 0% |
| E66 | `=IFERROR(VLOOKUP(E65,D105:E122,2,FALSE),"0")`| lookup | E65, D105, E122| conversion_factor | - | 0 |
| I66 | `=PRODUCT(I64:K64)` | calculation | I64, K64 | % Protein | % | 0 |

### Sheet: Format %Protein_standarless
**Summary:** Protein Content without separate standardization. Inline standardization data is provided.
- **INPUT CELLS:** D27, D29, D30, D31, E42
- **OUTPUT CELLS:** E45, E74
- **DEPENDENCY CHAIN:** Blank/Sample volumes -> %Nitrogen -> %Protein via VLOOKUP

**Detailed Formula Table**
| Cell | Formula | Type | Inputs | Label/Description | Unit | Cached Value |
|------|---------|------|--------|-------------------|------|--------------|
| H14 | `=AVERAGE(H12:H13)` | aggregation | H12, H13 | Vol rata-rata blanko | ml | 0 |
| H18 | `=AVERAGE(H16:H17)` | aggregation | H16, H17 | Vol rata-rata sampel | ml | 0 |
| I36 | `=IFERROR(I32/I33,"0%")` | conditional | I32, I33 | % Nitrogen | % | 0.0286 |
| E43 | `=IFERROR(VLOOKUP(E42,D82:E100,2,FALSE),"0")`| lookup | E42, D82, E100 | Faktor Konversi | - | 5.75 |
| I43 | `=PRODUCT(I41:K41)` | calculation | I41, K41 | % Protein | % | 0.1646 |

### Sheet: karbo / karbo (2)
**Summary:** Carbohydrate (Luff Schoorl method). Uses standardization of Na-thiosulfate and evaluates glucose % via Luff Schoorl lookup table.
- **INPUT CELLS:** E12, F12, E13, F13, E38, F38, E39, F39, E42, F42, E43, F43
- **OUTPUT CELLS:** G114, G207
- **DEPENDENCY CHAIN:** Titration volumes -> Average -> Interpolation -> %Glucose -> %Karbohidrat

**Detailed Formula Table**
| Cell | Formula | Type | Inputs | Label/Description | Unit | Cached Value |
|------|---------|------|--------|-------------------|------|--------------|
| G14 | `=AVERAGE(G12:G13)` | aggregation | G12, G13 | Vol rata-rata penitar | ml | 0 |
| G40 | `=AVERAGE(G38:G39)` | aggregation | G38, G39 | Vol rata-rata blanko | ml | 0 |
| G44 | `=AVERAGE(G42:G43)` | aggregation | G42, G43 | Vol rata-rata sampel | ml | 0 |
| H58 | `=IFERROR(H55/H56,"0")` | conditional | H55, H56 | Volume Natrium Tiosulfat 0,1 N | ml | 0 |
| D72 | `=IFERROR(VLOOKUP(D70,H70:K93,2,TRUE),"...")`| lookup | D70, H70:K93 | Konversi volume ke mg Gula | mg | - |
| G104| `=IFERROR(G101/G102,"0%")`| conditional | G101, G102 | % Glukosa | % | 0% |
| D112| `=IFERROR(VLOOKUP(D111,C121:D122,2,TRUE),"0")`| lookup | D111, C121:D122| Faktor Konversi (Carbo) | - | 0 |
| G114| `=IFERROR(PRODUCT(G112:I112),"0%")` | conditional | G112:I112 | % Karbohidrat | % | 0% |
| G133| `=VLOOKUP(G134,C148:F169,1,TRUE)` | lookup | G134, C148:F169 | Interpolation Base | - | 12 |

### Sheet: Konversi Tabel Luff Schoorl
**Summary:** Luff Schoorl table values.
- **INPUT CELLS:** N/A (Data sheet)
- **OUTPUT CELLS:** N/A
- **DEPENDENCY CHAIN:** Provides values for VLOOKUP in Karbo sheets. Maps volume Na-thiosulfate -> mg Glukosa/Fruktosa, Laktosa, Maltosa.

### Sheet: Rekap Kegiatan
**Summary:** Empty/template sheet.


## Workbook 2: Format Analisis Volumetri-Perhitungan.xlsx

### Summary
- Total sheets: 7 (Note: no Konversi Tabel Luff Schoorl or Rekap Kegiatan in this workbook)
- Sheets: SPU KIMIA, Massa Molar, Bobot Ekuivalen, FORMAT STANDARDISASI, FORMAT STANDARDISASI&KADAR, FORMAT PENETAPAN KADAR, Curve Titration

### Sheet: SPU KIMIA
**Summary:** Periodic Table of Elements mapping.
- **INPUT CELLS:** N/A
- **OUTPUT CELLS:** N/A
- **DEPENDENCY CHAIN:** Data table C6:F124 contains elements. Used for VLOOKUPs across other sheets. Lookup columns: K (Ar), L (group), M (period). 353 VLOOKUP formulas mapping element symbols.

### Sheet: Massa Molar
**Summary:** Molar Mass Calculator.
- **INPUT CELLS:** Element symbols (D7-D20) + quantities (E7-E20)
- **OUTPUT CELLS:** J7, J10, J13, J16
- **DEPENDENCY CHAIN:** Symbols -> Ar (VLOOKUP) -> G (Ar * qty) -> I (sum groups) -> J (Molar mass)

**Detailed Formula Table**
| Cell | Formula | Type | Inputs | Label/Description | Unit | Cached Value |
|------|---------|------|--------|-------------------|------|--------------|
| G7 | `=F7*E7` (example) | calculation | F7, E7 | Ar * quantity | g/mol | - |
| I7 | `=G7+G8+G9` | aggregation | G7:G9 | sum group | - | - |
| J7 | `=I7` | calculation | I7 | molar mass 1 | g/mol| - |

### Sheet: Bobot Ekuivalen
**Summary:** Equivalent Weight Calculator.
- **INPUT CELLS:** Element symbols, quantities, and divisor (J column)
- **OUTPUT CELLS:** L7, L10, L13, L16
- **DEPENDENCY CHAIN:** Molar mass -> divided by J (number of equivalents) -> K/L (Equivalent weight)

**Detailed Formula Table**
| Cell | Formula | Type | Inputs | Label/Description | Unit | Cached Value |
|------|---------|------|--------|-------------------|------|--------------|
| K7 | `=H7/J7` (example)| calculation | H7, J7 | Equivalent weight = molar mass / n | g/eq | - |

### Sheet: FORMAT STANDARDISASI
**Summary:** Standardization titration calculator.
- **INPUT CELLS:** Initial/final volumes, Cy (conc)
- **OUTPUT CELLS:** P21
- **DEPENDENCY CHAIN:** Titration data -> average volume -> Cx = (Vy * Cy) / Vx_avg

**Detailed Formula Table**
| Cell | Formula | Type | Inputs | Label/Description | Unit | Cached Value |
|------|---------|------|--------|-------------------|------|--------------|
| P21 | `=P17/P18` | calculation | P17, P18 | Cx = (Vy * Cy) / Vx_avg | M/N | - |

### Sheet: FORMAT STANDARDISASI&KADAR
**Summary:** Combined standardization and concentration determination.
- **INPUT CELLS:** Volumes, Ar_Mr, C_penitar, F_pengenceran, V_sampel
- **OUTPUT CELLS:** I46
- **DEPENDENCY CHAIN:** Standardization -> Kadar (g/L)

**Detailed Formula Table**
| Cell | Formula | Type | Inputs | Label/Description | Unit | Cached Value |
|------|---------|------|--------|-------------------|------|--------------|
| I46 | `=I43/I44` | calculation | I43, I44 | Kadar (g/L) | g/L | - |

### Sheet: FORMAT PENETAPAN KADAR
**Summary:** Direct concentration determination. Uses VLOOKUP to SPU KIMIA for Ar/Mr.
- **INPUT CELLS:** Volumes, Sample Mass
- **OUTPUT CELLS:** H30
- **DEPENDENCY CHAIN:** Inputs -> PRODUCT() -> Concentration

**Detailed Formula Table**
| Cell | Formula | Type | Inputs | Label/Description | Unit | Cached Value |
|------|---------|------|--------|-------------------|------|--------------|
| H30 | `=PRODUCT(H24:N24) / P23` | calculation | H24:N24, P23 | Concentration | - | - |

### Sheet: Curve Titration
**Summary:** Acid-base titration curve simulation.
- **INPUT CELLS:** I8 (Vol Y), I9 (Conc Y), I10 (Ka), I12 (volume increment)
- **OUTPUT CELLS:** pH curve table points
- **DEPENDENCY CHAIN:** Inputs -> Before/At/After equivalence formulas -> pH

**Detailed Formula Table**
| Cell | Formula | Type | Inputs | Label/Description | Unit | Cached Value |
|------|---------|------|--------|-------------------|------|--------------|
| pH(B) | pH = -log(Ka) + log(...) | calculation | I8, I9, I10 | Before eq pH | - | - |
| pH(E) | pH = -log(sqrt(Ka*Kb)) | calculation | Ka, Kb | At eq pH | - | - |
| pH(A) | pH = 14 - (-log(excess)) | calculation | excess_base_conc | After eq pH | - | - |


## Lookup Tables Summary

- **Workbook 1 - Format Kadar Protein:** D105:E122 (Conversion factor lookup, mapping bahan to factor).
- **Workbook 1 - Format %Protein_standarless:** D82:E100 (Conversion factor lookup).
- **Workbook 1 - karbo & karbo (2):** C148:F169 (Luff Schoorl interpolations for Na-thiosulfate to mg sugar). C121:D122 (Carbohydrate conversion factors).
- **Workbook 1 - Konversi Tabel Luff Schoorl:** Comprehensive Volume Na-thiosulfate to mg Sugars mapping.
- **Workbook 2 - SPU KIMIA:** C6:F124 (Periodic table: Symbol -> Ar, Group, Period). Used by Massa Molar, Bobot Ekuivalen, and Penetapan Kadar sheets.
