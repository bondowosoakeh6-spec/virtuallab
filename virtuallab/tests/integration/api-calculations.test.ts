import { describe, it, expect } from 'vitest';
import { calculateMoisture } from '../../src/lib/calculations/proximate/moisture';
import { calculateAsh } from '../../src/lib/calculations/proximate/ash';
import { calculateStandardization } from '../../src/lib/calculations/volumetric/standardization';
import { calculateMolarMass } from '../../src/lib/calculations/chemistry/molar-mass';
import { calculateEquivalentWeight } from '../../src/lib/calculations/chemistry/equivalent-weight';
import { calculateTitrationCurve } from '../../src/lib/calculations/titration/titration-curve';
import { lookupLuffSchoorl } from '../../src/lib/calculations/luff-schoorl/lookup';
import { safeDivide } from '../../src/lib/calculations/validation';

describe('Integration — Cross-Module Calculation Pipelines', () => {

  describe('Proximate Analysis Pipeline', () => {
    it('moisture + ash should sum to less than 100%', () => {
      const moisture = calculateMoisture({
        bobot_wadah_kosong: 25.342, bobot_cawan_sampel: 27.343,
        bobot_sampel: 2.001, bobot_setelah: 27.123,
      });
      const ash = calculateAsh({
        bobot_wadah_kosong: 20.012, bobot_cawan_sampel: 22.543,
        bobot_setelah: 20.261,
      });
      expect(moisture.status).toBe('SUCCESS');
      expect(ash.status).toBe('SUCCESS');
      const totalPercent = (moisture.result || 0) + (ash.result || 0);
      expect(totalPercent).toBeLessThan(100);
      expect(totalPercent).toBeGreaterThan(0);
    });
  });

  describe('Volumetric Pipeline: Standardization', () => {
    it('standardization produces valid concentration for downstream assay', () => {
      const std = calculateStandardization({
        simplo_awal: 0, simplo_akhir: 9.8,
        duplo_awal: 0, duplo_akhir: 10.2,
        volume_y: 10, konsentrasi_y: 0.1,
      });
      expect(std.status).toBe('SUCCESS');
      expect(std.result).toBeGreaterThan(0);
      expect(std.result).toBeLessThan(1);
    });
  });

  describe('Chemistry: Molar Mass → Equivalent Weight', () => {
    it('H2SO4: molar mass ~98 → equivalent weight ~49 (valence 2)', () => {
      const mm = calculateMolarMass({ formula: 'H2SO4' });
      expect(mm.status).toBe('SUCCESS');
      expect(mm.result).toBeCloseTo(98.077, 0);

      const ew = calculateEquivalentWeight({ formula: 'H2SO4', nValues: [2] });
      expect(ew.status).toBe('SUCCESS');
      expect(ew.result).toBeCloseTo(49.039, 0);
    });

    it('NaOH: molar mass ~40 → equivalent weight ~40 (valence 1)', () => {
      const mm = calculateMolarMass({ formula: 'NaOH' });
      expect(mm.status).toBe('SUCCESS');
      expect(mm.result).toBeCloseTo(39.997, 0);

      const ew = calculateEquivalentWeight({ formula: 'NaOH', nValues: [1] });
      expect(ew.status).toBe('SUCCESS');
      expect(ew.result).toBeCloseTo(39.997, 0);
    });
  });

  describe('Luff Schoorl Lookup', () => {
    it('lookup at 1.0 mL returns valid glucose mg', () => {
      const result = lookupLuffSchoorl(1.0, 'glukosa_fruktosa');
      expect(result).toBeDefined();
      expect('value' in result).toBe(true);
      if ('value' in result) {
        expect(result.value).toBeGreaterThan(0);
      }
    });

    it('lookup at 10.0 mL returns valid values', () => {
      const result = lookupLuffSchoorl(10.0, 'glukosa_fruktosa');
      expect('value' in result).toBe(true);
      if ('value' in result) {
        expect(result.value).toBe(25.0);
        expect(result.isExact).toBe(true);
      }
    });

    it('lookup below minimum returns error', () => {
      const result = lookupLuffSchoorl(0.5, 'glukosa_fruktosa');
      expect('error' in result).toBe(true);
    });
  });

  describe('Titration Curve Generation', () => {
    it('generates curve with correct pH range', () => {
      const curve = calculateTitrationCurve({
        konsentrasi_x: 0.1, volume_y: 25,
        konsentrasi_y: 0.1, ka: 1.8e-5,
      });
      expect(curve).toBeDefined();
      expect(curve.curveData.length).toBeGreaterThan(5);
      for (const pt of curve.curveData) {
        expect(pt.pH).toBeGreaterThanOrEqual(0);
        expect(pt.pH).toBeLessThanOrEqual(14);
      }
    });
  });

  describe('Error Handling', () => {
    it('safeDivide returns 0 for division by zero', () => {
      expect(safeDivide(10, 0)).toBe(0);
      expect(safeDivide(0, 0)).toBe(0);
    });

    it('moisture with zero sample weight returns ERROR', () => {
      const result = calculateMoisture({
        bobot_wadah_kosong: 25, bobot_cawan_sampel: 27,
        bobot_sampel: 0, bobot_setelah: 26,
      });
      expect(result.status).toBe('ERROR');
    });

    it('molar mass with unknown element returns ERROR', () => {
      const result = calculateMolarMass({ formula: 'Xx' });
      expect(result.status).toBe('ERROR');
    });
  });
});
