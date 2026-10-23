# Formula Specification

This document provides a comprehensive specification for all formulas used in the VirtualLab AKUANALIS platform.

## 1. Proximate Analysis (Proksimat)

### 1.1 Moisture Content (Kadar Air)

#### MOISTURE-001: Weight Before Drying
- **Excel Reference**: Format Kadar Air!H16
- **Formula**: `=IFERROR(H13+J13, "0,0000")`
- **Semantic**: `weight_before = sample_weight_before + sample_weight_before_dup`
- **Mathematical**: $W_{before} = W_{cawan\_kosong + sampel}$
- **Inputs**: H13 (bobot cawan+sampel simplo), J13 (duplo)
- **Unit**: gram
- **Validation**: Must be > 0

#### MOISTURE-002: Weight Loss
- **Excel Reference**: Format Kadar Air!H19
- **Formula**: `=IFERROR(H16-J16, "0,0000")`
- **Semantic**: `weight_loss = weight_before_drying - weight_after_drying`
- **Mathematical**: $\Delta W = W_{before} - W_{after}$
- **Inputs**: H16 (weight_before), J16 (weight_after)
- **Unit**: gram
- **Validation**: Must be >= 0

#### MOISTURE-003: Moisture Fraction
- **Excel Reference**: Format Kadar Air!H22
- **Formula**: `=IFERROR(H19/H20, "0")`
- **Semantic**: `moisture_fraction = weight_loss / sample_weight`
- **Mathematical**: $f_{moisture} = \frac{\Delta W}{W_{sample}}$
- **Inputs**: H19 (weight_loss), H20 (sample_weight)
- **Unit**: unitless
- **Validation**: 0 <= value <= 1

#### MOISTURE-004: Moisture Percentage
- **Excel Reference**: Format Kadar Air!H24
- **Formula**: `=H22*100`
- **Semantic**: `moisture_pct = moisture_fraction * 100`
- **Mathematical**: $\%KA = f_{moisture} \times 100$
- **Inputs**: H22 (moisture_fraction)
- **Unit**: %
- **Validation**: 0 <= value <= 100

#### MOISTURE-005: Alternative Method - Direct Weight Difference
- **Excel Reference**: Format Kadar Air!H33
- **Formula**: `=IFERROR(E12-E14, "0,0000")`
- **Semantic**: `weight_diff = weight_before - weight_after`
- **Mathematical**: $\Delta W = W_{before} - W_{after}$
- **Inputs**: E12, E14
- **Unit**: gram
- **Validation**: >= 0

#### MOISTURE-006: Alternative Method - Moisture Fraction
- **Excel Reference**: Format Kadar Air!H36
- **Formula**: `=IFERROR(H33/H34, "0")`
- **Semantic**: `moisture_fraction = weight_loss / sample_weight`
- **Mathematical**: $f_{moisture} = \frac{\Delta W}{W_{sample}}$
- **Inputs**: H33, H34
- **Unit**: unitless
- **Validation**: 0 <= value <= 1

#### MOISTURE-007: Alternative Method - Moisture Percentage
- **Excel Reference**: Format Kadar Air!H38
- **Formula**: `=H36*100`
- **Semantic**: `moisture_pct = moisture_fraction * 100`
- **Mathematical**: $\%KA = f_{moisture} \times 100$
- **Inputs**: H36
- **Unit**: %
- **Validation**: 0 <= value <= 100


### 1.2 Ash Content (Kadar Abu)

#### ASH-001: Weight After Heating
- **Excel Reference**: Format Kadar Abu!E15
- **Formula**: `=E14 - E11`
- **Semantic**: `ash_weight = weight_after_heating - empty_weight`
- **Mathematical**: $W_{ash} = W_{after} - W_{empty}$
- **Inputs**: E14, E11
- **Unit**: gram
- **Validation**: >= 0

