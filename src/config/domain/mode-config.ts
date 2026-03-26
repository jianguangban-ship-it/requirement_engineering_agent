import type { AppMode } from '@/composables/useAppMode'
import type { UserRole } from '@/composables/useRole'
import type { QualityViolation, ElicitationSet, ReviewStep, ChecklistItem, TraceabilityGap } from './types'

// Design imports
import { getElicitationSet as getDesignElicitation, buildElicitationPrompt as buildDesignElicitationPrompt } from './elicitation.design'
import { checkIncoseRules, incoseScorePenalty } from './incose.design'
import { getReviewChecklist as getDesignChecklist, REVIEW_STEPS as DESIGN_REVIEW_STEPS } from './review-workflow.design'
import { checkTraceabilityGaps as checkDesignTraceGaps, buildTraceabilityContext as buildDesignTraceCtx } from './traceability.design'
import type { RequirementLevel } from './traceability.design'

// Task imports
import { getTaskScopingSet, buildTaskScopingPrompt } from './elicitation.task'
import { checkTaskQuality, taskQualityPenalty } from './quality.task'
import { getReviewChecklist as getTaskChecklist, REVIEW_STEPS as TASK_REVIEW_STEPS } from './review-workflow.task'
import { checkTaskDependencyGaps, buildTaskDependencyContext } from './traceability.task'
import type { TaskLevel } from './traceability.task'

// ── Resolvers ───────────────────────────────────────────────────────────────

/** Resolve mode — explore falls back to design */
function resolveMode(mode: AppMode): 'design' | 'task' {
  return mode === 'task' ? 'task' : 'design'
}

export function getModeElicitationSet(mode: AppMode, role: UserRole, lang: 'zh' | 'en'): ElicitationSet {
  return resolveMode(mode) === 'task'
    ? getTaskScopingSet(role, lang)
    : getDesignElicitation(role, lang)
}

export function getModeElicitationPrompt(mode: AppMode, role: UserRole, lang: 'zh' | 'en'): string {
  return resolveMode(mode) === 'task'
    ? buildTaskScopingPrompt(role, lang)
    : buildDesignElicitationPrompt(role, lang)
}

export function getModeQualityCheck(mode: AppMode, description: string): QualityViolation[] {
  return resolveMode(mode) === 'task'
    ? checkTaskQuality(description)
    : checkIncoseRules(description)
}

export function getModeQualityPenalty(mode: AppMode, violations: QualityViolation[]): number {
  return resolveMode(mode) === 'task'
    ? taskQualityPenalty(violations)
    : incoseScorePenalty(violations)
}

export function getModeReviewSteps(mode: AppMode): ReviewStep[] {
  return resolveMode(mode) === 'task' ? TASK_REVIEW_STEPS : DESIGN_REVIEW_STEPS
}

export function getModeReviewChecklist(mode: AppMode, role: UserRole): ChecklistItem[] {
  return resolveMode(mode) === 'task'
    ? getTaskChecklist(role)
    : getDesignChecklist(role)
}

export function getModeTraceGaps(
  mode: AppMode,
  level: RequirementLevel | TaskLevel,
  parentId: string,
  verificationMethod?: string
): TraceabilityGap[] {
  if (resolveMode(mode) === 'task') {
    return checkTaskDependencyGaps(level as TaskLevel, parentId)
  }
  return checkDesignTraceGaps(level as RequirementLevel, parentId, verificationMethod ?? '')
}

export function getModeTraceContext(
  mode: AppMode,
  level: RequirementLevel | TaskLevel,
  parentId: string,
  lang: 'zh' | 'en'
): string {
  if (resolveMode(mode) === 'task') {
    return buildTaskDependencyContext(level as TaskLevel, parentId, lang)
  }
  return buildDesignTraceCtx(level as RequirementLevel, parentId, lang)
}
