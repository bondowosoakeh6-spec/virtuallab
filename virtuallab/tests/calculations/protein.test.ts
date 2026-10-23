/**
 * ACCEPTANCE TEST — PROTEIN (Prompt #57)
 * ========================================
 * Source: engine.ts → calculateProtein()
 * Excel Reference: Format Kadar Protein worksheet
 *
 * Representative numeric inputs from Excel workbook:
 *   Standardization: simplo=10.5, duplo=10.3 → avg=10.4
 *   Cx = (10 × 0.1) / 10.4 ≈ 0.096154
 *   Blanko: simplo=25.5, duplo=25.3 → avg=25.4
 *   Sample: simplo=18.3, duplo=18.5 → avg=18.4
 *   V_diff = 25.4 - 18.4 = 7.0
 *   Numerator = 7.0 × 0.1 × 14.007 × 1 = 9.8049
 *   %N = 9.8049 / 500 = 0.019610
 *   Factor (Tahu) = 5.75
 *   %Protein = 0.019610 × 5.75 ≈ 0.11276
 *
 * Tolerance: absolute <= 1e-9
 */
import { describe, it, expect } from 'vitest';
import {
  calculateProtein,
  lookupProteinFactor,
  PROTEIN_CONVERSION_FACTORS,
} from '../../src/lib/calculations/engine';

const TOLERANCE = 1e-9;

describe('Acceptance Test — Protein (Kjeldahl Method)', () => {
  const baseInput = {
    std_simplo_awal: 0, std_simplo_akhir: 10.5,
    std_duplo_awal: 0, std_duplo_akhir: 10.3,
    volume_y: 10, konsentrasi_y: 0.1,
    blanko_simplo_awal: 0, blanko_simplo_akhir: 25.5,
    blanko_duplo_awal: 0, blanko_duplo_akhir: 25.3,
    sample_simplo_awal: 0, sample_simplo_akhir: 18.3,
    sample_duplo_awal: 0, sample_duplo_akhir: 18.5,
    konsentrasi_penitar: 0.1, ketetapan_protein: 14.007,
    faktor_pengenceran: 1, massa_sampel: 500,
    jenis_sampel: 'Tahu',
  };

  describe('PROTEIN-001/002: Titration Volumes', () => {
    it('std_volume_simplo = 10.5 mL', () => {
      const r = calculateProtein(baseInput);
      expect(r.std_volume_simplo).toBeCloseTo(10.5, 9);
    });

    it('std_volume_duplo = 10.3 mL', () => {
      const r = calculateProtein(baseInput);
      expect(r.std_volume_duplo).toBeCloseTo(10.3, 9);
    });
  });

  describe('PROTEIN-003: Average Volume = AVERAGE(H10:H11)', () => {
    it('avg = (10.5 + 10.3) / 2 = 10.4', () => {
      const r = calculateProtein(baseInput);
      expect(r.std_volume_avg).toBeCloseTo(10.4, 9);
    });
  });

  describe('PROTEIN-004: Standardization Concentration', () => {
    it('Cx = (10 × 0.1) / 10.4 ≈ 0.0961538', () => {
      const r = calculateProtein(baseInput);
      const expected = (10 * 0.1) / 10.4;
      expect(Math.abs(r.konsentrasi_x - expected)).toBeLessThan(TOLERANCE);
    });
  });

  describe('PROTEIN-005/006: Blanko & Sample Averages', () => {
    it('blanko_avg = (25.5 + 25.3) / 2 = 25.4', () => {
      const r = calculateProtein(baseInput);
      expect(r.blanko_avg).toBeCloseTo(25.4, 9);
    });

    it('sample_avg = (18.3 + 18.5) / 2 = 18.4', () => {
      const r = calculateProtein(baseInput);
      expect(r.sample_avg).toBeCloseTo(18.4, 9);
    });
  });

  describe('PROTEIN-007: Volume Difference', () => {
    it('V_diff = 25.4 - 18.4 = 7.0', () => {
      const r = calculateProtein(baseInput);
      expect(r.volume_diff).toBeCloseTo(7.0, 9);
    });
  });

  describe('PROTEIN-008: Numerator Product', () => {
    it('numerator = 7.0 × 0.1 × 14.007 × 1 = 9.8049', () => {
      const r = calculateProtein(baseInput);
      const expected = 7.0 * 0.1 * 14.007 * 1;
      expect(Math.abs(r.numerator_product - expected)).toBeLessThan(TOLERANCE);
    });
  });

  describe('PROTEIN-009: Nitrogen Percentage', () => {
    it('%N = 9.8049 / 500 = 0.019610', () => {
      const r = calculateProtein(baseInput);
      const expected = (7.0 * 0.1 * 14.007 * 1) / 500;
      expect(Math.abs(r.nitrogen_pct - expected)).toBeLessThan(TOLERANCE);
    });
  });

  describe('PROTEIN-010: Conversion Factor Lookup', () => {
    it('Tahu factor = 5.75', () => {
      expect(lookupProteinFactor('Tahu')).toBe(5.75);
    });

    it('Case-insensitive lookup', () => {
      expect(lookupProteinFactor('tahu')).toBe(5.75);
    });

    it('Susu factor = 6.38', () => {
      expect(lookupProteinFactor('Susu')).toBe(6.38);
    });

    it('Unknown type returns 0', () => {
      expect(lookupProteinFactor('InvalidFood')).toBe(0);
    });
  });

  describe('PROTEIN-011: Final Protein Percentage', () => {
    it('%Protein = %N × 5.75', () => {
      const r = calculateProtein(baseInput);
      const expectedN = (7.0 * 0.1 * 14.007 * 1) / 500;
      const expectedProtein = expectedN * 5.75;
      expect(Math.abs(r.protein_pct - expectedProtein)).toBeLessThan(TOLERANCE);
    });
  });

  describe('Step Traceability', () => {
    it('should produce all 11 PROTEIN step IDs', () => {
      const r = calculateProtein(baseInput);
      const ids = r.steps.map(s => s.id);
      for (let i = 1; i <= 11; i++) {
        expect(ids).toContain(`PROTEIN-${String(i).padStart(3, '0')}`);
      }
    });
  });
});
