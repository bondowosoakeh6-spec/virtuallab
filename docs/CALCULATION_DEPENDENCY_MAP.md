# Calculation Dependency Map

## Overview
This document maps the dependencies between all calculations in both workbooks.

## 1. Moisture Content (Kadar Air) Dependencies

### Input → Output Chain
```
E11 (Bobot wadah kosong) ──────────────────────────────────┐
                                                            │
E13 (Bobot sampel sebelum dikeringkan) ────┐                │
                                           │                │
E14 (Bobot wadah+sampel setelah dikeringkan) ──┐            │
                                               │            │
                                               v            v
H13 = E11 ─────────────────────────────────> H16 = H13+J13
J13 = E13 ──────────────────────────────────┘  │
L13 = E14 ──────────────────────────────────> J16 = L13
                                               │
                                               v
                                         H19 = H16-J16
H17 = E13 ──────────────────────────────> H20 = H17
                                               │
                                               v
                                         H22 = H19/H20
                                               │
                                               v
                                         H24 = H22*100  ──> E16 (output)
```

### Alternative Path
```
E12 = H16 ──────┐
                 v
E14 ──────> H33 = E12-E14
                 │
E13 ──────> H34 = E13
                 │
                 v
           H36 = H33/H34
                 │
                 v
           H38 = H36*100
```

### Topological Sort Order
1. Read E11, E13, E14
2. Calculate H13, J13, L13, H17
3. Calculate H16, J16
4. Calculate H19, H20
5. Calculate H22
6. Calculate H24 (Output E16)
7. Alternative: E12 -> H33, H34 -> H36 -> H38

```mermaid
flowchart TD
    E11[E11: Bobot wadah kosong] --> H13
    E13[E13: Bobot sampel] --> J13
    E14[E14: Bobot setelah] --> L13
    H13 --> H16[H16: Weight before]
    J13 --> H16
    L13 --> J16
    H16 --> H19[H19: Weight loss]
    J16 --> H19
    E13 --> H17
    H17 --> H20
    H19 --> H22[H22: Moisture fraction]
    H20 --> H22
    H22 --> H24[H24: Moisture %]
```

## 2. Ash Content Dependencies
### Input → Output Chain
```mermaid
flowchart TD
    E11[E11: Bobot wadah kosong] --> J13
    E11 --> J14
    E12[E12: Wadah+Sampel sblm] --> H14
    E14[E14: Wadah+Sampel sesudah] --> H13
    
    H13 --> H16[H16: Bobot sesudah - wadah]
    J13 --> H16
    
    H14 --> H17[H17: Bobot sblm - wadah]
    J14 --> H17
    
    H16 --> H19[H19: Ratio]
    H17 --> H19
    
    H19 --> H21[H21: Kadar Abu %]
    
    E14 --> H33
    E11 --> H33
    E12 --> H34
    E11 --> H34
    H33 --> H36
    H34 --> H36
    H36 --> H38[H38: Alt Kadar Abu]
```

### Topological Sort Order
1. Read E11, E12, E14
2. Calculate J13, J14, H14, H13, H33, H34
3. Calculate H16, H17
4. Calculate H19, H36
5. Calculate H21, H38

## 3. Protein Content Dependencies (with standardization sub-chain)
### Input → Output Chain
```mermaid
flowchart TD
    F10[F10: Simplo Awal] --> H10
    G10[G10: Simplo Akhir] --> H10
    F11[F11: Duplo Awal] --> H11
    G11[G11: Duplo Akhir] --> H11
    H10 --> H12[H12: Avg Penitar]
    H11 --> H12
    
    E18[E18: Vol Y] --> H22
    E19[E19: Kons Y] --> J22
    H12 --> E20 --> H23
    H22 --> H25
    J22 --> H25
    H23 --> H26
    H25 --> H28[H28: Konsentrasi X]
    H26 --> H28
    
    F35 --> H35
    G35 --> H35
    F36 --> H36
    G36 --> H36
    H35 --> H37[H37: Avg Blanko]
    H36 --> H37
    
    F39 --> H39
    G39 --> H39
    F40 --> H40
    G40 --> H40
    H39 --> H41[H41: Avg Sampel]
    H40 --> H41
    
    H37 --> E48
    H41 --> E49
    E48 --> I52
    E49 --> I52
    
    I52 --> I55
    E52[E52: Kons Penitar] --> K52 --> I55
    E53[E53: Ketetapan] --> M52 --> I55
    E54[E54: FP] --> O52 --> I55
    
    E50[E50: Massa Sampel] --> I53 --> I56
    
    I55 --> I59[I59: % Nitrogen]
    I56 --> I59
    
    E65[E65: Sampel Type] --> E66[E66: Faktor Konversi VLOOKUP]
    I59 --> E64 --> I64
    E66 --> K64
    I64 --> I66[I66: % Protein]
    K64 --> I66
```

