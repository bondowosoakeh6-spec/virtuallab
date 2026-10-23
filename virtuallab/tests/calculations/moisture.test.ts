/**
 * ACCEPTANCE TEST — KADAR AIR (Prompt #49)
 * =========================================
 * Source: engine.ts → calculateMoisture()
 * Excel Reference: Format Kadar Air worksheet
 *
 * Test cases:
 *   1. Normal case from prompt specification
 *   2. Zero denominator (bobot_sampel = 0)
 *   3. Negative mass
 *   4. Missing/null-like input
 *   5. Decimal input
 */
import { describe, it, expect } from 'vitest';
import {
  calculateMoisture,
  safeDivide,
} from '../../src/lib/calculations/engine';

describe('Acceptance Test — Kadar Air (Moisture Content)', () => {
  describe('Prompt #49: Standard Case', () => {
    /**
     * Given:
     *   wadah = 20 g
     *   wadah+sampel sebelum = 30 g  →  sampel = 10 g
     *   wadah+sampel setelah = 28 g
     *
     * Expected:
     *   berat air = (20+10) - 28 = 2 g
     *   kadar air = 2 / 10 × 100 = 20%
     */
    const input = {
      bobot_wadah_kosong: 20,
      bobot_sampel: 10,
      bobot_setelah: 28,
    };

    it('should calculate weight before drying = wadah + sampel = 30 g', () => {
      const result = calculateMoisture(input);
      expect(result.weight_before).toBeCloseTo(30, 10);
    });

    it('should calculate weight loss (berat air) = 30 - 28 = 2 g', () => {
      const result = calculateMoisture(input);
      expect(result.weight_loss).toBeCloseTo(2, 10);
    });

    it('should calculate moisture fraction = 2/10 = 0.2', () => {
      const result = calculateMoisture(input);
      expect(result.moisture_fraction).toBeCloseTo(0.2, 10);
    });

    it('should calculate moisture percentage = 20%', () => {
      const result = calculateMoisture(input);
      expect(result.moisture_pct).toBeCloseTo(20, 10);
    });

    it('should match alternative method result = 20%', () => {
      const result = calculateMoisture(input);
      expect(result.alt_moisture_pct).toBeCloseTo(20, 10);
    });

    it('should produce calculation steps with correct IDs', () => {
      const result = calculateMoisture(input);
      const stepIds = result.steps.map((s) => s.id);
      expect(stepIds).toContain('MOISTURE-001');
      expect(stepIds).toContain('MOISTURE-002');
      expect(stepIds).toContain('MOISTURE-003');
      expect(stepIds).toContain('MOISTURE-004');
    });
  });

  describe('Edge Case: Zero Denominator (bobot_sampel = 0)', () => {
    it('should return 0 for moisture fraction and percentage (IFERROR pattern)', () => {
      const result = calculateMoisture({
        bobot_wadah_kosong: 20,
        bobot_sampel: 0,
        bobot_setelah: 20,
      });
      expect(result.moisture_fraction).toBe(0);
      expect(result.moisture_pct).toBe(0);
    });
  });

  describe('Edge Case: Negative Mass', () => {
    it('should handle negative wadah gracefully (engine does not reject, relies on validation layer)', () => {
      const result = calculateMoisture({
        bobot_wadah_kosong: -5,
        bobot_sampel: 10,
        bobot_setelah: 3,
      });
      // weight_before = -5 + 10 = 5
      // weight_loss = 5 - 3 = 2
      // fraction = 2 / 10 = 0.2
      expect(result.weight_before).toBeCloseTo(5, 10);
      expect(result.moisture_fraction).toBeCloseTo(0.2, 10);
    });
  });

  describe('Edge Case: Decimal Input', () => {
    it('should handle decimal precision correctly', () => {
      const result = calculateMoisture({
        bobot_wadah_kosong: 25.3420,
        bobot_sampel: 2.0015,
        bobot_setelah: 27.1230,
      });
      // weight_before = 25.3420 + 2.0015 = 27.3435
      expect(result.weight_before).toBeCloseTo(27.3435, 4);
      // weight_loss = 27.3435 - 27.1230 = 0.2205
      expect(result.weight_loss).toBeCloseTo(0.2205, 4);
      // fraction = 0.2205 / 2.0015 ≈ 0.110167
      expect(result.moisture_fraction).toBeCloseTo(0.2205 / 2.0015, 4);
      // pct ≈ 11.0167%
      expect(result.moisture_pct).toBeCloseTo((0.2205 / 2.0015) * 100, 2);
    });
  });

  describe('Edge Case: safeDivide utility', () => {
    it('should return 0 when denominator is 0', () => {
      expect(safeDivide(10, 0)).toBe(0);
    });

    it('should return 0 when denominator is NaN', () => {
      expect(safeDivide(10, NaN)).toBe(0);
    });

    it('should divide normally for valid inputs', () => {
      expect(safeDivide(10, 5)).toBe(2);
    });
  });
});
