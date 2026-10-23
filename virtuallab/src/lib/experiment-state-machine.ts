import { UserRole } from './auth-utils';

export enum ExperimentState {
  DRAFT = 'DRAFT',
  AVAILABLE = 'AVAILABLE',
  STARTED = 'STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_TO_SUBMIT = 'READY_TO_SUBMIT',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  RETURNED = 'RETURNED',
  RESUBMITTED = 'RESUBMITTED',
}

interface TransitionRule {
  allowedRoles: UserRole[];
  targetStates: ExperimentState[];
  condition?: (options?: any) => boolean;
}

export const TRANSITION_MAP: Record<ExperimentState, TransitionRule> = {
  [ExperimentState.DRAFT]: {
    allowedRoles: ['INSTRUCTOR', 'ADMIN'],
    targetStates: [ExperimentState.AVAILABLE],
  },
  [ExperimentState.AVAILABLE]: {
    allowedRoles: ['STUDENT'],
    targetStates: [ExperimentState.STARTED],
  },
  [ExperimentState.STARTED]: {
    allowedRoles: ['STUDENT'],
    targetStates: [ExperimentState.IN_PROGRESS],
  },
  [ExperimentState.IN_PROGRESS]: {
    allowedRoles: ['STUDENT'],
    targetStates: [ExperimentState.READY_TO_SUBMIT],
  },
  [ExperimentState.READY_TO_SUBMIT]: {
    allowedRoles: ['STUDENT'],
    targetStates: [ExperimentState.SUBMITTED],
  },
  [ExperimentState.SUBMITTED]: {
    allowedRoles: ['INSTRUCTOR', 'ADMIN'],
    targetStates: [ExperimentState.GRADED],
  },
  [ExperimentState.GRADED]: {
    allowedRoles: ['INSTRUCTOR', 'ADMIN'],
    targetStates: [ExperimentState.RETURNED],
  },
  [ExperimentState.RETURNED]: {
    allowedRoles: ['STUDENT'],
    targetStates: [ExperimentState.RESUBMITTED],
    condition: (options?: { allowResubmission?: boolean }) => {
      return !!options?.allowResubmission;
    }
  },
  [ExperimentState.RESUBMITTED]: {
    allowedRoles: ['INSTRUCTOR', 'ADMIN'],
    targetStates: [ExperimentState.GRADED],
  }
};

/**
 * Checks if a transition from current state to next state is valid for a given role
 */
export function canTransition(
  currentState: ExperimentState,
  nextState: ExperimentState,
  userRole: UserRole,
  options?: any
): boolean {
  const rule = TRANSITION_MAP[currentState];
  if (!rule) return false;

  const isRoleAllowed = rule.allowedRoles.includes(userRole) || userRole === 'ADMIN';
  const isTargetValid = rule.targetStates.includes(nextState);
  const isConditionMet = rule.condition ? rule.condition(options) : true;

  return isRoleAllowed && isTargetValid && isConditionMet;
}

/**
 * Gets an array of valid next states for a given current state and user role
 */
export function getNextStates(currentState: ExperimentState, userRole: UserRole, options?: any): ExperimentState[] {
  const rule = TRANSITION_MAP[currentState];
  if (!rule) return [];

  const isRoleAllowed = rule.allowedRoles.includes(userRole) || userRole === 'ADMIN';
  if (!isRoleAllowed) return [];
  
  if (rule.condition && !rule.condition(options)) return [];

  return rule.targetStates;
}

/**
 * Returns true if the student cannot modify the submission in the current state
 */
export function isStudentLocked(state: ExperimentState): boolean {
  return [
    ExperimentState.SUBMITTED,
    ExperimentState.GRADED,
    ExperimentState.RESUBMITTED
  ].includes(state);
}

export interface TransitionResult {
  success: boolean;
  timestamp: string;
  state: ExperimentState;
  error?: string;
}

export interface TransitionHistoryEntry {
  fromState: ExperimentState;
  toState: ExperimentState;
  userRole: UserRole;
  timestamp: string;
  notes?: string;
}

export function performTransition(
  currentState: ExperimentState,
  nextState: ExperimentState,
  userRole: UserRole,
  options?: any
): TransitionResult {
  if (canTransition(currentState, nextState, userRole, options)) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      state: nextState
    };
  }
  return {
    success: false,
    timestamp: new Date().toISOString(),
    state: currentState,
    error: 'Invalid transition'
  };
}

export function getStateLabel(state: ExperimentState): string {
  const labels: Record<ExperimentState, string> = {
    [ExperimentState.DRAFT]: 'Draf',
    [ExperimentState.AVAILABLE]: 'Tersedia',
    [ExperimentState.STARTED]: 'Dimulai',
    [ExperimentState.IN_PROGRESS]: 'Dalam Proses',
    [ExperimentState.READY_TO_SUBMIT]: 'Siap Dikumpulkan',
    [ExperimentState.SUBMITTED]: 'Terkumpul',
    [ExperimentState.GRADED]: 'Dinilai',
    [ExperimentState.RETURNED]: 'Dikembalikan',
    [ExperimentState.RESUBMITTED]: 'Dikumpulkan Ulang',
  };
  return labels[state] || state;
}

export function getStateColor(state: ExperimentState): string {
  const colors: Record<ExperimentState, string> = {
    [ExperimentState.DRAFT]: 'bg-gray-100 text-gray-800',
    [ExperimentState.AVAILABLE]: 'bg-blue-100 text-blue-800',
    [ExperimentState.STARTED]: 'bg-indigo-100 text-indigo-800',
    [ExperimentState.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
    [ExperimentState.READY_TO_SUBMIT]: 'bg-orange-100 text-orange-800',
    [ExperimentState.SUBMITTED]: 'bg-purple-100 text-purple-800',
    [ExperimentState.GRADED]: 'bg-green-100 text-green-800',
    [ExperimentState.RETURNED]: 'bg-red-100 text-red-800',
    [ExperimentState.RESUBMITTED]: 'bg-purple-100 text-purple-800',
  };
  return colors[state] || 'bg-gray-100 text-gray-800';
}

export function getProgressPercentage(state: ExperimentState): number {
  const progress: Record<ExperimentState, number> = {
    [ExperimentState.DRAFT]: 0,
    [ExperimentState.AVAILABLE]: 0,
    [ExperimentState.STARTED]: 10,
    [ExperimentState.IN_PROGRESS]: 50,
    [ExperimentState.READY_TO_SUBMIT]: 90,
    [ExperimentState.SUBMITTED]: 100,
    [ExperimentState.GRADED]: 100,
    [ExperimentState.RETURNED]: 100,
    [ExperimentState.RESUBMITTED]: 100,
  };
  return progress[state] || 0;
}