#### ASH-002: Ash Weight
- **Excel Reference**: Format Kadar Abu!H16
- **Formula**: `=H13 - J13`
- **Semantic**: `ash_weight = weight_sample - weight_empty`
- **Mathematical**: $W_{ash} = W_{sample} - W_{empty}$
- **Inputs**: H13, J13
- **Unit**: gram
- **Validation**: >= 0

#### ASH-003: Sample Weight
- **Excel Reference**: Format Kadar Abu!H17
- **Formula**: `=H14 - J14`
- **Semantic**: `sample_weight = total_weight - empty_weight`
- **Mathematical**: $W_{sample} = W_{total} - W_{empty}$
- **Inputs**: H14, J14
- **Unit**: gram
- **Validation**: > 0

#### ASH-004: Ash Fraction
- **Excel Reference**: Format Kadar Abu!H19
- **Formula**: `=IFERROR(H16/H17, "0")`
- **Semantic**: `ash_fraction = ash_weight / sample_weight`
- **Mathematical**: $f_{ash} = \frac{W_{ash}}{W_{sample}}$
- **Inputs**: H16, H17
- **Unit**: unitless
- **Validation**: 0 <= value <= 1

#### ASH-005: Ash Percentage
- **Excel Reference**: Format Kadar Abu!H21
- **Formula**: `=IFERROR(H19, "0%")`
- **Semantic**: `ash_pct = ash_fraction`
- **Mathematical**: $\%Ash = f_{ash}$
- **Inputs**: H19
- **Unit**: %
- **Validation**: 0 <= value <= 100

#### ASH-006: Alternative Method Ash Percentage
- **Excel Reference**: Format Kadar Abu!H33-H38
- **Formula**: `Various`
- **Semantic**: Similar to above but alternate input cells
- **Mathematical**: $\%Ash = \frac{W_{ash}}{W_{sample}} \times 100$
- **Unit**: %


### 1.3 Protein Content (Kadar Protein - Kjeldahl)

#### PROTEIN-001: Titration Volume (Simplo)
- **Excel Reference**: Kadar Protein!H10
- **Formula**: `=G10 - F10`
- **Semantic**: `titration_vol_simplo = vol_final - vol_initial`
- **Mathematical**: $V_{simplo} = V_{f} - V_{i}$
- **Inputs**: G10, F10
- **Unit**: mL

#### PROTEIN-002: Titration Volume (Duplo)
- **Excel Reference**: Kadar Protein!H11
- **Formula**: `=G11 - F11`
- **Semantic**: `titration_vol_duplo = vol_final - vol_initial`
- **Mathematical**: $V_{duplo} = V_{f} - V_{i}$
- **Inputs**: G11, F11
- **Unit**: mL

#### PROTEIN-003: Average Titration Volume
- **Excel Reference**: Kadar Protein!H12
- **Formula**: `=AVERAGE(H10:H11)`
- **Semantic**: `titration_vol_avg = avg(simplo, duplo)`
- **Mathematical**: $V_{avg} = \frac{V_{simplo} + V_{duplo}}{2}$
- **Inputs**: H10, H11
- **Unit**: mL

#### PROTEIN-004: Standardization Concentration
- **Excel Reference**: Kadar Protein!H28
- **Formula**: `=IFERROR(H25/H26, "0")`
- **Semantic**: `concentration = (V_y * C_y) / V_x`
- **Mathematical**: $C_x = \frac{V_y \times C_y}{V_x}$
- **Inputs**: H25, H26
- **Unit**: M or N

#### PROTEIN-005: Blanko Average
- **Excel Reference**: Kadar Protein!H37
- **Formula**: `=AVERAGE(H35:H36)`
- **Semantic**: `blank_avg = avg(blank_simplo, blank_duplo)`
- **Mathematical**: $V_{blank} = \frac{V_{b1} + V_{b2}}{2}$
- **Inputs**: H35, H36
- **Unit**: mL

