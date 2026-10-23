/**
 * ACCEPTANCE TEST — VOLUME TITRASI (Prompt #52)
 * ===============================================
 * Tests basic titration volume calculation: Volume = Final - Initial
 *
 * Given:
 *   Initial = 2.00 mL
 *   Final   = 12.50 mL
 * Expected:
 *   Volume  = 10.50 mL
 */
import { describe, it, expect } from 'vitest';
import { calculateStandardization } from '../../src/lib/calculations/engine';

describe('Acceptance Test — Volume Titrasi (Titration Volume)', () => {
  describe('Prompt #52: Standard Case', () => {
    it('should calculate titration volume = final - initial = 10.50 mL', () => {
      const result = calculateStandardization({
        volume_y: 10,
        konsentrasi_y: 0.1,
        simplo_awal: 2.00,
        simplo_akhir: 12.50,
        duplo_awal: 2.00,
        duplo_akhir: 12.50,
      });
      expect(result.volume_simplo).toBeCloseTo(10.50, 10);
      expect(result.volume_duplo).toBeCloseTo(10.50, 10);
    });

    it('should handle zero initial buret', () => {
      const result = calculateStandardization({
        volume_y: 10,
        konsentrasi_y: 0.1,
        simplo_awal: 0,
        simplo_akhir: 10.50,
        duplo_awal: 0,
        duplo_akhir: 10.50,
      });
      expect(result.volume_simplo).toBeCloseTo(10.50, 10);
    });
  });

  describe('Edge Cases', () => {
    it('should return 0 when initial equals final', () => {
      const result = calculateStandardization({
        volume_y: 10,
        konsentrasi_y: 0.1,
        simplo_awal: 5.00,
        simplo_akhir: 5.00,
        duplo_awal: 5.00,
        duplo_akhir: 5.00,
      });
      expect(result.volume_simplo).toBe(0);
    });

    it('should handle decimal precision', () => {
      const result = calculateStandardization({
        volume_y: 10,
        konsentrasi_y: 0.1,
        simplo_awal: 0.15,
        simplo_akhir: 10.65,
        duplo_awal: 0.25,
        duplo_akhir: 10.75,
      });
      expect(result.volume_simplo).toBeCloseTo(10.50, 10);
      expect(result.volume_duplo).toBeCloseTo(10.50, 10);
    });
  });
});
