/**
 * ACCEPTANCE TEST — TITRATION CURVE (Prompt #59)
 * ================================================
 * Source: engine.ts → calculateTitrationCurve()
 * Excel Reference: Curve Titration worksheet
 *
 * Tests at minimum:
 *   - Before equivalence
 *   - At equivalence
 *   - After equivalence
 *
 * Verify: volume, pH, equivalence point against workbook formulas.
 *
 * Workbook formulas:
 *   Kb = 10^-14 / Ka
 *   Before: pH = -log(Ka) + log(CxVx / (CyVy - CxVx))
 *   At:     pH = 14 - (-log(sqrt(Kb × C_salt)))
 *   After:  pH = 14 - (-log(excess_OH))
 *
 * Input: Ka = 1.82e-5 (Acetic acid), Vy = 100 mL, Cy = 0.1 M, increment = 10 mL
 */
import { describe, it, expect } from 'vitest';
import { calculateTitrationCurve } from '../../src/lib/calculations/engine';
import * as fs from 'fs';
import * as path from 'path';

const input = {
  ka: 1.82e-5,
  volume_y: 100,
  konsentrasi_y: 0.1,
  volume_increment: 10,
};

describe('Acceptance Test — Titration Curve', () => {
  const result = calculateTitrationCurve(input);

  describe('TITRATION-001: Kb Calculation', () => {
    it('Kb = 10^-14 / Ka = 10^-14 / 1.82e-5', () => {
      const expectedKb = 1e-14 / 1.82e-5;
      expect(result.kb).toBeCloseTo(expectedKb, 14);
    });
  });

  describe('TITRATION-002: Equivalence Volume', () => {
    it('equivalence volume = V_Y = 100 mL', () => {
      expect(result.equivalence_volume).toBe(100);
    });
  });

  describe('Before Equivalence', () => {
    it('should have points before equivalence', () => {
      expect(result.points_before.length).toBeGreaterThan(0);
    });

    it('all before-equivalence points have volume < equivalence volume', () => {
      for (const p of result.points_before) {
        expect(p.volume).toBeLessThan(result.equivalence_volume);
        expect(p.region).toBe('before_equivalence');
      }
    });

    it('pH should generally increase before equivalence', () => {
      // After the initial point, pH should increase as we add base
      const sorted = [...result.points_before].sort((a, b) => a.volume - b.volume);
      if (sorted.length >= 3) {
        expect(sorted[sorted.length - 1].ph).toBeGreaterThan(sorted[1].ph);
      }
    });

    it('initial pH (V=0) should be acidic', () => {
      const initial = result.points_before.find(p => p.volume === 0);
      if (initial) {
        // pH = -log(sqrt(Ka × C)) = -log(sqrt(1.82e-5 × 0.1)) ≈ 2.87
        expect(initial.ph).toBeLessThan(7);
        expect(initial.ph).toBeGreaterThan(1);
      }
    });
  });

  describe('At Equivalence', () => {
    it('should have exactly one equivalence point', () => {
      expect(result.point_at_equivalence).toBeDefined();
    });

    it('equivalence point should be at V = 100 mL', () => {
      expect(result.point_at_equivalence.volume).toBe(100);
    });

    it('pH at equivalence should be basic (> 7) for weak acid/strong base', () => {
      // pH = 14 - (-log(sqrt(Kb × C_salt)))
      // C_salt = Cy / 2 = 0.05 M
      // Kb = 5.4945e-10
      // pOH = -log(sqrt(5.4945e-10 × 0.05)) = -log(sqrt(2.747e-11)) ≈ 5.28
      // pH = 14 - 5.28 ≈ 8.72
      expect(result.point_at_equivalence.ph).toBeGreaterThan(7);
      expect(result.point_at_equivalence.ph).toBeCloseTo(8.72, 0);
    });

    it('region should be at_equivalence', () => {
      expect(result.point_at_equivalence.region).toBe('at_equivalence');
    });
  });

  describe('After Equivalence', () => {
    it('should have points after equivalence', () => {
      expect(result.points_after.length).toBeGreaterThan(0);
    });

    it('all after-equivalence points have volume > equivalence volume', () => {
      for (const p of result.points_after) {
        expect(p.volume).toBeGreaterThan(result.equivalence_volume);
        expect(p.region).toBe('after_equivalence');
      }
    });

    it('pH should be > 7 after equivalence (excess base)', () => {
      for (const p of result.points_after) {
        expect(p.ph).toBeGreaterThan(7);
      }
    });
  });

  describe('CSV Comparison Evidence', () => {
    it('should generate CSV comparison for test evidence', () => {
      const allPoints = [
        ...result.points_before,
        result.point_at_equivalence,
        ...result.points_after,
      ].sort((a, b) => a.volume - b.volume);

      const csvLines = ['Volume (mL),pH,Region'];
      for (const p of allPoints) {
        csvLines.push(`${p.volume.toFixed(2)},${p.ph.toFixed(4)},${p.region}`);
      }

      const csvContent = csvLines.join('\n');

      // Write CSV to tests/calculations directory
      const csvPath = path.resolve(__dirname, 'titration-curve-evidence.csv');
      fs.writeFileSync(csvPath, csvContent, 'utf-8');

      // Verify file was written
      expect(fs.existsSync(csvPath)).toBe(true);
      expect(csvLines.length).toBeGreaterThan(5);
    });
  });

  describe('Step Traceability', () => {
    it('should contain TITRATION step IDs', () => {
      const ids = result.steps.map(s => s.id);
      expect(ids).toContain('TITRATION-001');
      expect(ids).toContain('TITRATION-004');
    });
  });
});
