import type { ProjectKey } from './team'

export interface FormState {
  projectKey: ProjectKey
  issueType: 'Story' | 'Task' | 'Bug'
  assignee: string
  estimatedPoints: number
  description: string
  /** Requirement hierarchy level (traceability) */
  requirementLevel: import('@/config/domain/traceability').RequirementLevel
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
