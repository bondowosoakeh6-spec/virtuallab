/**
 * Rounding Policy (Prompt #45)
 * 
 * Rules:
 * - Do NOT round intermediate calculations unless Excel does
 * - Use full precision internally
 * - Apply display precision only for presentation
 * - Database stores high precision
 */

/** Display precision - format number for UI display */
export function displayValue(value: number | null, decimals: number = 4): string {
  if (value === null || isNaN(value) || !isFinite(value)) return '0';
  return value.toFixed(decimals);
}

/** Format percentage for display */
export function displayPercent(value: number | null, decimals: number = 2): string {
  if (value === null || isNaN(value) || !isFinite(value)) return '0.00%';
  return `${value.toFixed(decimals)}%`;
}

/** Full precision value for database storage */
export function storagePrecision(value: number): number {
  // Store with maximum JS precision (no rounding)
  return value;
}

/** Round only when Excel explicitly rounds */
export function excelRound(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
