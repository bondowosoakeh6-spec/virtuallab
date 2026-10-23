/**
 * ACCEPTANCE TEST — STANDARDISASI (Prompt #51)
 * ==============================================
 * Source: engine.ts → calculateStandardization()
 * Excel Reference: FORMAT STANDARDISASI worksheet
 *
 * Given:
 *   Volume Y = 10 mL
 *   Konsentrasi Y = 0.1 N
 *   Volume X simplo = 9.8 mL
 *   Volume X duplo = 10.2 mL
 *
 * Expected:
 *   Average X = (9.8 + 10.2) / 2 = 10.0 mL
 *   Konsentrasi X = (10 × 0.1) / 10 = 0.1 N
 */
import { describe, it, expect } from 'vitest';
import { calculateStandardization } from '../../src/lib/calculations/engine';

describe('Acceptance Test — Standardisasi (Standardization)', () => {
  describe('Prompt #51: Standard Case', () => {
    const input = {
      volume_y: 10,
      konsentrasi_y: 0.1,
      simplo_awal: 0,
      simplo_akhir: 9.8,
      duplo_awal: 0,
      duplo_akhir: 10.2,
    };

    it('should calculate volume simplo = 9.8 mL', () => {
      const result = calculateStandardization(input);
      expect(result.volume_simplo).toBeCloseTo(9.8, 10);
    });

    it('should calculate volume duplo = 10.2 mL', () => {
      const result = calculateStandardization(input);
      expect(result.volume_duplo).toBeCloseTo(10.2, 10);
    });

    it('should calculate average volume X = 10.0 mL', () => {
      const result = calculateStandardization(input);
      expect(result.volume_avg).toBeCloseTo(10.0, 10);
    });

    it('should calculate konsentrasi X = 0.1 N', () => {
      const result = calculateStandardization(input);
      expect(result.konsentrasi_x).toBeCloseTo(0.1, 10);
    });
  });

  describe('Edge Case: Non-zero Initial Buret', () => {
    it('should compute volume = final - initial correctly', () => {
      const result = calculateStandardization({
        volume_y: 10,
        konsentrasi_y: 0.1,
        simplo_awal: 2.00,
        simplo_akhir: 11.80,
        duplo_awal: 1.50,
        duplo_akhir: 11.70,
      });
      // simplo = 11.80 - 2.00 = 9.80
      // duplo  = 11.70 - 1.50 = 10.20
      // avg    = 10.0
      // Cx     = (10 × 0.1) / 10 = 0.1
      expect(result.volume_simplo).toBeCloseTo(9.8, 10);
      expect(result.volume_duplo).toBeCloseTo(10.2, 10);
      expect(result.konsentrasi_x).toBeCloseTo(0.1, 10);
    });
  });

  describe('Edge Case: Zero Average Volume', () => {
    it('should return 0 for concentration when avg volume is 0', () => {
      const result = calculateStandardization({
        volume_y: 10,
        konsentrasi_y: 0.1,
        simplo_awal: 5,
        simplo_akhir: 5,
        duplo_awal: 5,
        duplo_akhir: 5,
      });
      expect(result.volume_avg).toBe(0);
      expect(result.konsentrasi_x).toBe(0);
    });
  });

  describe('Step Traceability', () => {
    it('should produce STANDARD formula IDs', () => {
      const result = calculateStandardization({
        volume_y: 10,
        konsentrasi_y: 0.1,
        simplo_awal: 0,
        simplo_akhir: 9.8,
        duplo_awal: 0,
        duplo_akhir: 10.2,
      });
      const ids = result.steps.map((s) => s.id);
      expect(ids).toContain('STANDARD-001');
      expect(ids).toContain('STANDARD-002');
      expect(ids).toContain('STANDARD-003');
    });
  });
});
