/**
 * ACCEPTANCE TEST — AVERAGE (Prompt #53)
 * ========================================
 * Tests the AVERAGE function equivalent to Excel =AVERAGE(H10:H11)
 *
 * Given:
 *   Simplo = 9.8
 *   Duplo  = 10.2
 * Expected:
 *   Average = (9.8 + 10.2) / 2 = 10.0
 */
import { describe, it, expect } from 'vitest';
import { calculateStandardization } from '../../src/lib/calculations/engine';

describe('Acceptance Test — Average (Excel AVERAGE equivalent)', () => {
  describe('Prompt #53: Standard Case', () => {
    it('should calculate average of simplo and duplo = 10.0', () => {
      const result = calculateStandardization({
        volume_y: 10,
        konsentrasi_y: 0.1,
        simplo_awal: 0,
        simplo_akhir: 9.8,
        duplo_awal: 0,
        duplo_akhir: 10.2,
      });
      // Equivalent to Excel =AVERAGE(H10:H11) = AVERAGE(9.8, 10.2) = 10.0
      expect(result.volume_avg).toBeCloseTo(10.0, 10);
    });
  });

  describe('Equivalent Excel: =AVERAGE(H10:H11)', () => {
    it('should match Excel AVERAGE for identical values', () => {
      const result = calculateStandardization({
        volume_y: 10,
        konsentrasi_y: 0.1,
        simplo_awal: 0,
        simplo_akhir: 7.5,
        duplo_awal: 0,
        duplo_akhir: 7.5,
      });
      expect(result.volume_avg).toBeCloseTo(7.5, 10);
    });

    it('should match Excel AVERAGE for asymmetric values', () => {
      const result = calculateStandardization({
        volume_y: 10,
        konsentrasi_y: 0.1,
        simplo_awal: 0,
        simplo_akhir: 8.3,
        duplo_awal: 0,
        duplo_akhir: 12.7,
      });
      // AVERAGE(8.3, 12.7) = 10.5
      expect(result.volume_avg).toBeCloseTo(10.5, 10);
    });
  });
});