### Topological Sort Order
1. Read Standardization inputs: F10, G10, F11, G11, E18, E19
2. Calc H10, H11 -> H12
3. Calc H22, J22, H23 -> H25, H26 -> H28
4. Read Titration inputs: F35, G35, F36, G36, F39, G39, F40, G40
5. Calc H35, H36 -> H37; H39, H40 -> H41
6. Calc I52 (Blanko - Sampel)
7. Calc I55 (Product of I52, K52, M52, O52)
8. Calc I59 (% Nitrogen)
9. Lookup E66 based on E65
10. Calc I66 (% Protein)

## 4. Protein Standardless Dependencies
### Input → Output Chain
```mermaid
flowchart TD
    F12 --> H12
    G12 --> H12
    F13 --> H13
    G13 --> H13
    H12 --> H14[H14: Avg Blanko]
    H13 --> H14
    
    F16 --> H16
    G16 --> H16
    F17 --> H17
    G17 --> H17
    H16 --> H18[H18: Avg Sampel]
    H17 --> H18
    
    H14 --> E53
    H18 --> E54
    E53 --> I57
    E54 --> I57
    
    I57 --> I61
    E57[E57: Kons Penitar] --> K57 --> I61
    E58[E58: Ketetapan] --> M57 --> I61
    E59[E59: FP] --> O57 --> I61
    
    E55[E55: Massa Sampel] --> I58 --> I62
    
    I61 --> I64[I64: % Nitrogen]
    I62 --> I64
    
    E71[E71: Sampel Type] --> E72[E72: Faktor Konversi VLOOKUP]
    I64 --> E70 --> I70
    E72 --> K70
    I70 --> I71[I71: % Protein]
    K70 --> I71
```

### Topological Sort Order
1. Read Titration inputs: F12, G12, F13, G13, F16, G16, F17, G17
2. Calc H12, H13 -> H14; H16, H17 -> H18
3. Calc I57 (Blanko - Sampel)
4. Calc I61 (Product of I57, K57, M57, O57)
5. Calc I64 (% Nitrogen)
6. Lookup E72 based on E71
7. Calc I71 (% Protein)

## 5. Carbohydrate Dependencies (with standardization + Luff Schoorl lookup + interpolation)
### Input → Output Chain
```mermaid
flowchart TD
    F12 --> G12
    E12 --> G12
    F13 --> G13
    E13 --> G13
    G12 --> G14[G14: Avg Penitar]
    G13 --> G14
    
    D20 --> G24
    D21 --> I24
    G14 --> D22 --> G25
    G24 --> G27
    I24 --> G27
    G25 --> G28
    G27 --> G30[G30: Kons X]
    G28 --> G30
    
    F38 --> G38
    E38 --> G38
    F39 --> G39
    E39 --> G39
    G38 --> G40[G40: Avg Blanko]
    G39 --> G40
    
    F42 --> G42
    E42 --> G42
    F43 --> G43
    E43 --> G43
    G42 --> G44[G44: Avg Sampel]
    G43 --> G44
    
    G40 --> D50
    G44 --> D51
    D50 --> H53
    D51 --> H53
    G30 --> D53 --> J53
    H53 --> H55
    J53 --> H55
    H54 --> H56
    H55 --> H58[H58: Vol Tiosulfat 0.1N]
    H56 --> H58
    
    H58 --> D56 --> D70
    D70 --> D72[D72: Lookup Luff Schoorl]
    
    D70 --> G134
    G134 --> G133[G133: Floor Lookup]
    G133 --> H133[H133: Floor Value]
    G133 --> G135[G135: Ceil Lookup]
    G135 --> H135[H135: Ceil Value]
    
    D72 --> C95 --> G95 --> G98
    D96 --> I98
    G98 --> G101
    I98 --> G101
    D97 --> G99 --> G102
    G101 --> G104[G104: % Glukosa]
    G102 --> G104
    
    G104 --> D99 --> D110 --> G112
    D111[D111: Jenis Sampel] --> D112[D112: Konversi] --> I112
    G112 --> G114[G114: % Karbohidrat]
    I112 --> G114
```

