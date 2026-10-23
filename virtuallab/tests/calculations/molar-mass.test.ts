/**
 * ACCEPTANCE TEST — MASSA MOLAR (Prompt #55)
 * ============================================
 * Source: engine.ts → calculateMolarMass(), lookupAtomicMass()
 * Excel Reference: Massa Molar worksheet, SPU KIMIA
 *
 * Test: H2O
 *   2 × H atomic mass + 1 × O atomic mass
 *   = 2 × 1.008 + 1 × 15.999
 *   = 2.016 + 15.999
 *   = 18.015 g/mol
 *
 * Result must equal database-based calculation within configured tolerance.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateMolarMass,
  lookupAtomicMass,
  PERIODIC_TABLE,
} from '../../src/lib/calculations/engine';

/** Configured tolerance for molar mass comparisons */
const MOLAR_MASS_TOLERANCE = 1e-9;

describe('Acceptance Test — Massa Molar (Molar Mass)', () => {
  describe('Prompt #55: H2O', () => {
    const H_MASS = lookupAtomicMass('H'); // 1.008
    const O_MASS = lookupAtomicMass('O'); // 15.999

    it('should lookup H atomic mass from database = 1.008', () => {
      expect(H_MASS).toBeCloseTo(1.008, 3);
    });

    it('should lookup O atomic mass from database = 15.999', () => {
      expect(O_MASS).toBeCloseTo(15.999, 3);
    });

    it('should calculate H2O molar mass = 2×1.008 + 1×15.999 = 18.015', () => {
      const result = calculateMolarMass({
        groups: [[
          { symbol: 'H', quantity: 2 },
          { symbol: 'O', quantity: 1 },
        ]],
      });

      const expectedFromDb = 2 * H_MASS + 1 * O_MASS;
      expect(result.totalMass).toBeCloseTo(expectedFromDb, 9);
      expect(result.totalMass).toBeCloseTo(18.015, 3);
    });

    it('result must equal database-based calculation within tolerance', () => {
      const result = calculateMolarMass({
        groups: [[
          { symbol: 'H', quantity: 2 },
          { symbol: 'O', quantity: 1 },
        ]],
      });
      const dbBased = 2 * PERIODIC_TABLE.find(e => e.symbol === 'H')!.atomicMass
                     + 1 * PERIODIC_TABLE.find(e => e.symbol === 'O')!.atomicMass;
      expect(Math.abs(result.totalMass - dbBased)).toBeLessThan(MOLAR_MASS_TOLERANCE);
    });

    it('should produce element breakdown in steps', () => {
      const result = calculateMolarMass({
        groups: [[
          { symbol: 'H', quantity: 2 },
          { symbol: 'O', quantity: 1 },
        ]],
      });
      expect(result.elements).toHaveLength(2);
      expect(result.elements[0].symbol).toBe('H');
      expect(result.elements[0].quantity).toBe(2);
      expect(result.elements[0].contribution).toBeCloseTo(2.016, 3);
      expect(result.elements[1].symbol).toBe('O');
      expect(result.elements[1].contribution).toBeCloseTo(15.999, 3);
    });
  });

  describe('Additional Compounds', () => {
    it('NaCl = 22.990 + 35.453 = 58.443 g/mol', () => {
      const result = calculateMolarMass({
        groups: [[
          { symbol: 'Na', quantity: 1 },
          { symbol: 'Cl', quantity: 1 },
        ]],
      });
      expect(result.totalMass).toBeCloseTo(58.443, 2);
    });

    it('H2SO4 = 2(1.008) + 32.065 + 4(15.999) = 98.077 g/mol', () => {
      const result = calculateMolarMass({
        groups: [[
          { symbol: 'H', quantity: 2 },
          { symbol: 'S', quantity: 1 },
          { symbol: 'O', quantity: 4 },
        ]],
      });
      expect(result.totalMass).toBeCloseTo(98.077, 2);
    });

    it('NaOH = 22.990 + 15.999 + 1.008 = 39.997 g/mol', () => {
      const result = calculateMolarMass({
        groups: [[
          { symbol: 'Na', quantity: 1 },
          { symbol: 'O', quantity: 1 },
          { symbol: 'H', quantity: 1 },
        ]],
      });
      expect(result.totalMass).toBeCloseTo(39.997, 2);
    });
  });

  describe('Unknown Element', () => {
    it('should return 0 for unknown element atomic mass', () => {
      expect(lookupAtomicMass('Xx')).toBe(0);
      expect(lookupAtomicMass('UnknownElement')).toBe(0);
    });
  });
});
