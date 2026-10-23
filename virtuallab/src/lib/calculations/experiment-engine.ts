import { CalculationResult, ExperimentPhase, VirtualExperiment, InputFieldDescriptor } from './types';

export interface ExperimentDefinition {
  id: string;
  title: string;
  type: 'moisture' | 'ash' | 'protein' | 'protein_standardless' | 'carbohydrate' | 'standardization' | 'assay' | 'molar_mass' | 'equivalent_weight' | 'titration_curve';
  theory: string;
  objective: string;
  equipment: string[];
  materials: string[];
  procedure: string[];
  inputFields: InputFieldDescriptor[];
  calculationType: string;
}

export interface ExperimentSession {
  id: string;
  experimentId: string;
  studentId: string;
  phase: ExperimentPhase;
  inputs: Record<string, number | string | null>;
  calculationResult: CalculationResult | null;
  startedAt: string;
  completedAt: string | null;
  submittedAt: string | null;
  grade: number | null;
  feedback: string | null;
}

export const EXPERIMENT_PHASES: ExperimentPhase[] = [
  'READ_THEORY',
  'START_EXPERIMENT', 
  'INPUT_DATA',
  'RUN_CALCULATION',
  'REVIEW_CALCULATION',
  'SAVE_SESSION',
  'SUBMITTED',
  'INSTRUCTOR_REVIEW',
  'GRADED',
  'FEEDBACK',
];

/** Validate phase transition */
export function canTransition(current: ExperimentPhase, next: ExperimentPhase): boolean {
  const currentIdx = EXPERIMENT_PHASES.indexOf(current);
  const nextIdx = EXPERIMENT_PHASES.indexOf(next);
  // Can only move forward one step at a time, or stay
  // Exception: can go back from REVIEW to INPUT_DATA
  if (current === 'REVIEW_CALCULATION' && next === 'INPUT_DATA') return true;
  return nextIdx === currentIdx + 1;
}

/** Get available next phases */
export function getNextPhases(current: ExperimentPhase): ExperimentPhase[] {
  const phases: ExperimentPhase[] = [];
  const currentIdx = EXPERIMENT_PHASES.indexOf(current);
  if (currentIdx < EXPERIMENT_PHASES.length - 1) {
    phases.push(EXPERIMENT_PHASES[currentIdx + 1]);
  }
  if (current === 'REVIEW_CALCULATION') {
    phases.push('INPUT_DATA');
  }
  return phases;
}

/** Create a new experiment session */
export function createSession(
  experimentId: string,
  studentId: string
): ExperimentSession {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    experimentId,
    studentId,
    phase: 'READ_THEORY',
    inputs: {},
    calculationResult: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
    submittedAt: null,
    grade: null,
    feedback: null,
  };
}

/** Run calculation for an experiment */
export async function runExperimentCalculation(
  experiment: ExperimentDefinition,
  inputs: Record<string, number | string | null>
): Promise<CalculationResult> {
  // Dynamic import based on experiment type
  switch (experiment.type) {
    case 'moisture': {
      const { calculateMoisture } = await import('./proximate/moisture');
      return calculateMoisture(inputs as any);
    }
    case 'ash': {
      const { calculateAsh } = await import('./proximate/ash');
      return calculateAsh(inputs as any);
    }
    case 'protein': {
      const { calculateProtein } = await import('./proximate/protein');
      return calculateProtein(inputs as any);
    }
    case 'protein_standardless': {
      const { calculateProteinStandardless } = await import('./proximate/protein-standardless');
      return calculateProteinStandardless(inputs as any);
    }
    case 'carbohydrate': {
      const { calculateCarbohydrate } = await import('./proximate/carbohydrate');
      return calculateCarbohydrate(inputs as any);
    }
    case 'standardization': {
      const { calculateStandardization } = await import('./volumetric/standardization');
      return calculateStandardization(inputs as any);
    }
    case 'assay': {
      const { calculateAssay } = await import('./volumetric/assay');
      return calculateAssay(inputs as any);
    }
    case 'molar_mass': {
      const { calculateMolarMass } = await import('./chemistry/molar-mass');
      return calculateMolarMass(inputs as any);
    }
    case 'equivalent_weight': {
      const { calculateEquivalentWeight } = await import('./chemistry/equivalent-weight');
      return calculateEquivalentWeight(inputs as any);
    }
    case 'titration_curve': {
      const { calculateTitrationCurve } = await import('./titration/titration-curve');
      return calculateTitrationCurve(inputs as any);
    }
    default: {
      return {
        calculationId: `calc_error_${Date.now()}`,
        status: 'ERROR',
        result: null,
        unit: '',
        formula: '',
        formulaDisplay: '',
        intermediate: {},
        steps: [],
        traceability: {
          formulaId: 'UNKNOWN',
          sourceWorkbook: '',
          sourceSheet: '',
          sourceCells: [],
          timestamp: new Date().toISOString(),
        },
        formulaVersion: 1,
        warnings: [],
        errors: [`Unknown experiment type: ${experiment.type}`],
      };
    }
  }
}

