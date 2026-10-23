import { InputFieldDescriptor, CalculationInput } from './types';

export interface ValidationError {
  field: string;
  message: string;
  value: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * Validate calculation inputs against field descriptors
 * Rules from Prompt #47:
 * - Mass > 0
 * - Volume >= 0  
 * - Concentration > 0
 * - Dilution Factor > 0
 * - But don't create constraints that contradict the workbook
 * - If formula needs 0 as valid input, allow it
 */
export function validateInputs(
  inputs: CalculationInput,
  descriptors: InputFieldDescriptor[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  for (const desc of descriptors) {
    const value = inputs[desc.key];

    // Check required
    if (desc.required && (value === null || value === undefined || value === '')) {
      errors.push({
        field: desc.key,
        message: `${desc.label} wajib diisi`,
        value,
      });
      continue;
    }

    if (value === null || value === undefined) continue;

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (typeof numValue === 'number') {
      // Check NaN
      if (isNaN(numValue)) {
        errors.push({
          field: desc.key,
          message: `${desc.label} bukan angka valid`,
          value,
        });
        continue;
      }

      // Check Infinity
      if (!isFinite(numValue)) {
        errors.push({
          field: desc.key,
          message: `${desc.label} tidak boleh Infinity`,
          value,
        });
        continue;
      }

      // Check min
      if (desc.validation.min !== undefined && numValue < desc.validation.min) {
        if (numValue === 0 && desc.validation.allowZero) {
          // Zero is explicitly allowed
        } else {
          errors.push({
            field: desc.key,
            message: `${desc.label} harus >= ${desc.validation.min} ${desc.unit}`,
            value: numValue,
          });
        }
      }

      // Check max
      if (desc.validation.max !== undefined && numValue > desc.validation.max) {
        warnings.push(`${desc.label} = ${numValue} ${desc.unit} sangat besar, pastikan sudah benar`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/** Sanitize a numeric value - never return NaN/Infinity/undefined (Prompt #12) */
export function sanitizeNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num) || !isFinite(num)) return null;
  return num;
}

/** Safe division — returns 0 if denominator is 0 or invalid */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0 || isNaN(denominator) || !isFinite(denominator)) return 0;
  const result = numerator / denominator;
  if (isNaN(result) || !isFinite(result)) return 0;
  return result;
}

/** Validate that a value is a positive number */
export function validatePositive(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return !isNaN(num) && isFinite(num) && num > 0;
}

/** Validate that a value is a non-negative number */
export function validateNonNegative(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return !isNaN(num) && isFinite(num) && num >= 0;
}
