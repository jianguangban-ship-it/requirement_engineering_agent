import type { ProjectKey } from './team'
import type { RequirementLevel } from '@/config/domain/traceability.design'
import type { TaskLevel } from '@/config/domain/traceability.task'

export interface FormState {
  projectKey: ProjectKey | ''
  issueType: '' | 'Story' | 'Task' | 'Bug'
  assignee: string
  estimatedPoints: number
  description: string
  /** Requirement/task hierarchy level (traceability) — supports both design and task mode levels */
  requirementLevel: RequirementLevel | TaskLevel
  /** Parent/source requirement ID (traceability) */
  parentReqId: string
  /** Verification method (traceability) */
  verificationMethod: string
}

export interface SummaryState {
  vehicle: string
  product: string
  layer: string
  component: string
  detail: string
}

export interface TaskTypeConfig {
  value: 'Story' | 'Task' | 'Bug'
  label: string
  color: string
  bgActive: string
}
