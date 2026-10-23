# Excel Validation Matrix

## Purpose
This matrix defines test cases for validating the calculation engine against the Excel source of truth.

## Validation Status Legend
- **PASS**: Engine output matches Excel output
- **FAIL**: Engine output differs from Excel output
- **SKIPPED**: Test case not yet implemented
- **N/A**: Not applicable (e.g., string operations)

## 1. Moisture Content (Kadar Air)

| ID | Module | Excel Sheet | Excel Cell | Formula | Test Inputs | Expected Output | Status |
|---|---|---|---|---|---|---|---|
| MOISTURE-001 | Kadar Air | Format Kadar Air | H16 | =IFERROR(H13+J13,"0,0000") | H13=5.2340, J13=0 | 5.2340 | SKIPPED |
| MOISTURE-002 | Kadar Air | Format Kadar Air | H19 | =IFERROR(H16-J16,"0,0000") | H16=5.2340, J16=5.1020 | 0.1320 | SKIPPED |
| MOISTURE-003 | Kadar Air | Format Kadar Air | H22 | =IFERROR(H19/H20,"0") | H19=0.1320, H20=2.0000 | 0.0660 | SKIPPED |
| MOISTURE-004 | Kadar Air | Format Kadar Air | H24 | =H22*100 | H22=0.0660 | 6.60 | SKIPPED |
| MOISTURE-005 | Kadar Air (Alt) | Format Kadar Air | H33 | =IFERROR(E12-E14,"0,0000") | E12=5.2340, E14=5.1020 | 0.1320 | SKIPPED |
| MOISTURE-006 | Kadar Air (Alt) | Format Kadar Air | H36 | =IFERROR(H33/H34,"0") | H33=0.1320, H34=2.0000 | 0.0660 | SKIPPED |
| MOISTURE-007 | Kadar Air (Alt) | Format Kadar Air | H38 | =H36*100 | H36=0.0660 | 6.60 | SKIPPED |

## 2. Ash Content (Kadar Abu)

| ID | Module | Excel Sheet | Excel Cell | Formula | Test Inputs | Expected Output | Status |
|---|---|---|---|---|---|---|---|
| ASH-001 | Kadar Abu | Format Kadar Abu | E15 | =E14-$E$11 | E14=22.5430, E11=20.0120 | 2.5310 | SKIPPED |
| ASH-002 | Kadar Abu | Format Kadar Abu | H16 | =H13-$J$13 | H13=22.5430, J13=20.0120 | 2.5310 | SKIPPED |
| ASH-003 | Kadar Abu | Format Kadar Abu | H17 | =H14-$J$14 | H14=25.1250, J14=20.0120 | 5.1130 | SKIPPED |
| ASH-004 | Kadar Abu | Format Kadar Abu | H19 | =IFERROR($H$16/$H$17,"0") | H16=2.5310, H17=5.1130 | 0.4950 | SKIPPED |
| ASH-005 | Kadar Abu | Format Kadar Abu | H21 | =IFERROR($H$19,"0%") | H19=0.4950 | 0.4950 (49.50%) | SKIPPED |

## 3. Protein Content (Kjeldahl)

