import { CalculationResult, CalculationStep } from '../types';
import { displayValue } from '../rounding';
import { lookupAtomicMass } from './element-lookup';

export interface MolarMassInput {
  formula?: string;
  groups?: Array<Array<{symbol: string; quantity: number}>>;
}

export interface MolarMassElementResult {
  element: string; count: number; atomicMass: number; subtotal: number;
}

export interface MolarMassResult extends CalculationResult {
  elements: MolarMassElementResult[];
}

export function parseChemicalFormula(formula: string): Array<{symbol: string; quantity: number}> {
  const stack: Array<Array<{symbol: string; quantity: number}>> = [[]];
  const regex = /([A-Z][a-z]?)(\d*)|(\()|(\))(\d*)/g;
  let m;
  while ((m = regex.exec(formula)) !== null) {
    if (m[1]) {
      stack[stack.length-1].push({symbol: m[1], quantity: m[2] ? parseInt(m[2]) : 1});
    } else if (m[3]) {
      stack.push([]);
    } else if (m[4]) {
      const mul = m[5] ? parseInt(m[5]) : 1;
      const grp = stack.pop()!;
      grp.forEach(item => { item.quantity *= mul; stack[stack.length-1].push(item); });
    }
  }
  const agg: Record<string,number> = {};
  stack[0].forEach(i => { agg[i.symbol] = (agg[i.symbol]||0) + i.quantity; });
  return Object.entries(agg).map(([symbol,quantity]) => ({symbol, quantity}));
}

export function calculateMolarMass(input: MolarMassInput): MolarMassResult {
  const ts = new Date().toISOString();
  let parsed: Array<{symbol:string;quantity:number}> = [];

  if (input.groups && input.groups.length > 0) {
    const agg: Record<string,number> = {};
    input.groups.forEach(g => g.forEach(i => { agg[i.symbol] = (agg[i.symbol]||0) + i.quantity; }));
    parsed = Object.entries(agg).map(([symbol,quantity]) => ({symbol,quantity}));
  } else if (input.formula) {
    parsed = parseChemicalFormula(input.formula);
  } else {
    return { calculationId: `mm_${Date.now()}`, status: 'ERROR', result: null, unit: 'g/mol', formula: '', formulaDisplay: '', intermediate: {}, steps: [], elements: [], formulaVersion: 1, warnings: [], errors: ['Formula or groups required'], traceability: { formulaId: 'MOLARMASS-001', sourceWorkbook: 'SPU KIMIA', sourceSheet: 'SPU', sourceCells: [], timestamp: ts } };
  }

  const steps: CalculationStep[] = [];
  const elements: MolarMassElementResult[] = [];
  let total = 0;
  const parts: string[] = [];
  const subs: string[] = [];

  for (const item of parsed) {
    const ar = lookupAtomicMass(item.symbol);
    if (ar === 0) {
      return { calculationId: `mm_${Date.now()}`, status: 'ERROR', result: null, unit: 'g/mol', formula: '', formulaDisplay: '', intermediate: {}, steps: [], elements: [], formulaVersion: 1, warnings: [], errors: [`Unknown element: ${item.symbol}`], traceability: { formulaId: 'MOLARMASS-001', sourceWorkbook: 'SPU KIMIA', sourceSheet: 'SPU', sourceCells: [], timestamp: ts } };
    }
    const sub = ar * item.quantity;
    total += sub;
    elements.push({element: item.symbol, count: item.quantity, atomicMass: ar, subtotal: sub});
    parts.push(`${item.quantity} × Ar(${item.symbol})`);
    subs.push(`${item.quantity} × ${displayValue(ar,4)}`);
    steps.push({ id: `MM-${item.symbol}`, name: `${item.symbol} × ${item.quantity}`, formula: `${item.quantity} × Ar(${item.symbol})`, formulaDisplay: `${item.symbol} | ${item.quantity} | ${displayValue(ar,4)} | ${displayValue(sub,4)}`, inputs: { symbol: item.symbol, quantity: item.quantity }, result: sub, unit: 'g/mol' });
  }

  steps.push({ id: 'MM-TOTAL', name: 'Total Massa Molar', formula: 'Mr = Σ(count × Ar)', formulaDisplay: `Mr = ${subs.join(' + ')} = ${displayValue(total,5)} g/mol`, inputs: {}, result: total, unit: 'g/mol' });

  return {
    calculationId: `mm_${Date.now()}`, status: 'SUCCESS', result: total, unit: 'g/mol',
    formula: `Mr = ${parts.join(' + ')}`,
    formulaDisplay: `Massa Molar\n= ${parts.join(' + ')}\n= ${subs.join(' + ')}\n= ${displayValue(total,5)} g/mol`,
    intermediate: {}, steps, elements, formulaVersion: 1, warnings: [], errors: [],
    traceability: { formulaId: 'MOLARMASS-001', sourceWorkbook: 'SPU KIMIA', sourceSheet: 'SPU', sourceCells: [], timestamp: ts },
  };
}