### Topological Sort Order
1. Read Standardization inputs
2. Calc G12, G13 -> G14
3. Calc G30 (Konsentrasi Penitar)
4. Read Titration inputs
5. Calc G38, G39 -> G40; G42, G43 -> G44
6. Calc H58 (Volume Tiosulfat 0.1N)
7. Lookup D72 using Luff Schoorl table (and interpolation)
8. Calc G104 (% Glukosa)
9. Lookup D112 based on D111
10. Calc G114 (% Karbohidrat)

## 6. Molar Mass Dependencies
### Input → Output Chain
```mermaid
flowchart TD
    D7[D7: Unsur 1] --> F7[F7: Ar Unsur 1 VLOOKUP]
    E7[E7: Kuantitas 1] --> G7
    F7 --> G7[G7: Total Ar 1]
    
    D8[D8: Unsur 2] --> F8[F8: Ar Unsur 2 VLOOKUP]
    E8[E8: Kuantitas 2] --> G8
    F8 --> G8[G8: Total Ar 2]
    
    D9[D9: Unsur 3] --> F9[F9: Ar Unsur 3 VLOOKUP]
    E9[E9: Kuantitas 3] --> G9
    F9 --> G9[G9: Total Ar 3]
    
    G7 --> I7
    G8 --> I7
    G9 --> I7[I7: Mr Total]
```

### Topological Sort Order
1. Lookup Atomic Masses for components (F7, F8, F9...)
2. Multiply by quantity (G7, G8, G9...)
3. Sum totals for Molar Mass (I7/J7)

## 7. Equivalent Weight Dependencies
### Input → Output Chain
```mermaid
flowchart TD
    D7[D7: Unsur 1] --> F7[F7: Ar Unsur 1 VLOOKUP]
    E7[E7: Kuantitas 1] --> G7
    F7 --> G7[G7: Total Ar 1]
    
    G7 --> H7[H7: Mr Total]
    H7 --> K7[K7: Bobot Ekuivalen]
    J7[J7: Valensi] --> K7
```

### Topological Sort Order
1. Lookup Atomic Masses for components
2. Multiply by quantity
3. Sum totals for Molar Mass
4. Divide Molar Mass by Valence to get Equivalent Weight (K7)

## 8. Standardization Dependencies
### Input → Output Chain
```mermaid
flowchart TD
    G12[G12: Akhir] --> H12
    F12[F12: Awal] --> H12
    G13[G13: Akhir] --> H13
    F13[F13: Awal] --> H13
    
    H12 --> H14[H14: Avg Titrasi]
    H13 --> H14
    
    S7 --> P15
    Q15 --> P17
    R15 --> P17
    P15 --> P17[P17: Pembilang]
    
    M13 --> P18[P18: Penyebut]
    P17 --> P21[P21: Konsentrasi X]
    P18 --> P21
```

### Topological Sort Order
1. Calc Titration Differences H12, H13 -> Average H14
2. Setup parameters P15, Q15, R15 -> P17
3. Setup denominator P18
4. Calc P21 (Konsentrasi X)

## 9. Standardization & Kadar Dependencies
### Input → Output Chain
```mermaid
flowchart TD
    H12[H12: Akhir] --> I12
    G12[G12: Awal] --> I12
    H13[H13: Akhir] --> I13
    G13[G13: Awal] --> I13
    I12 --> I14[I14: Avg Penitar]
    I13 --> I14
    
    F20 --> I24
    F21 --> K24
    I14 --> F22 --> I25
    
    I24 --> I27
    K24 --> I27
    I25 --> I28
    I27 --> I30[I30: Kons X]
    I28 --> I30
    
    F35[F35: Senyawa] --> F36[F36: VLOOKUP Ar/Mr]
    F34 --> I39
    F36 --> K39
    I30 --> F37 --> M39
    F40 --> O39
    
    I39 --> I43
    K39 --> I43
    M39 --> I43
    O39 --> I43[I43: Total Massa]
    
    F38 --> I44[I44: Vol Sampel]
    I43 --> I46[I46: Kadar g/L]
    I44 --> I46
```

