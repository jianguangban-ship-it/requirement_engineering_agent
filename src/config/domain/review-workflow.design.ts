import type { UserRole } from '@/composables/useRole'
import type { ReviewStatus, ReviewStep, ChecklistItem } from './types'

export type { ReviewStatus, ReviewStep, ChecklistItem } from './types'

/**
 * Cross-Team Review Workflow — status tracking and role-specific checklists.
 *
 * Workflow: Draft → AI Reviewed → Peer Reviewed → Approved → JIRA Created
 */

export const REVIEW_STEPS: ReviewStep[] = [
  { id: 'draft',         labelEn: 'Draft',         labelZh: '草稿',      iconColor: 'var(--text-muted)' },
  { id: 'ai-reviewed',   labelEn: 'AI Reviewed',   labelZh: 'AI 审核',   iconColor: 'var(--accent-purple)' },
  { id: 'peer-reviewed', labelEn: 'Peer Reviewed',  labelZh: '同行评审',  iconColor: 'var(--accent-blue)' },
  { id: 'approved',      labelEn: 'Approved',      labelZh: '已批准',    iconColor: 'var(--accent-green)' },
  { id: 'jira-created',  labelEn: 'JIRA Created',  labelZh: '已创建',    iconColor: 'var(--accent-green)' }
]

/** Role-specific review checklist — the reviewer checks these before approving */
export function getReviewChecklist(reviewerRole: UserRole): ChecklistItem[] {
  const common: ChecklistItem[] = [
    { id: 'no-tbd',       labelEn: 'No TBD/TBC items remaining',       labelZh: '无未决 TBD/TBC 项' },
    { id: 'traceable',    labelEn: 'Requirement is traceable (parent linked)', labelZh: '需求可追溯（已关联上级）' },
    { id: 'unambiguous',  labelEn: 'Description is clear and unambiguous',     labelZh: '描述清晰、无歧义' }
  ]

  switch (reviewerRole) {
    case 'system-architect':
      return [
        ...common,
        { id: 'sys-decomposed', labelEn: 'System req decomposed to SW/HW/ME', labelZh: '系统需求已分解到SW/HW/ME' },
        { id: 'sys-safety',     labelEn: 'Safety concept coverage verified',   labelZh: '安全概念覆盖已验证' },
        { id: 'sys-interface',  labelEn: 'Interface definitions complete',     labelZh: '接口定义完整' }
      ]
    case 'sw-developer':
      return [
        ...common,
        { id: 'sw-feasible',    labelEn: 'Implementation is technically feasible', labelZh: '技术上可实现' },
        { id: 'sw-resource',    labelEn: 'CPU/RAM budget is sufficient',           labelZh: 'CPU/RAM 预算充足' },
        { id: 'sw-testable',    labelEn: 'Unit/integration test approach defined', labelZh: '单元/集成测试方案已定义' }
      ]
    case 'hw-designer':
      return [
        ...common,
        { id: 'hw-feasible',    labelEn: 'Hardware implementation feasible',    labelZh: '硬件实现可行' },
        { id: 'hw-component',   labelEn: 'Component availability verified',    labelZh: '器件可获取性已确认' },
        { id: 'hw-emc',         labelEn: 'EMC/thermal constraints addressed',  labelZh: 'EMC/热约束已处理' }
      ]
    case 'me-designer':
      return [
        ...common,
        { id: 'me-space',       labelEn: 'Packaging space constraints met',  labelZh: '封装空间约束满足' },
        { id: 'me-material',    labelEn: 'Material and process selected',    labelZh: '材料和工艺已选定' },
        { id: 'me-ip',          labelEn: 'IP rating requirement addressed',  labelZh: 'IP 防护等级已处理' }
      ]
    case 'vv-engineer':
      return [
        ...common,
        { id: 'vv-testable',    labelEn: 'Requirement is verifiable',               labelZh: '需求可验证' },
        { id: 'vv-criteria',    labelEn: 'Pass/fail criteria are quantitative',      labelZh: '通过/失败标准可量化' },
        { id: 'vv-environment', labelEn: 'Test environment requirements identified', labelZh: '测试环境需求已确认' }
      ]
    default:
      return common
  }
}
