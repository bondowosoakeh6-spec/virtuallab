export {
  calculateMoisture,
  type MoistureInput,
  INPUT_FIELDS as MOISTURE_INPUT_FIELDS,
} from './moisture';

export {
  calculateAsh,
  type AshInput,
  INPUT_FIELDS as ASH_INPUT_FIELDS,
} from './ash';

export {
  calculateProtein,
  type ProteinInput,
  PROTEIN_CONVERSION_FACTORS,
  INPUT_FIELDS as PROTEIN_INPUT_FIELDS,
} from './protein';

export {
  calculateProteinStandardless,
  type ProteinStandardlessInput,
  INPUT_FIELDS as PROTEIN_STDLESS_INPUT_FIELDS,
} from './protein-standardless';

export {
  calculateCarbohydrate,
  type CarbohydrateInput,
  CARBOHYDRATE_CONVERSION_FACTORS,
  INPUT_FIELDS as CARBOHYDRATE_INPUT_FIELDS,
} from './carbohydrate';