export const EXPERIMENT_DEFINITIONS: Record<string, ExperimentDefinition> = {
  moisture: {
    id: 'exp_moisture',
    title: 'Kadar Air',
    type: 'moisture',
    theory: 'Kadar air adalah persentase kandungan air suatu bahan yang dapat dinyatakan berdasarkan berat basah (wet basis) atau berdasarkan berat kering (dry basis).',
    objective: 'Menentukan kadar air dalam sampel makanan.',
    equipment: ['Oven', 'Cawan Porselin', 'Desikator', 'Neraca Analitik'],
    materials: ['Sampel Makanan'],
    procedure: ['Panaskan cawan kosong', 'Timbang sampel', 'Oven sampel', 'Timbang hasil'],
    inputFields: [
      { key: 'w0', label: 'Berat cawan kosong', unit: 'g', required: true, validation: { min: 0 } },
      { key: 'w1', label: 'Berat cawan + sampel awal', unit: 'g', required: true, validation: { min: 0 } },
      { key: 'w2', label: 'Berat cawan + sampel akhir', unit: 'g', required: true, validation: { min: 0 } }
    ],
    calculationType: 'moisture'
  },
  ash: {
    id: 'exp_ash',
    title: 'Kadar Abu',
    type: 'ash',
    theory: 'Kadar abu merupakan campuran dari komponen anorganik atau mineral yang terdapat pada suatu bahan pangan.',
    objective: 'Menentukan kadar abu dalam sampel.',
    equipment: ['Tanur', 'Cawan', 'Desikator', 'Neraca Analitik'],
    materials: ['Sampel'],
    procedure: ['Pengabuan dalam tanur', 'Penimbangan'],
    inputFields: [
      { key: 'w0', label: 'Berat cawan kosong', unit: 'g', required: true, validation: { min: 0 } },
      { key: 'w1', label: 'Berat cawan + sampel', unit: 'g', required: true, validation: { min: 0 } },
      { key: 'w2', label: 'Berat cawan + abu', unit: 'g', required: true, validation: { min: 0 } }
    ],
    calculationType: 'ash'
  },
  protein: {
    id: 'exp_protein',
    title: 'Kadar Protein',
    type: 'protein',
    theory: 'Metode Kjeldahl untuk menentukan protein.',
    objective: 'Menentukan kadar protein.',
    equipment: ['Labu Kjeldahl', 'Destilator', 'Buret'],
    materials: ['Sampel', 'H2SO4', 'NaOH'],
    procedure: ['Destruksi', 'Destilasi', 'Titrasi'],
    inputFields: [
      { key: 'v_sampel', label: 'Volume titrasi sampel', unit: 'mL', required: true, validation: { min: 0 } },
      { key: 'v_blanko', label: 'Volume titrasi blanko', unit: 'mL', required: true, validation: { min: 0 } },
      { key: 'n_hcl', label: 'Normalitas HCl', unit: 'N', required: true, validation: { min: 0 } },
      { key: 'w_sampel', label: 'Berat sampel', unit: 'g', required: true, validation: { min: 0 } }
    ],
    calculationType: 'protein'
  },
  protein_standardless: {
    id: 'exp_protein_standardless',
    title: 'Kadar Protein Tanpa Standar',
    type: 'protein_standardless',
    theory: 'Metode Kjeldahl tanpa standar.',
    objective: 'Menentukan kadar protein tanpa standar.',
    equipment: ['Labu Kjeldahl', 'Destilator', 'Buret'],
    materials: ['Sampel'],
    procedure: ['Destruksi', 'Destilasi', 'Titrasi'],
    inputFields: [],
    calculationType: 'protein_standardless'
  },
  carbohydrate: {
    id: 'exp_carbohydrate',
    title: 'Kadar Karbohidrat',
    type: 'carbohydrate',
    theory: 'Metode penentuan karbohidrat.',
    objective: 'Menentukan karbohidrat.',
    equipment: [],
    materials: [],
    procedure: [],
    inputFields: [],
    calculationType: 'carbohydrate'
  },
  standardization: {
    id: 'exp_standardization',
    title: 'Standarisasi',
    type: 'standardization',
    theory: 'Standarisasi larutan.',
    objective: 'Menentukan konsentrasi.',
    equipment: [],
    materials: [],
    procedure: [],
    inputFields: [],
    calculationType: 'standardization'
  },
  assay: {
    id: 'exp_assay',
    title: 'Assay (Kadar)',
    type: 'assay',
    theory: 'Penentuan kadar dengan titrasi.',
    objective: 'Menentukan kadar obat/senyawa.',
    equipment: [],
    materials: [],
    procedure: [],
    inputFields: [],
    calculationType: 'assay'
  }
};

export function getExperimentDefinition(type: string): ExperimentDefinition | undefined {
  return EXPERIMENT_DEFINITIONS[type];
}

export function getExperimentProgress(session: ExperimentSession): number {
  const currentIdx = EXPERIMENT_PHASES.indexOf(session.phase);
  if (currentIdx === -1) return 0;
  return Math.round(((currentIdx + 1) / EXPERIMENT_PHASES.length) * 100);
}

export function validateExperimentInputs(
  definition: ExperimentDefinition,
  inputs: Record<string, number | string | null>
): string[] {
  const errors: string[] = [];
  
  for (const field of definition.inputFields) {
    const value = inputs[field.key];
    
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field ${field.label} wajib diisi`);
      continue;
    }
    
    if (typeof value === 'number') {
      if (field.validation.min !== undefined && value < field.validation.min) {
        errors.push(`Nilai ${field.label} harus >= ${field.validation.min}`);
      }
      if (field.validation.max !== undefined && value > field.validation.max) {
        errors.push(`Nilai ${field.label} harus <= ${field.validation.max}`);
      }
      if (field.validation.allowZero === false && value === 0) {
        errors.push(`Nilai ${field.label} tidak boleh 0`);
      }
    }
  }
  
  return errors;
}
