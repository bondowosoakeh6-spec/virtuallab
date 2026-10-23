import { describe, it, expect } from 'vitest';
import { displayValue, excelRound } from '../../src/lib/calculations/rounding';
import { safeDivide, sanitizeNumber } from '../../src/lib/calculations/validation';

describe('Integration — Rounding & Validation', () => {
  describe('Rounding Utilities', () => {
    it('displayValue formats to specified decimal places', () => {
      expect(displayValue(12.5, 2)).toBe('12.50');
      expect(displayValue(0.123456, 4)).toBe('0.1235');
      expect(displayValue(null, 2)).toBe('0');
      expect(displayValue(100, 0)).toBe('100');
    });
    it('excelRound rounds correctly', () => {
      expect(excelRound(12.345, 2)).toBe(12.35);
      expect(excelRound(12.344, 2)).toBe(12.34);
      expect(excelRound(0, 4)).toBe(0);
    });
  });
  describe('Validation Utilities', () => {
    it('safeDivide handles edge cases', () => {
      expect(safeDivide(10, 2)).toBe(5);
      expect(safeDivide(10, 0)).toBe(0);
      expect(safeDivide(0, 0)).toBe(0);
      expect(safeDivide(NaN, 5)).toBe(0);
      expect(safeDivide(5, NaN)).toBe(0);
    });
    it('sanitizeNumber converts valid inputs', () => {
      expect(sanitizeNumber(42)).toBe(42);
      expect(sanitizeNumber('3.14')).toBe(3.14);
      expect(sanitizeNumber(null)).toBeNull();
      expect(sanitizeNumber(undefined)).toBeNull();
      expect(sanitizeNumber('abc')).toBeNull();
    });
  });
  describe('Formula ID Pattern', () => {
    const IDS = ['MOISTURE-001','ASH-001','PROTEIN-001','LUFF-001','STANDARD-001','ASSAY-001','MOLAR-001','EQUIVALENT-001','TITRATION-001'];
    it('all match MODULE-NNN pattern', () => { IDS.forEach(id => expect(id).toMatch(/^[A-Z]+-\d{3}$/)); });
    it('all unique', () => { expect(new Set(IDS).size).toBe(IDS.length); });
  });
});
