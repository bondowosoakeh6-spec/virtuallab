/**
 * ACCEPTANCE TEST — KARBOHIDRAT (Prompt #58)
 * ============================================
 * Source: engine.ts → calculateCarbohydrate()
 * Excel Reference: karbo, karbo (2), Konversi Tabel Luff Schoorl
 *
 * Test structure per prompt:
 *   Excel input → Expected Excel result → Application result → Difference → Pass/Fail
 *
 * Representative inputs:
 *   Standardization: simplo=9.8, duplo=10.2 → avg=10.0
 *   Cx = (10 × 0.1) / 10.0 = 0.1 N
 *   Blanko: simplo=25.0, duplo=25.0 → avg=25.0
 *   Sample: simplo=15.0, duplo=15.0 → avg=15.0
 *   V_diff = 25.0 - 15.0 = 10.0
 *   Product = 10.0 × 0.1 = 1.0
 *   Volume Na2S2O3 = 1.0 / 0.1 = 10.0 mL
 *   Luff lookup (glukosa_fruktosa, vol=10) = 25.0 mg
 *   %Glucose = (25.0 × 1) / 1000 = 0.025
 *   Factor (Pati) = 0.90
 *   %Carbo = 0.025 × 0.90 = 0.0225
 */
import { describe, it, expect } from 'vitest';
import {
  calculateCarbohydrate,
  lookupLuffSchoorl,
  lookupCarboFactor,
  CARBOHYDRATE_CONVERSION_FACTORS,
} from '../../src/lib/calculations/engine';

describe('Acceptance Test — Karbohidrat (Carbohydrate)', () => {
  const baseInput = {
    std_simplo_awal: 0, std_simplo_akhir: 9.8,
    std_duplo_awal: 0, std_duplo_akhir: 10.2,
    volume_y: 10, konsentrasi_y: 0.1,
    blanko_simplo_awal: 0, blanko_simplo_akhir: 25.0,
    blanko_duplo_awal: 0, blanko_duplo_akhir: 25.0,
    sample_simplo_awal: 0, sample_simplo_akhir: 15.0,
    sample_duplo_awal: 0, sample_duplo_akhir: 15.0,
    konsentrasi_penitar_dibuat: 0.1,
    faktor_pengenceran: 1,
    massa_sampel: 1000,
    sugar_type: 'glukosa_fruktosa' as const,
    jenis_sampel: 'Pati',
  };

  describe('Standardization', () => {
    it('std_volume_avg = 10.0 mL', () => {
      const r = calculateCarbohydrate(baseInput);
      expect(r.std_volume_avg).toBeCloseTo(10.0, 9);
    });

    it('konsentrasi_x = 0.1 N', () => {
      const r = calculateCarbohydrate(baseInput);
      expect(r.konsentrasi_x).toBeCloseTo(0.1, 9);
    });
  });

  describe('Blanko & Sample', () => {
    it('blanko_avg = 25.0 mL', () => {
      const r = calculateCarbohydrate(baseInput);
      expect(r.blanko_avg).toBeCloseTo(25.0, 9);
    });

    it('sample_avg = 15.0 mL', () => {
      const r = calculateCarbohydrate(baseInput);
      expect(r.sample_avg).toBeCloseTo(15.0, 9);
    });

    it('volume_diff = 10.0 mL', () => {
      const r = calculateCarbohydrate(baseInput);
      expect(r.volume_diff).toBeCloseTo(10.0, 9);
    });
  });

  describe('Na₂S₂O₃ Volume Calculation', () => {
    it('product = V_diff × Cx = 10.0 × 0.1 = 1.0', () => {
      const r = calculateCarbohydrate(baseInput);
      expect(r.product_value).toBeCloseTo(1.0, 9);
    });

    it('volume_na2s2o3 = 1.0 / 0.1 = 10.0 mL', () => {
      const r = calculateCarbohydrate(baseInput);
      expect(r.volume_na2s2o3).toBeCloseTo(10.0, 9);
    });
  });

  describe('Luff Schoorl Lookup', () => {
    it('mg_sugar for vol=10, glukosa = 25.0 mg', () => {
      const r = calculateCarbohydrate(baseInput);
      expect(r.mg_sugar).toBeCloseTo(25.0, 5);
    });
  });

  describe('Glucose & Carbohydrate Percentage', () => {
    it('%glucose = (25.0 × 1) / 1000 = 0.025', () => {
      const r = calculateCarbohydrate(baseInput);
      expect(r.glucose_pct).toBeCloseTo(0.025, 9);
    });

    it('carbo conversion factor (Pati) = 0.90', () => {
      expect(lookupCarboFactor('Pati')).toBe(0.90);
    });

    it('%carbohydrate = 0.025 × 0.90 = 0.0225', () => {
      const r = calculateCarbohydrate(baseInput);
      expect(r.carbohydrate_pct).toBeCloseTo(0.0225, 9);
    });
  });

  describe('Konversi Tabel Luff Schoorl Verification', () => {
    const testCases = [
      { vol: 1, glu: 2.4, lak: 3.6, mal: 3.9 },
      { vol: 5, glu: 12.2, lak: 18.0, mal: 19.5 },
      { vol: 10, glu: 25.0, lak: 36.0, mal: 39.0 },
      { vol: 15, glu: 38.5, lak: 56.0, mal: 60.6 },
      { vol: 20, glu: 53.0, lak: 76.0, mal: 82.1 },
      { vol: 23, glu: 62.2, lak: 88.0, mal: 94.6 },
    ];

    testCases.forEach(({ vol, glu, lak, mal }) => {
      it(`Vol=${vol}: glucose=${glu}, lactose=${lak}, maltose=${mal}`, () => {
        expect(lookupLuffSchoorl(vol, 'glukosa_fruktosa')).toBeCloseTo(glu, 5);
        expect(lookupLuffSchoorl(vol, 'laktosa')).toBeCloseTo(lak, 5);
        expect(lookupLuffSchoorl(vol, 'maltosa')).toBeCloseTo(mal, 5);
      });
    });
  });

  describe('Carbohydrate Conversion Factors', () => {
    it('Pati = 0.90', () => {
      expect(CARBOHYDRATE_CONVERSION_FACTORS['Pati']).toBe(0.90);
    });

    it('Sukrosa = 0.95', () => {
      expect(CARBOHYDRATE_CONVERSION_FACTORS['Sukrosa']).toBe(0.95);
    });
  });

  describe('Excel Comparison Summary', () => {
    it('all formula results should match Excel expected values', () => {
      const r = calculateCarbohydrate(baseInput);
      const comparison = [
        { module: 'Std Avg', expected: 10.0, actual: r.std_volume_avg },
        { module: 'Cx', expected: 0.1, actual: r.konsentrasi_x },
        { module: 'Blanko Avg', expected: 25.0, actual: r.blanko_avg },
        { module: 'Sample Avg', expected: 15.0, actual: r.sample_avg },
        { module: 'V_diff', expected: 10.0, actual: r.volume_diff },
        { module: 'Vol Na2S2O3', expected: 10.0, actual: r.volume_na2s2o3 },
        { module: 'mg_sugar', expected: 25.0, actual: r.mg_sugar },
        { module: '%glucose', expected: 0.025, actual: r.glucose_pct },
        { module: '%carbo', expected: 0.0225, actual: r.carbohydrate_pct },
      ];

      for (const c of comparison) {
        const diff = Math.abs(c.actual - c.expected);
        expect(diff).toBeLessThan(1e-9);
      }
    });
  });
});
