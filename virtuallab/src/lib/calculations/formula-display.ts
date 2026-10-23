import { displayValue } from './rounding';

/**
 * Formula Display (Prompt #80)
 * 
 * Must show:
 * Kadar Air
 * = Berat Air / Berat Sampel × 100
 * = 1.25 / 10.00 × 100
 * = 12.50%
 */

export interface FormulaDisplay {
  label: string;
  formulaGeneric: string;    // "Berat Air / Berat Sampel × 100"
  formulaSubstituted: string; // "1.25 / 10.00 × 100"
  resultDisplay: string;      // "12.50%"
  fullDisplay: string;        // Combined multi-line display
}

/** Build a formula display object */
export function buildFormulaDisplay(
  label: string,
  formulaGeneric: string,
  values: Record<string, number | null>,
  result: number | null,
  unit: string,
  decimals: number = 4
): FormulaDisplay {
  // Build substituted formula
  let formulaSubstituted = formulaGeneric;
  for (const [key, val] of Object.entries(values)) {
    formulaSubstituted = formulaSubstituted.replace(
      new RegExp(escapeRegExp(key), 'g'),
      displayValue(val, decimals)
    );
  }

  const resultStr = result !== null 
    ? `${displayValue(result, decimals)}${unit ? ' ' + unit : ''}`
    : 'ERROR';

  const fullDisplay = [
    label,
    `= ${formulaGeneric}`,
    `= ${formulaSubstituted}`,
    `= ${resultStr}`,
  ].join('\n');

  return {
    label,
    formulaGeneric,
    formulaSubstituted,
    resultDisplay: resultStr,
    fullDisplay,
  };
}

/** Build multi-step formula display for a chain of calculations */
export function buildChainedDisplay(
  steps: Array<{
    label: string;
    formulaGeneric: string;
    values: Record<string, number | null>;
    result: number | null;
    unit: string;
  }>,
  decimals: number = 4
): string {
  return steps.map(step => 
    buildFormulaDisplay(
      step.label,
      step.formulaGeneric,
      step.values,
      step.result,
      step.unit,
      decimals
    ).fullDisplay
  ).join('\n\n');
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
