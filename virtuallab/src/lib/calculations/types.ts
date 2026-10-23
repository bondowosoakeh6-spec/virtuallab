// ============================================================
// CALCULATION CONTRACT (Prompt #12)
// Every calculation service MUST follow these interfaces
// ============================================================

/** Generic calculation input */
export interface CalculationInput {
  [key: string]: number | string | null;
}

/** Status of a calculation */
export type CalculationStatus = 'SUCCESS' | 'ERROR' | 'WARNING';

/** A single intermediate calculation step with formula display (Prompt #80) */
export interface CalculationStep {
  id: string;
  name: string;
  formula: string;
  formulaDisplay: string;  // e.g. "= 1.25 / 10.00 × 100"
  inputs: Record<string, number | string | null>;
  result: number | null;
  unit: string;
}

/** Calculation traceability metadata (Prompt #43) */
export interface CalculationTraceability {
  formulaId: string;
  sourceWorkbook: string;
  sourceSheet: string;
  sourceCells: string[];
  timestamp: string;
}

/** Formula version for audit trail (Prompt #44) */
export interface FormulaVersion {
  version: number;
  formulaId: string;
  formula: string;
  description: string;
  createdAt: string;
  isActive: boolean;
}

/** Unit-tagged value (Prompt #46) */
export interface UnitValue {
  value: number | null;
  unit: string;
}

/** Input field descriptor with validation (Prompt #47) */
export interface InputFieldDescriptor {
  key: string;
  label: string;
  unit: string;
  required: boolean;
  validation: {
    min?: number;
    max?: number;
    allowZero?: boolean;
  };
}

/** Standard calculation result (Prompt #12) */
export interface CalculationResult {
  calculationId: string;
  status: CalculationStatus;
  result: number | null;
  unit: string;
  formula: string;
  formulaDisplay: string;  // Full formula with substituted values (Prompt #80)
  intermediate: Record<string, UnitValue>;
  steps: CalculationStep[];
  traceability: CalculationTraceability;
  formulaVersion: number;
  warnings: string[];
  errors: string[];
}

/** Virtual Experiment structure (Prompt #28) */
export interface VirtualExperiment {
  id: string;
  title: string;
  theory: string;
  objective: string;
  equipment: string[];
  materials: string[];
  procedure: string[];
  inputFields: InputFieldDescriptor[];
  calculationType: string;
}

/** Experiment session state (Prompt #28) */
export type ExperimentPhase = 
  | 'READ_THEORY'
  | 'START_EXPERIMENT'
  | 'INPUT_DATA'
  | 'RUN_CALCULATION'
  | 'REVIEW_CALCULATION'
  | 'SAVE_SESSION'
  | 'SUBMITTED'
  | 'INSTRUCTOR_REVIEW'
  | 'GRADED'
  | 'FEEDBACK';

export interface CalculationTraceabilityFull extends CalculationTraceability {
  inputs: Record<string, number | string | null>;
  intermediate: Record<string, UnitValue>;
  result: number | null;
}

export interface GradeBreakdown {
  pre_test: number;
  practical: number;
  calculation: number;
  report: number;
  post_test: number;
}

export interface ExperimentReport {
  id: string;
  experimentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
  gradeBreakdown: GradeBreakdown;
  finalGrade: number;
}

export interface ExperimentSubmissionReview {
  submissionId: string;
  experimentId: string;
  studentId: string;
  sessionData: any;
  traceability: CalculationTraceabilityFull;
  report: ExperimentReport;
  reviewerNotes: string;
  reviewedAt: string;
}
