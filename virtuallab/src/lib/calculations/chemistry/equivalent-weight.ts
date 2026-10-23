import { CalculationResult, CalculationStep } from '../types';
import { safeDivide } from '../validation';
import { displayValue } from '../rounding';
import { calculateMolarMass, MolarMassInput, MolarMassElementResult } from './molar-mass';

export interface EquivalentWeightInput extends MolarMassInput {
  nValues: number[];  // equivalence factor per group
}

export interface EquivalentWeightResult extends CalculationResult {
  molarMasses: number[];
  equivalentWeights: number[];
  elements?: MolarMassElementResult[];
}

export function calculateEquivalentWeight(input: EquivalentWeightInput): EquivalentWeightResult {
  const ts = new Date().toISOString();
  const mmResult = calculateMolarMass({ groups: input.groups, formula: input.formula });
  
  if (mmResult.status === 'ERROR') {
    return {
      calculationId: `eq_${Date.now()}`,
      status: 'ERROR',
      result: null,
      unit: 'g/ekuivalen',
      formula: mmResult.formula,
      formulaDisplay: mmResult.formulaDisplay,
      intermediate: mmResult.intermediate,
      steps: mmResult.steps,
      molarMasses: [],
      equivalentWeights: [],
      elements: mmResult.elements,
      formulaVersion: 1,
      warnings: mmResult.warnings,
      errors: mmResult.errors,
      traceability: mmResult.traceability
    };
  }
  
  const mr = mmResult.result ?? 0;
  const steps = [...mmResult.steps];
  const eqWeights: number[] = [];
  const molarMasses: number[] = [mr];

  const n = input.nValues?.[0] ?? 1;
  const be = safeDivide(mr, n);
  eqWeights.push(be);

  steps.push({ id: 'EQ-001', name: 'Bobot Ekivalen', formula: 'BE = Mr / n', formulaDisplay: `Bobot Ekivalen\n= Massa Molar / Faktor Ekivalen\n= ${displayValue(mr,4)} / ${n}\n= ${displayValue(be,4)} g/ekuivalen`, inputs: { Mr: mr, n }, result: be, unit: 'g/ekuivalen' });

  return {
    calculationId: `eq_${Date.now()}`, status: 'SUCCESS', result: be, unit: 'g/ekuivalen',
    formula: 'BE = Mr / n',
    formulaDisplay: `Bobot Ekivalen\n= Massa Molar / Faktor Ekivalen\n= ${displayValue(mr,4)} / ${n}\n= ${displayValue(be,4)} g/ekuivalen`,
    intermediate: { massa_molar: {value:mr,unit:'g/mol'}, faktor_ekivalen: {value:n,unit:''} },
    steps, elements: mmResult.elements, molarMasses, equivalentWeights: eqWeights,
    formulaVersion: 1, warnings: [], errors: [],
    traceability: { formulaId: 'EQUIVALENT-001', sourceWorkbook: 'SPU KIMIA', sourceSheet: 'Bobot Ekuivalen', sourceCells: ['H7','J7','K7'], timestamp: ts },
  };
}