### Topological Sort Order
1. Calc Standardization Titration Differences I12, I13 -> Average I14
2. Calc Standardization Concentration I30
3. Lookup Molar Mass F36
4. Calc Product I43
5. Calc Kadar I46

## 10. Penetapan Kadar Dependencies
### Input → Output Chain
```mermaid
flowchart TD
    G12[G12: Akhir] --> H12
    F12[F12: Awal] --> H12
    G13[G13: Akhir] --> H13
    F13[F13: Awal] --> H13
    H12 --> H14[H14: Avg Titrasi]
    H13 --> H14
    
    E20[E20: Senyawa] --> E21[E21: VLOOKUP Ar/Mr]
    H14 --> E19 --> H24
    E21 --> J24
    E22[E22: Kons Penitar] --> L24
    E24[E24: FP] --> N24
    
    H24 --> H27
    J24 --> H27
    L24 --> H27
    N24 --> H27[H27: Pembilang]
    
    P23[P23: Penyebut] --> H30[H30: Kadar g/L]
    H27 --> H30
```

### Topological Sort Order
1. Calc Titration Differences H12, H13 -> Average H14
2. Lookup Molar Mass E21
3. Compute Product H27
4. Compute Final Kadar H30

## 11. Titration Curve Dependencies
### Input → Output Chain
```mermaid
flowchart TD
    I10[I10: Ka] --> I11[I11: Kb]
    I8[I8: Vol Y] --> I13[I13: Vol Ekuivalen]
    I8 --> I15[I15: Vol Max]
    
    I9[I9: Kons Y] --> E22[E22: pH Awal]
    I10 --> E22
    
    I12[I12: Penambahan] --> D23
    D22[D22: Vol X Added] --> D23
    
    D23 --> E23[E23: pH Sebelum Ekuivalen]
    I10 --> E23
    I9 --> E23
    I8 --> E23
    
    D23 --> D24 --> D25
    D24 --> E24
    
    I13 --> G22[G22: Ekuivalen point]
    I11 --> H22[H22: pH at Ekuivalen]
    G22 --> H22
    I9 --> H22
    I8 --> H22
    
    G22 --> G24 --> G25
    I12 --> G24
    G24 --> H24[H24: pH Setelah Ekuivalen]
    G22 --> H24
    I9 --> H24
```

### Topological Sort Order
1. Read Ka, Vol Y, Kons Y, Penambahan
2. Calc Kb, Vol Ekuivalen, Vol Max
3. Calc Initial pH E22
4. Iterate over volume additions (D23, D24, ...) and compute pH before equivalence (E23, E24, ...)
5. Calc pH at Equivalence (H22)
6. Iterate over volume additions after equivalence (G24, G25, ...) and compute pH (H24, H25, ...)

## Cross-Sheet Dependencies
1. **Massa Molar → SPU KIMIA**
   - References `'[1]SPU-HOME'!D6:$F$124` for Atomic Mass (Ar) using VLOOKUP.
2. **Bobot Ekuivalen → SPU KIMIA**
   - References `'[1]SPU-HOME'!$C$6:$D$124` for Atomic Mass (Ar) using VLOOKUP.
3. **FORMAT STANDARDISASI&KADAR → SPU KIMIA**
   - References `'SPU KIMIA'!C7:D124` for Ar/Mr using VLOOKUP.
4. **FORMAT PENETAPAN KADAR → SPU KIMIA**
   - References `'SPU KIMIA'!C7:D124` for Ar/Mr using VLOOKUP.
5. **Format Kadar Protein → (Self)**
   - Conversion Factor VLOOKUP references table on the same sheet (`D105:E122`).
6. **karbo → Konversi Tabel Luff Schoorl / Self**
   - VLOOKUPs reference Luff Schoorl values (often integrated into same sheet `C148:F169` or `H70:K93`).

## Dependency Graph Summary
For all sheets, calculation progresses from empirical readings (weights, titrant volumes) → Differences (Weight loss, Volume used) → Averages → Sub-computations (Concentration of titrant, interpolated lookup factors) → Final formula product/quotient → Percentages or Concentrations.
