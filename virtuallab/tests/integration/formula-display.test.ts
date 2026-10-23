import { describe, it, expect } from 'vitest';
import { buildFormulaDisplay, buildChainedDisplay } from '../../src/lib/calculations/formula-display';

describe('Integration — Formula Display (Rule #80)', () => {

  it('buildFormulaDisplay produces correct multi-line output', () => {
    const display = buildFormulaDisplay(
      'Kadar Air',
      'Berat Air / Berat Sampel × 100',
      { 'Berat Air': 1.25, 'Berat Sampel': 10.00 },
      12.50,
      '%',
      2
    );

    expect(display.label).toBe('Kadar Air');
    expect(display.formulaGeneric).toBe('Berat Air / Berat Sampel × 100');
    expect(display.formulaSubstituted).toContain('1.25');
    expect(display.formulaSubstituted).toContain('10.00');
    expect(display.resultDisplay).toContain('12.50');
    expect(display.resultDisplay).toContain('%');

    // Full display has 4 lines
    const lines = display.fullDisplay.split('\n');
    expect(lines.length).toBe(4);
    expect(lines[0]).toBe('Kadar Air');
    expect(lines[1]).toContain('Berat Air / Berat Sampel × 100');
    expect(lines[3]).toContain('12.50');
  });

  it('buildFormulaDisplay handles null result', () => {
    const display = buildFormulaDisplay(
      'Test', 'A / B', { A: 1, B: 0 }, null, '%', 2
    );
    expect(display.resultDisplay).toBe('ERROR');
  });

  it('buildChainedDisplay chains multiple steps', () => {
    const steps: Array<{ label: string; formulaGeneric: string; values: Record<string, number | null>; result: number | null; unit: string }> = [
      { label: 'Step 1', formulaGeneric: 'A + B', values: { A: 1, B: 2 }, result: 3, unit: 'g' },
      { label: 'Step 2', formulaGeneric: 'C × 100', values: { C: 0.5 }, result: 50, unit: '%' },
    ];
    const output = buildChainedDisplay(steps, 2);
    expect(output).toContain('Step 1');
    expect(output).toContain('Step 2');
    expect(output).toContain('3.00');
    expect(output).toContain('50.00');
    // Two blocks separated by double newline
    expect(output.split('\n\n').length).toBeGreaterThanOrEqual(2);
  });
});
