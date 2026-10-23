/**
 * EXCEL VALIDATION TEST SUITE (Prompt #60)
 * ==========================================
 * Vitest wrapper around validate-against-excel logic
 * Run via: npx vitest tests/excel-validation/
 */
import { describe, it, expect } from 'vitest';
import {
  calculateMoisture,
  calculateAsh,
  calculateStandardization,
  calculateMolarMass,
  calculateEquivalentWeight,
  calculateCarbohydrate,
  calculateProtein,
  calculateKadar,
  calculateTitrationCurve,
  lookupLuffSchoorl,
  lookupAtomicMass,
} from '../../src/lib/calculations/engine';

describe('Excel Validation Regression Tests (Prompt #60)', () => {
  describe('Module: Moisture', () => {
    const r = calculateMoisture({
      bobot_wadah_kosong: 25.3420,
      bobot_sampel: 2.0015,
      bobot_setelah: 27.1230,
    });

    it('H16: weight_before = 27.3435', () => {
      expect(r.weight_before).toBeCloseTo(27.3435, 4);
    });

    it('H19: weight_loss = 0.2205', () => {
      expect(r.weight_loss).toBeCloseTo(0.2205, 4);
    });

    it('H24: moisture_pct matches Excel', () => {
      expect(r.moisture_pct).toBeCloseTo((0.2205 / 2.0015) * 100, 2);
    });
  });

  describe('Module: Ash', () => {
    const r = calculateAsh({
      bobot_wadah_kosong: 20.0120,
      bobot_cawan_sampel: 22.5430,
      bobot_setelah: 20.2610,
    });

    it('H16: ash_weight = 0.2490', () => {
      expect(r.ash_weight).toBeCloseTo(0.2490, 4);
    });

    it('H21: ash_pct matches Excel', () => {
      expect(r.ash_pct).toBeCloseTo((0.2490 / 2.5310) * 100, 1);
    });
  });

  describe('Module: Standardization', () => {
    const r = calculateStandardization({
      volume_y: 10,
      konsentrasi_y: 0.1,
      simplo_awal: 0, simplo_akhir: 9.8,
      duplo_awal: 0, duplo_akhir: 10.2,
    });

    it('H14: volume_avg = 10.0000', () => {
      expect(r.volume_avg).toBeCloseTo(10.0, 10);
    });

    it('P21: konsentrasi_x = 0.1000', () => {
      expect(r.konsentrasi_x).toBeCloseTo(0.1, 10);
    });
  });

  describe('Module: Luff Schoorl', () => {
    it('VLOOKUP glucose vol=10 = 25.00', () => {
      expect(lookupLuffSchoorl(10, 'glukosa_fruktosa')).toBeCloseTo(25.0, 5);
    });

    it('VLOOKUP lactose vol=10 = 36.00', () => {
      expect(lookupLuffSchoorl(10, 'laktosa')).toBeCloseTo(36.0, 5);
    });

    it('VLOOKUP maltose vol=10 = 39.00', () => {
      expect(lookupLuffSchoorl(10, 'maltosa')).toBeCloseTo(39.0, 5);
    });
  });

  describe('Module: Molar Mass', () => {
    it('H2O = 18.015 g/mol', () => {
      const r = calculateMolarMass({
        groups: [[
          { symbol: 'H', quantity: 2 },
          { symbol: 'O', quantity: 1 },
        ]],
      });
      expect(r.totalMass).toBeCloseTo(2 * 1.008 + 15.999, 3);
    });
  });

  describe('Module: Equivalent Weight', () => {
    it('H2SO4 / 2 = 49.0385 g/ekuivalen', () => {
      const r = calculateEquivalentWeight({
        groups: [[
          { symbol: 'H', quantity: 2 },
          { symbol: 'S', quantity: 1 },
          { symbol: 'O', quantity: 4 },
        ]],
        nValues: [2],
      });
      expect(r.equivalentWeights[0]).toBeCloseTo(
        (2 * 1.008 + 32.065 + 4 * 15.999) / 2,
        3
      );
    });
  });

  describe('Module: Protein', () => {
    const r = calculateProtein({
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
    });

    it('H12: std_volume_avg = 10.4', () => {
      expect(r.std_volume_avg).toBeCloseTo(10.4, 9);
    });

    it('I66: protein_pct matches calculation', () => {
      const expectedN = (7.0 * 0.1 * 14.007 * 1) / 500;
      expect(r.protein_pct).toBeCloseTo(expectedN * 5.75, 9);
    });
  });

  describe('Module: Assay (Penetapan Kadar)', () => {
    const r = calculateKadar({
      simplo_awal: 0, simplo_akhir: 12.5,
      duplo_awal: 0, duplo_akhir: 12.7,
      unsur_senyawa: 'Na',
      konsentrasi_penitar: 0.1,
      volume_sampel: 25,
      faktor_pengenceran: 1,
    });

    it('H30: kadar Na matches calculation', () => {
      expect(r.kadar).toBeCloseTo((12.6 * 22.990 * 0.1 * 1) / 25, 4);
    });
  });

  describe('Module: Titration Curve', () => {
    const r = calculateTitrationCurve({
      ka: 1.82e-5,
      volume_y: 100,
      konsentrasi_y: 0.1,
      volume_increment: 10,
    });

    it('Kb = 10^-14 / Ka', () => {
      expect(r.kb).toBeCloseTo(1e-14 / 1.82e-5, 14);
    });

    it('Equivalence volume = 100 mL', () => {
      expect(r.equivalence_volume).toBe(100);
    });

    it('pH at equivalence ≈ 8.72', () => {
      expect(r.point_at_equivalence.ph).toBeCloseTo(8.72, 0);
    });
  });
});
