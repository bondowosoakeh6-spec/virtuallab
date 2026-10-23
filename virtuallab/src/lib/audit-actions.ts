/**
 * Audit Action Constants
 * Defines all trackable actions in the VirtualLab system
 * Feature #67: Audit Log
 */

export const AuditAction = {
  // Authentication
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',

  // Class Management
  CREATE_CLASS: 'CREATE_CLASS',
  JOIN_CLASS: 'JOIN_CLASS',

  // Experiment Lifecycle
  CREATE_EXPERIMENT: 'CREATE_EXPERIMENT',
  START_EXPERIMENT: 'START_EXPERIMENT',

  // Calculation & Session
  CALCULATE: 'CALCULATE',
  SAVE_SESSION: 'SAVE_SESSION',

  // Submission & Grading
  SUBMIT: 'SUBMIT',
  GRADE: 'GRADE',
  FEEDBACK: 'FEEDBACK',

  // Reports
  EXPORT_REPORT: 'EXPORT_REPORT',

  // Formula Management
  CHANGE_FORMULA: 'CHANGE_FORMULA',
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

/**
 * Entity types that can be audited
 */
export const AuditEntity = {
  USER: 'User',
  STUDENT: 'Student',
  INSTRUCTOR: 'Instructor',
  CLASS: 'Class',
  CLASS_MEMBER: 'ClassMember',
  EXPERIMENT: 'Experiment',
  EXPERIMENT_SESSION: 'ExperimentSession',
  CALCULATION: 'CalculationResult',
  SUBMISSION: 'Submission',
  GRADE: 'Grade',
  FORMULA: 'Formula',
  REPORT: 'Report',
  SESSION: 'Session',
} as const;

export type AuditEntityType = (typeof AuditEntity)[keyof typeof AuditEntity];

/**
 * Human-readable labels for audit actions (Bahasa Indonesia)
 */
export const AuditActionLabels: Record<AuditActionType, string> = {
  LOGIN: 'Masuk Sistem',
  LOGOUT: 'Keluar Sistem',
  CREATE_CLASS: 'Buat Kelas',
  JOIN_CLASS: 'Gabung Kelas',
  CREATE_EXPERIMENT: 'Buat Eksperimen',
  START_EXPERIMENT: 'Mulai Eksperimen',
  CALCULATE: 'Hitung',
  SAVE_SESSION: 'Simpan Sesi',
  SUBMIT: 'Kumpulkan Laporan',
  GRADE: 'Beri Nilai',
  FEEDBACK: 'Beri Umpan Balik',
  EXPORT_REPORT: 'Ekspor Laporan',
  CHANGE_FORMULA: 'Ubah Formula',
};

/**
 * All available audit actions as array (for filter dropdowns)
 */
export const ALL_AUDIT_ACTIONS = Object.values(AuditAction);
