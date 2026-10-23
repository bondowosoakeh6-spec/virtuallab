import { CalculationResult, CalculationStep } from '../types';
import { validatePositive, validateNonNegative } from '../validation';
import { displayValue } from '../rounding';
import { calculatePhBeforeEquivalence } from './ph-before-equivalence';
import { calculatePhAtEquivalence } from './ph-equivalence';
import { calculatePhAfterEquivalence } from './ph-after-equivalence';

export interface TitrationCurveInput {
  konsentrasi_x: number; konsentrasi_y: number; volume_y: number;
  ka: number; kb?: number; volume_awal?: number; volume_akhir?: number; increment?: number;
}
export interface TitrationPoint { volume_titran: number; pH: number; region: 'before_equivalence'|'at_equivalence'|'after_equivalence'; }
export interface TitrationCurveResult extends CalculationResult { curveData: TitrationPoint[]; }

export function calculateTitrationCurve(input: TitrationCurveInput): TitrationCurveResult {
  const ts = new Date().toISOString();
  const { konsentrasi_x, konsentrasi_y, volume_y, ka, volume_awal=0, volume_akhir=2*volume_y, increment=1 } = input;

  if (!validatePositive(konsentrasi_x) || !validatePositive(konsentrasi_y) || !validatePositive(volume_y) || !validatePositive(ka) || !validatePositive(increment)) {
    return { calculationId: `tc_${Date.now()}`, status: 'ERROR', result: null, unit: '', formula: '', formulaDisplay: '', intermediate: {}, steps: [], formulaVersion: 1, warnings: [], errors: ['Invalid input'], curveData: [], traceability: { formulaId: 'TITRATION-CURVE-001', sourceWorkbook: 'Format Analisis Volumetri.xlsx', sourceSheet: 'Curve Titration', sourceCells: [], timestamp: ts } };
  }

  const v_eq = (konsentrasi_y * volume_y) / konsentrasi_x;
  const curveData: TitrationPoint[] = [];

  for (let v = volume_awal; v <= volume_akhir; v += increment) {
    if (Math.abs(v - v_eq) < 1e-6) {
      const r = calculatePhAtEquivalence({ka, konsentrasi_y});
      curveData.push({volume_titran: v, pH: r.result ?? 7, region: 'at_equivalence'});
    } else if (v < v_eq) {
      const r = calculatePhBeforeEquivalence({ka, konsentrasi_x, volume_x: v, konsentrasi_y, volume_y});
      curveData.push({volume_titran: v, pH: r.result ?? 0, region: 'before_equivalence'});
    } else {
      const r = calculatePhAfterEquivalence({konsentrasi_x, volume_x: v, konsentrasi_y, volume_y});
      curveData.push({volume_titran: v, pH: r.result ?? 14, region: 'after_equivalence'});
    }
  }

  if (!curveData.some(p => Math.abs(p.volume_titran - v_eq) < 1e-6)) {
    const r = calculatePhAtEquivalence({ka, konsentrasi_y});
    curveData.push({volume_titran: v_eq, pH: r.result ?? 7, region: 'at_equivalence'});
    curveData.sort((a,b) => a.volume_titran - b.volume_titran);
  }

  return {
    calculationId: `tc_${Date.now()}`, status: 'SUCCESS', result: curveData.length, unit: 'points',
    formula: 'Titration curve generation',
    formulaDisplay: `Kurva Titrasi: ${curveData.length} titik, Veq = ${displayValue(v_eq,2)} mL`,
    intermediate: { v_eq: {value: v_eq, unit: 'mL'}, kb: {value: 1e-14/ka, unit: ''} },
    steps: [{id:'TC-001', name:'Equivalence Volume', formula:'Veq = (Cy×Vy)/Cx', formulaDisplay: `= (${displayValue(konsentrasi_y,4)} × ${displayValue(volume_y,2)}) / ${displayValue(konsentrasi_x,4)} = ${displayValue(v_eq,4)} mL`, inputs:{Cy:konsentrasi_y,Vy:volume_y,Cx:konsentrasi_x}, result:v_eq, unit:'mL'}],
    formulaVersion: 1, warnings: [], errors: [], curveData,
    traceability: { formulaId: 'TITRATION-CURVE-001', sourceWorkbook: 'Format Analisis Volumetri.xlsx', sourceSheet: 'Curve Titration', sourceCells: [], timestamp: ts },
  };
}