#### PROTEIN-006: Sample Average
- **Excel Reference**: Kadar Protein!H41
- **Formula**: `=AVERAGE(H39:H40)`
- **Semantic**: `sample_avg = avg(sample_simplo, sample_duplo)`
- **Mathematical**: $V_{sample} = \frac{V_{s1} + V_{s2}}{2}$
- **Inputs**: H39, H40
- **Unit**: mL

#### PROTEIN-007: Volume Difference (blanko - sample)
- **Excel Reference**: Kadar Protein!I52
- **Formula**: `=E48 - E49`
- **Semantic**: `vol_diff = blank_vol - sample_vol`
- **Mathematical**: $\Delta V = V_{blank} - V_{sample}$
- **Inputs**: E48, E49
- **Unit**: mL

#### PROTEIN-008: Numerator Product
- **Excel Reference**: Kadar Protein!I55
- **Formula**: `=PRODUCT(I52:O52)`
- **Semantic**: `numerator = vol_diff * concentration * 14.007 * dilution_factor`
- **Mathematical**: $Num = \Delta V \times C_{titrant} \times 14.007 \times F_{dilution}$
- **Inputs**: I52 to O52
- **Unit**: mg

#### PROTEIN-009: %Nitrogen
- **Excel Reference**: Kadar Protein!I59
- **Formula**: `=IFERROR(I55/I56, "0%")`
- **Semantic**: `pct_nitrogen = numerator / sample_mass`
- **Mathematical**: $\%N = \frac{Num}{m_{sample}}$
- **Inputs**: I55, I56
- **Unit**: %

#### PROTEIN-010: Conversion Factor Lookup
- **Excel Reference**: Kadar Protein!E66
- **Formula**: `=VLOOKUP(E65, D105:E122, 2, FALSE)`
- **Semantic**: `conversion_factor = lookup(sample_type)`
- **Mathematical**: $F_{conv} = Table(SampleType)$
- **Inputs**: E65, D105:E122
- **Unit**: unitless

#### PROTEIN-011: %Protein
- **Excel Reference**: Kadar Protein!I66
- **Formula**: `=PRODUCT(I64:K64)`
- **Semantic**: `pct_protein = pct_nitrogen * conversion_factor`
- **Mathematical**: $\%P = \%N \times F_{conv}$
- **Inputs**: I64, K64
- **Unit**: %


### 1.4 Protein Standardless Method
#### PROTEIN-012 to PROTEIN-020
Calculations for Protein determination without prior standardization. The formulas mirror PROTEIN-001 to PROTEIN-011 except for the hardcoded concentration of the titrant rather than a standardization step.
- Volumetric differences: `H14 = AVERAGE(H12:H13)`
- Titrant concentration assumed known.
- `%N` calculation: `I36 = IFERROR(I32/I33, "0%")`
- Lookup and `%Protein`: `I43 = PRODUCT(I41:K41)`


### 1.5 Carbohydrate (Luff Schoorl Method)
#### CARBO-001 to CARBO-015
Standardization of Na-thiosulfate.
- `G14 = AVERAGE(G12:G13)` (Average volume X)
- `G30 = IFERROR(G27/G28, "0")` (Concentration X calculation)

#### CARBO-016 to CARBO-020
Blank and Sample titration volumes.
- `G40 = AVERAGE(G38:G39)` (Blank)
- `G44 = AVERAGE(G42:G43)` (Sample)
- `H53 = D50 - D51` (Difference Blank - Sample)

#### CARBO-021 to CARBO-025
Volume Na-thiosulfate calculation.
- `H58 = IFERROR(H55/H56, "0")`


### 1.6 Luff Schoorl Conversion
#### LUFF-001: Volume to Sugar Conversion
- **Excel Reference**: Karbo!D72
- **Formula**: `=VLOOKUP(D70, H70:K93, 2, TRUE)`
- **Semantic**: Convert Na2S2O3 volume to mg glucose/fructose.

#### LUFF-002: Volume to Sugar Conversion (Conversion Sheet)
- **Excel Reference**: Karbo!D11
- **Formula**: `=VLOOKUP(D9, H7:I28, 2, TRUE)`
- **Semantic**: Alternate lookup.

