// Core types and utilities
export * from './types';
export * from './validation';
export * from './rounding';
export * from './formula-display';

// Proximate analysis (uses renamed INPUT_FIELDS to avoid conflicts)
export {
  calculateMoisture,
  type MoistureInput,
  MOISTURE_INPUT_FIELDS,
} from './proximate';

export {
  calculateAsh,
  type AshInput,
  ASH_INPUT_FIELDS,
} from './proximate';

export {
  calculateProtein,
  type ProteinInput,
  PROTEIN_CONVERSION_FACTORS,
  PROTEIN_INPUT_FIELDS,
} from './proximate';

export {
  calculateProteinStandardless,
  type ProteinStandardlessInput,
  PROTEIN_STDLESS_INPUT_FIELDS,
} from './proximate';

export {
  calculateCarbohydrate,
  type CarbohydrateInput,
  CARBOHYDRATE_CONVERSION_FACTORS,
  CARBOHYDRATE_INPUT_FIELDS,
} from './proximate';

// Volumetric analysis  
export * from './volumetric/standardization';
export * from './volumetric/concentration';
export * from './volumetric/assay';
export * from './volumetric/dilution';

// Chemistry
export * from './chemistry/element-lookup';
export * from './chemistry/molar-mass';
export * from './chemistry/equivalent-weight';

// Titration
export * from './titration/titration-curve';
export * from './titration/ph-before-equivalence';
export * from './titration/ph-equivalence';
export * from './titration/ph-after-equivalence';

// Luff Schoorl
export * from './luff-schoorl/lookup';
export * from './luff-schoorl/glucose';
export * from './luff-schoorl/lactose';
export * from './luff-schoorl/maltose';
export {
  calculateLuffCarbohydrate,
  CARBOHYDRATE_CONVERSION_FACTORS as LUFF_CARBO_CONVERSION_FACTORS,
  type LuffCarbohydrateInput,
} from './luff-schoorl/carbohydrate';

// Experiment Engine
export * from './experiment-engine';
