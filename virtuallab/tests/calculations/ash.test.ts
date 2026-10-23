/**
 * ACCEPTANCE TEST — KADAR ABU (Prompt #50)
 * =========================================
 * Source: engine.ts → calculateAsh()
 * Excel Reference: Format Kadar Abu worksheet
 *
 * Given:
 *   wadah = 20 g
 *   wadah+sampel = 30 g
 *   wadah+abu = 20.5 g
 *
 *   berat sampel = 30 - 20 = 10 g
 *   berat abu = 20.5 - 20 = 0.5 g
 *   kadar abu = 0.5 / 10 × 100 = 5%
 */
import { describe, it, expect } from 'vitest';
import { calculateAsh, safeDivide } from '../../src/lib/calculations/engine';

describe('Acceptance Test — Kadar Abu (Ash Content)', () => {
  describe('Prompt #50: Standard Case', () => {
    const input = {
      bobot_wadah_kosong: 20,
      bobot_cawan_sampel: 30,
      bobot_setelah: 20.5,
    };

    it('should calculate ash weight = 20.5 - 20 = 0.5 g', () => {
      const result = calculateAsh(input);
      expect(result.ash_weight).toBeCloseTo(0.5, 10);
    });

    it('should calculate sample weight = 30 - 20 = 10 g', () => {
      const result = calculateAsh(input);
      expect(result.sample_weight).toBeCloseTo(10, 10);
    });

    it('should calculate ash fraction = 0.5 / 10 = 0.05', () => {
      const result = calculateAsh(input);
      expect(result.ash_fraction).toBeCloseTo(0.05, 10);
    });

    it('should calculate ash percentage = 5%', () => {
      const result = calculateAsh(input);
      expect(result.ash_pct).toBeCloseTo(5, 10);
    });

    it('should match alternative method = 5%', () => {
      const result = calculateAsh(input);
      expect(result.alt_ash_pct).toBeCloseTo(5, 10);
    });
  });

  describe('Edge Case: Zero Sample Weight', () => {
    it('should return 0 for ash fraction when sample weight is 0', () => {
      const result = calculateAsh({
        bobot_wadah_kosong: 20,
        bobot_cawan_sampel: 20, // same as wadah → sample = 0
        bobot_setelah: 20,
      });
      expect(result.ash_fraction).toBe(0);
      expect(result.ash_pct).toBe(0);
    });
  });

  describe('Edge Case: Decimal Precision', () => {
    it('should handle high-precision inputs', () => {
      const result = calculateAsh({
        bobot_wadah_kosong: 20.0120,
        bobot_cawan_sampel: 22.5430,
        bobot_setelah: 20.2610,
      });
      // ash = 20.2610 - 20.0120 = 0.2490
      // sample = 22.5430 - 20.0120 = 2.5310
      // pct = (0.2490 / 2.5310) * 100 ≈ 9.838%
      expect(result.ash_weight).toBeCloseTo(0.2490, 4);
      expect(result.sample_weight).toBeCloseTo(2.5310, 4);
      expect(result.ash_pct).toBeCloseTo(9.838, 1);
    });
  });

  describe('Step Traceability', () => {
    it('should produce steps with ASH formula IDs', () => {
      const result = calculateAsh({
        bobot_wadah_kosong: 20,
        bobot_cawan_sampel: 30,
        bobot_setelah: 20.5,
      });
      const ids = result.steps.map((s) => s.id);
      expect(ids).toContain('ASH-001');
      expect(ids).toContain('ASH-003');
      expect(ids).toContain('ASH-005');
    });
  });
});
