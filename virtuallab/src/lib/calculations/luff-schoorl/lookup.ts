export interface LuffSchoorlEntry {
  volume: number;           // Volume Na₂S₂O₃ 0.1N (mL)
  glukosa_fruktosa: number; // mg Glucose/Fructose/Invert sugar
  laktosa: number;          // mg Lactose
  maltosa: number;          // mg Maltose  
}

export const LUFF_SCHOORL_TABLE: LuffSchoorlEntry[] = [
  { volume: 1, glukosa_fruktosa: 2.4, laktosa: 3.6, maltosa: 3.9 },
  { volume: 2, glukosa_fruktosa: 4.8, laktosa: 7.2, maltosa: 7.8 },
  { volume: 3, glukosa_fruktosa: 7.2, laktosa: 10.8, maltosa: 11.7 },
  { volume: 4, glukosa_fruktosa: 9.7, laktosa: 14.4, maltosa: 15.6 },
  { volume: 5, glukosa_fruktosa: 12.2, laktosa: 18.0, maltosa: 19.5 },
  { volume: 6, glukosa_fruktosa: 14.7, laktosa: 21.6, maltosa: 23.4 },
  { volume: 7, glukosa_fruktosa: 17.2, laktosa: 25.2, maltosa: 27.3 },
  { volume: 8, glukosa_fruktosa: 19.8, laktosa: 28.8, maltosa: 31.2 },
  { volume: 9, glukosa_fruktosa: 22.4, laktosa: 32.4, maltosa: 35.1 },
  { volume: 10, glukosa_fruktosa: 25.0, laktosa: 36.0, maltosa: 39.0 },
  { volume: 11, glukosa_fruktosa: 27.6, laktosa: 39.6, maltosa: 42.9 },
  { volume: 12, glukosa_fruktosa: 30.3, laktosa: 44.0, maltosa: 47.6 },
  { volume: 13, glukosa_fruktosa: 33.0, laktosa: 48.0, maltosa: 52.0 },
  { volume: 14, glukosa_fruktosa: 35.7, laktosa: 52.0, maltosa: 56.3 },
  { volume: 15, glukosa_fruktosa: 38.5, laktosa: 56.0, maltosa: 60.6 },
  { volume: 16, glukosa_fruktosa: 41.3, laktosa: 60.0, maltosa: 64.9 },
  { volume: 17, glukosa_fruktosa: 44.2, laktosa: 64.0, maltosa: 69.2 },
  { volume: 18, glukosa_fruktosa: 47.1, laktosa: 68.0, maltosa: 73.5 },
  { volume: 19, glukosa_fruktosa: 50.0, laktosa: 72.0, maltosa: 77.8 },
  { volume: 20, glukosa_fruktosa: 53.0, laktosa: 76.0, maltosa: 82.1 },
  { volume: 21, glukosa_fruktosa: 56.0, laktosa: 80.0, maltosa: 86.4 },
  { volume: 22, glukosa_fruktosa: 59.1, laktosa: 84.0, maltosa: 90.7 },
  { volume: 23, glukosa_fruktosa: 62.2, laktosa: 88.0, maltosa: 94.6 },
];

export function lookupLuffSchoorl(
  volume: number,
  sugarType: 'glukosa_fruktosa' | 'laktosa' | 'maltosa'
): { value: number; matchedVolume: number; isExact: boolean } | { error: string } {
  if (volume < 1) {
    return { error: 'Volume is below the minimum table value (1)' };
  }
  
  let bestMatch = LUFF_SCHOORL_TABLE[0];
  let isExact = false;
  
  for (const entry of LUFF_SCHOORL_TABLE) {
    if (entry.volume <= volume) {
      bestMatch = entry;
      if (entry.volume === volume) {
        isExact = true;
      }
    } else {
      break;
    }
  }
  
  return {
    value: bestMatch[sugarType],
    matchedVolume: bestMatch.volume,
    isExact
  };
}
