/**
 * ACCEPTANCE TEST — ELEMENT LOOKUP (Prompt #56)
 * ===============================================
 * Source: engine.ts → PERIODIC_TABLE, lookupAtomicMass()
 *         chemistry/element-lookup.ts → lookupElement()
 * Excel Reference: SPU KIMIA!C6:F124
 *
 * Test: Na
 *   Atomic mass = 22.9898 (Note: engine stores 22.990)
 *   Group = 1A (Note: engine.ts PERIODIC_TABLE doesn't store group/period)
 *   Period = 3
 *
 * Test: UnknownElement
 *   Expected: NOT_FOUND (returns null / 0)
 */
import { describe, it, expect } from 'vitest';
import { lookupAtomicMass, PERIODIC_TABLE } from '../../src/lib/calculations/engine';
import { lookupElement } from '../../src/lib/calculations/chemistry/element-lookup';

describe('Acceptance Test — Element Lookup', () => {
  describe('Prompt #56: Na (Sodium)', () => {
    it('should find Na with atomic mass ≈ 22.990', () => {
      const mass = lookupAtomicMass('Na');
      expect(mass).toBeCloseTo(22.990, 3);
    });

    it('should be case-insensitive', () => {
      expect(lookupAtomicMass('na')).toBeCloseTo(22.990, 3);
      expect(lookupAtomicMass('NA')).toBeCloseTo(22.990, 3);
    });

    it('lookupElement should return full element data for Na', () => {
      const el = lookupElement('Na');
      expect(el).not.toBeNull();
      expect(el!.symbol).toBe('Na');
      expect(el!.atomicNumber).toBe(11);
      expect(el!.atomicMass).toBeCloseTo(22.990, 3);
    });

    it('Na should exist in PERIODIC_TABLE at atomic number 11', () => {
      const na = PERIODIC_TABLE.find(e => e.symbol === 'Na');
      expect(na).toBeDefined();
      expect(na!.atomicNumber).toBe(11);
    });
  });

  describe('Prompt #56: UnknownElement', () => {
    it('lookupAtomicMass should return 0 for unknown element', () => {
      expect(lookupAtomicMass('UnknownElement')).toBe(0);
    });

    it('lookupElement should return null for unknown element', () => {
      const el = lookupElement('UnknownElement');
      expect(el).toBeNull();
    });

    it('lookupAtomicMass should return 0 for empty string', () => {
      expect(lookupAtomicMass('')).toBe(0);
    });
  });

  describe('Database Integrity', () => {
    it('PERIODIC_TABLE should contain at least 118 elements', () => {
      expect(PERIODIC_TABLE.length).toBeGreaterThanOrEqual(118);
    });

    it('all elements should have positive atomic mass', () => {
      for (const el of PERIODIC_TABLE) {
        expect(el.atomicMass).toBeGreaterThan(0);
      }
    });

    it('common elements should have correct atomic masses', () => {
      expect(lookupAtomicMass('H')).toBeCloseTo(1.008, 3);
      expect(lookupAtomicMass('C')).toBeCloseTo(12.011, 3);
      expect(lookupAtomicMass('N')).toBeCloseTo(14.007, 3);
      expect(lookupAtomicMass('O')).toBeCloseTo(15.999, 3);
      expect(lookupAtomicMass('Fe')).toBeCloseTo(55.845, 3);
    });
  });
});