#### LUFF-003: Interpolation
- **Excel Reference**: Karbo!G133 to H141
- **Semantic**: Linear interpolation for precise Luff Schoorl table lookups when volume is not an exact integer.


### 1.7 Carbohydrate Percentage
#### GLUCOSE-001: % Glucose
- **Excel Reference**: Karbo!G104
- **Formula**: `=IFERROR(G101/G102, "0%")`
- **Semantic**: `pct_glucose = (mg_sugar * dilution_factor) / mass_sample`
- **Mathematical**: $\%Glucose = \frac{m_{sugar} \times F_{dilution}}{m_{sample}}$
- **Inputs**: G101, G102
- **Unit**: %

#### KARBO-030: % Carbohydrate
- **Excel Reference**: Karbo!G114
- **Formula**: `=PRODUCT(G112:I112)`
- **Semantic**: `pct_carbo = pct_glucose * conversion_factor`
- **Mathematical**: $\%Carbo = \%Glucose \times F_{conv}$
- **Inputs**: G112, I112
- **Unit**: %


## 2. Volumetric Analysis

### 2.1 Periodic Table (SPU KIMIA)
#### SPU-001: Element Lookup
- **Formula**: `=VLOOKUP(symbol, C6:F124, col, FALSE)`
- **Semantic**: Retrieves atomic mass (Ar), Group, and Period.

### 2.2 Molar Mass Calculator
#### MOLAR-001: Ar Lookup
- **Formula**: `=VLOOKUP(D7, SPU, 2, FALSE)`
#### MOLAR-002: Mass Contribution
- **Formula**: `=F7 * E7` (Ar * quantity)
#### MOLAR-003: Molar Mass Sum
- **Formula**: `=G7+G8+G9` (Sum of contributions)

### 2.3 Equivalent Weight
#### EQUIVALENT-001 & EQUIVALENT-002
- **Formula**: `=H7/J7` (Molar mass / valence 'n')

### 2.4 Standardization
#### STANDARD-001 to STANDARD-003
- **Formulas**: Volume calculations and `Cx = (Vy*Cy)/Vx`

### 2.5 Standardization & Concentration
#### STDKADAR-001 to STDKADAR-005
- Combined workflow for concentration determination directly from standardization.
- `Kadar = (V*Ar*C*F) / V_sampel`

### 2.6 Concentration Determination
#### KADAR-001 to KADAR-005
- **Formula**: `=PRODUCT(H24:N24) / P23`

### 2.7 Titration Curve
#### TITRATION-001: Kb Calculation
- **Formula**: `=10^-14 / Ka`
#### TITRATION-002: Equivalence Volume
- **Formula**: `=V_Y`
#### TITRATION-003: pH Before Equivalence
- **Formula**: `=-log(Ka) + log(CxVx/(CyVy-CxVx))`
#### TITRATION-004: pH At Equivalence
- **Formula**: `=-log(sqrt(Ka*Kb))`
#### TITRATION-005: pH After Equivalence
- **Formula**: `=14 - (-log(excess))`


## 3. Lookup Tables

### 3.1 Protein Conversion Factor Table
| Bahan | Faktor Konversi |
|---|---|
| Bir | 6.25 |
| Gelatin | 5.55 |
| Tahu | 5.75 |
| *Others* | *Variable* |

### 3.2 Luff Schoorl Table
| Vol Na2S2O3 0.1N (mL) | Glukosa/Fruktosa (mg) | Laktosa (mg) | Maltosa (mg) |
|---|---|---|---|
| 1 | 2.4 | 3.6 | 3.9 |
| 2 | 4.8 | 7.3 | 7.8 |
| ... | ... | ... | ... |

### 3.3 Carbohydrate Conversion Factor
| Jenis | Faktor |
|---|---|
| Pati | 0.90 |
| Sukrosa | 0.95 |
