import { CalculationResult } from '../types';
import { safeDivide } from '../validation';
import { displayValue } from '../rounding';
import { lookupLuffSchoorl } from './lookup';

export interface LactoseInput { volume: number; faktor_pengenceran: number; massa_sampel: number; }

export function calculateLactose(input: LactoseInput): CalculationResult {
  const ts = new Date().toISOString();
  const lookup = lookupLuffSchoorl(input.volume, 'laktosa');
  if ('error' in lookup) {
    return { calculationId: `lac_${Date.now()}`, status: 'ERROR', result: null, unit: '%', formula: '', formulaDisplay: '', intermediate: {}, steps: [], formulaVersion: 1, warnings: [], errors: [lookup.error], traceability: { formulaId: 'LACTOSE-001', sourceWorkbook: 'Luff Schoorl', sourceSheet: 'Konversi Tabel', sourceCells: [], timestamp: ts } };
  }
  const mg = lookup.value;
  const pct = safeDivide(mg * input.faktor_pengenceran, input.massa_sampel) * 100;
  return {
    calculationId: `lac_${Date.now()}`, status: 'SUCCESS', result: pct, unit: '%',
    formula: '%Lactose = (mg × FP / massa) × 100',
    formulaDisplay: `%Laktosa\n= (mg_gula × FP / massa_sampel) × 100\n= (${displayValue(mg,4)} × ${displayValue(input.faktor_pengenceran,2)} / ${displayValue(input.massa_sampel,4)}) × 100\n= ${displayValue(pct,4)}%`,
    intermediate: { mg_sugar: {value:mg,unit:'mg'}, matched_volume: {value:lookup.matchedVolume,unit:'mL'} },
    steps: [{id:'LAC-001', name:'Lookup mg gula', formula:'VLOOKUP', formulaDisplay:`Vol ${displayValue(input.volume,2)} → ${displayValue(mg,2)} mg`, inputs:{volume:input.volume}, result:mg, unit:'mg'}, {id:'LAC-002', name:'%Laktosa', formula:'(mg×FP/massa)×100', formulaDisplay:`= ${displayValue(pct,4)}%`, inputs:{mg,FP:input.faktor_pengenceran,massa:input.massa_sampel}, result:pct, unit:'%'}],
    formulaVersion: 1, warnings: lookup.isExact ? [] : [`Approximate match: used volume ${lookup.matchedVolume}`], errors: [],
    traceability: { formulaId: 'LACTOSE-001', sourceWorkbook: 'Luff Schoorl', sourceSheet: 'Konversi Tabel', sourceCells: [], timestamp: ts },
  };
}