| ID | Module | Excel Sheet | Excel Cell | Formula | Test Inputs | Expected Output | Status |
|---|---|---|---|---|---|---|---|
| PROTEIN-001 | Kadar Protein | Format Kadar Protein | H12 | =AVERAGE(H10:H11) | H10=25.5, H11=25.5 | 25.50 | SKIPPED |
| PROTEIN-002 | Kadar Protein | Format Kadar Protein | H37 | =AVERAGE(H35:H36) | H35=25.5, H36=25.5 | 25.50 | SKIPPED |
| PROTEIN-003 | Kadar Protein | Format Kadar Protein | H41 | =AVERAGE(H39:H40) | H39=18.3, H40=18.3 | 18.30 | SKIPPED |
| PROTEIN-004 | Kadar Protein | Format Kadar Protein | I52 | =E48-E49 | E48=25.5, E49=18.3 | 7.20 | SKIPPED |
| PROTEIN-005 | Kadar Protein | Format Kadar Protein | I55 | =PRODUCT(I52:O52) | I52=7.2, K52=0.1, M52=14.007, O52=1 | 10.085 | SKIPPED |
| PROTEIN-006 | Kadar Protein | Format Kadar Protein | I59 | =IFERROR(I55/I56,"0%") | I55=10.085, I56=500 | 0.02017 (2.02%) | SKIPPED |
| PROTEIN-007 | Kadar Protein | Format Kadar Protein | E66 | =IFERROR(VLOOKUP(...) | E65="Tahu" | 5.75 | SKIPPED |
| PROTEIN-008 | Kadar Protein | Format Kadar Protein | I66 | =PRODUCT(I64:K64) | I64=0.02017, K64=5.75 | 0.11598 (11.6%) | SKIPPED |
| PROTEIN-009 | Kadar Protein | Format Kadar Protein | I80 | =E76-E77 | E76=25.5, E77=18.3 | 7.20 | SKIPPED |
| PROTEIN-010 | Kadar Protein | Format Kadar Protein | I84 | =PRODUCT(I80:O80) | I80=7.2, K80=0.1, M80=14.007, O80=1 | 10.085 | SKIPPED |
| PROTEIN-011 | Kadar Protein | Format Kadar Protein | I94 | =PRODUCT(I93:K93) | I93=0.02017, K93=5.75 | 0.11598 (11.6%) | SKIPPED |

## 4. Protein Standardless

| ID | Module | Excel Sheet | Excel Cell | Formula | Test Inputs | Expected Output | Status |
|---|---|---|---|---|---|---|---|
| PROTEIN-012 | Protein Standardless | Format %Protein_standarless | H14 | =AVERAGE(H12:H13) | H12=25.5, H13=25.5 | 25.50 | SKIPPED |
| PROTEIN-013 | Protein Standardless | Format %Protein_standarless | H18 | =AVERAGE(H16:H17) | H16=18.3, H17=18.3 | 18.30 | SKIPPED |
| PROTEIN-014 | Protein Standardless | Format %Protein_standarless | I29 | (Input) | - | 20 | SKIPPED |
| PROTEIN-015 | Protein Standardless | Format %Protein_standarless | I32 | =PRODUCT(I29:O29) | I29=20, M29=14.007, O29=1 | 280.14 | SKIPPED |
| PROTEIN-016 | Protein Standardless | Format %Protein_standarless | I36 | =IFERROR(I32/I33,"0%") | I32=280.14, I33=1002.5 | 0.2794 | SKIPPED |
| PROTEIN-017 | Protein Standardless | Format %Protein_standarless | I43 | =PRODUCT(I41:K41) | I41=0.2794, K41=5.75 | 1.6068 | SKIPPED |
| PROTEIN-018 | Protein Standardless | Format %Protein_standarless | I57 | =E53-E54 | E53=25.5, E54=18.3 | 7.2 | SKIPPED |
| PROTEIN-019 | Protein Standardless | Format %Protein_standarless | I61 | =PRODUCT(I57:O57) | I57=7.2, M57=14.007, O57=1 | 100.85 | SKIPPED |
| PROTEIN-020 | Protein Standardless | Format %Protein_standarless | I71 | =PRODUCT(I70:K70) | I70=0.10, K70=5.75 | 0.575 | SKIPPED |

## 5. Carbohydrate (Luff Schoorl)
| ID | Module | Excel Sheet | Excel Cell | Formula | Test Inputs | Expected Output | Status |
|---|---|---|---|---|---|---|---|
| CARBO-001 | Luff Schoorl | karbo | G14 | =AVERAGE(G12:G13) | G12=10, G13=10 | 10 | SKIPPED |
| CARBO-002 | Luff Schoorl | karbo | G30 | =IFERROR(G27/G28,"0") | G27=10, G28=10 | 1.0 | SKIPPED |
| CARBO-020 | Luff Schoorl | karbo | G207 | =IFERROR(PRODUCT(G205:I205),"0%") | G205=10, I205=10 | 100 | SKIPPED |
| LUFF-001 | Luff Schoorl | karbo | G133 | =VLOOKUP(...) | G134=12.3 | 12 | SKIPPED |
| LUFF-002 | Luff Schoorl | karbo | H133 | =VLOOKUP(...) | G133=12 | 30.3 | SKIPPED |
| LUFF-003 | Luff Schoorl | karbo | G135 | =G133+1 | G133=12 | 13 | SKIPPED |
| GLUCOSE-001 | Luff Schoorl | karbo | G197 | =IFERROR(G194/G195,"0%") | G194=10, G195=10 | 1.0 | SKIPPED |
| KARBO-001 | Luff Schoorl | karbo | G114 | =IFERROR(PRODUCT(G112:I112),"0%") | G112=10, I112=0.9 | 9.0 | SKIPPED |

## 6. Molar Mass
| ID | Module | Formula | Test Inputs | Expected Output | Status |
|---|---|---|---|---|---|
| MOLAR-001 | Molar Mass | H2O | H(1.008)*2 + O(15.999)*1 | 18.015 | SKIPPED |
| MOLAR-002 | Molar Mass | NaCl | Na(22.990) + Cl(35.453) | 58.443 | SKIPPED |
| MOLAR-003 | Molar Mass | H2SO4 | H(1.008)*2 + S(32.065)*1 + O(15.999)*4 | 98.079 | SKIPPED |

## 7. Equivalent Weight
| ID | Module | Formula | Test Inputs | Expected Output | Status |
|---|---|---|---|---|---|
| EQUIVALENT-001 | Equivalent Weight | H2SO4 | Mr=98.079, n=2 | 49.040 | SKIPPED |
| EQUIVALENT-002 | Equivalent Weight | NaOH | Mr=39.997, n=1 | 39.997 | SKIPPED |

## 8. Standardization
| ID | Module | Formula | Test Inputs | Expected Output | Status |
|---|---|---|---|---|---|
| STANDARD-001 | Standardization | - | - | - | SKIPPED |
| STANDARD-002 | Standardization | - | - | - | SKIPPED |
| STANDARD-003 | Standardization | - | - | - | SKIPPED |

## 9. Standardization & Kadar
| ID | Module | Formula | Test Inputs | Expected Output | Status |
|---|---|---|---|---|---|
| STDKADAR-001 | Standardization & Kadar | - | - | - | SKIPPED |
| STDKADAR-002 | Standardization & Kadar | - | - | - | SKIPPED |
| STDKADAR-003 | Standardization & Kadar | - | - | - | SKIPPED |
| STDKADAR-004 | Standardization & Kadar | - | - | - | SKIPPED |
| STDKADAR-005 | Standardization & Kadar | - | - | - | SKIPPED |

## 10. Penetapan Kadar
| ID | Module | Formula | Test Inputs | Expected Output | Status |
|---|---|---|---|---|---|
| KADAR-001 | Penetapan Kadar | - | - | - | SKIPPED |
| KADAR-002 | Penetapan Kadar | - | - | - | SKIPPED |
| KADAR-003 | Penetapan Kadar | - | - | - | SKIPPED |
| KADAR-004 | Penetapan Kadar | - | - | - | SKIPPED |
| KADAR-005 | Penetapan Kadar | - | - | - | SKIPPED |

## 11. Titration Curve
| ID | Module | Formula | Test Inputs | Expected Output | Status |
|---|---|---|---|---|---|
| TITRATION-001 | Titration Curve | pH at 0 mL | Ka=1.82e-5, VolY=100, ConcY=0.1 | 2.870 | SKIPPED |
| TITRATION-002 | Titration Curve | pH at 50 mL | Ka=1.82e-5, VolY=100, ConcY=0.1 | 4.740 | SKIPPED |
| TITRATION-003 | Titration Curve | pH at 100 mL | Ka=1.82e-5, VolY=100, ConcY=0.1 | 8.72 | SKIPPED |
| TITRATION-004 | Titration Curve | pH at 110 mL | Ka=1.82e-5, VolY=100, ConcY=0.1 | 11.678 | SKIPPED |
| TITRATION-005 | Titration Curve | - | - | - | SKIPPED |

## Edge Cases

| ID | Scenario | Input | Expected | Status |
|---|---|---|---|---|
| EDGE-001 | Division by zero | H20=0 | "0" (IFERROR) | SKIPPED |
| EDGE-002 | Empty input | All empty | "0" or "0,0000" | SKIPPED |
| EDGE-003 | Negative weight loss | H16 < J16 | Negative value (warning) | SKIPPED |
| EDGE-004 | Invalid element symbol | D7="Xx" | "0" (IFERROR) | SKIPPED |
| EDGE-005 | Volume > equivalence | D > I8 | #DIV/0! or #NUM! | SKIPPED |

## Summary Statistics

| Category | Total Tests | PASS | FAIL | SKIPPED |
|---|---|---|---|---|
| Moisture | 7 | 0 | 0 | 7 |
| Ash | 5 | 0 | 0 | 5 |
| Protein | 20 | 0 | 0 | 20 |
| Carbohydrate | 8 | 0 | 0 | 8 |
| Molar Mass | 3 | 0 | 0 | 3 |
| Equivalent Wt | 2 | 0 | 0 | 2 |
| Standardization | 3 | 0 | 0 | 3 |
| Std & Kadar | 5 | 0 | 0 | 5 |
| Penetapan Kadar | 5 | 0 | 0 | 5 |
| Titration Curve | 5 | 0 | 0 | 5 |
| Edge Cases | 5 | 0 | 0 | 5 |
| **Total** | **68** | **0** | **0** | **68** |

All tests start as SKIPPED and will be updated as the calculation engine is implemented and validated.
