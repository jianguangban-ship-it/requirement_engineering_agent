import type { UserRole } from '@/composables/useRole'
import type { ReviewStatus, ReviewStep, ChecklistItem } from './types'

export type { ReviewStatus, ReviewStep, ChecklistItem } from './types'

export const REVIEW_STEPS: ReviewStep[] = [
  { id: 'draft',         labelEn: 'Draft',         labelZh: '草稿',      iconColor: 'var(--text-muted)' },
  { id: 'ai-reviewed',   labelEn: 'AI Reviewed',   labelZh: 'AI 审核',   iconColor: 'var(--accent-purple)' },
  { id: 'peer-reviewed', labelEn: 'Peer Reviewed',  labelZh: '同行评审',  iconColor: 'var(--accent-blue)' },
  { id: 'approved',      labelEn: 'Approved',      labelZh: '已批准',    iconColor: 'var(--accent-green)' },
  { id: 'jira-created',  labelEn: 'JIRA Created',  labelZh: '已创建',    iconColor: 'var(--accent-green)' }
]

export function getReviewChecklist(reviewerRole: UserRole): ChecklistItem[] {
  const common: ChecklistItem[] = [
    { id: 'ac-defined',    labelEn: 'Acceptance criteria defined',        labelZh: '验收标准已定义' },
    { id: 'effort-est',    labelEn: 'Effort estimated (points/hours)',    labelZh: '工作量已估算（点数/工时）' },
    { id: 'no-tbd',        labelEn: 'No TBD/TBC items remaining',        labelZh: '无未决 TBD/TBC 项' }
  ]

  switch (reviewerRole) {
    case 'system-architect':
      return [
        ...common,
        { id: 'sys-deps',      labelEn: 'Cross-team dependencies identified',  labelZh: '跨团队依赖已识别' },
        { id: 'sys-scope',     labelEn: 'Affected subsystems listed',          labelZh: '受影响子系统已列出' }
      ]
    case 'sw-developer':
      return [
        ...common,
        { id: 'sw-modules',    labelEn: 'Modules/files to change identified',  labelZh: '待修改模块/文件已识别' },
        { id: 'sw-test',       labelEn: 'Unit test approach noted',            labelZh: '单元测试方案已记录' }
      ]
    case 'hw-designer':
      return [
        ...common,
        { id: 'hw-component',  labelEn: 'Component/board identified',          labelZh: '器件/板卡已确认' },
        { id: 'hw-schematic',  labelEn: 'Schematic impact assessed',           labelZh: '原理图影响已评估' }
      ]
    case 'me-designer':
      return [
        ...common,
        { id: 'me-assembly',   labelEn: 'Assembly/packaging impact noted',     labelZh: '装配/包装影响已记录' },
        { id: 'me-tooling',    labelEn: 'Tooling implications assessed',       labelZh: '工装影响已评估' }
      ]
    case 'vv-engineer':
      return [
        ...common,
        { id: 'vv-scope',      labelEn: 'Test scope defined',                  labelZh: '测试范围已定义' },
        { id: 'vv-env',        labelEn: 'Test environment identified',         labelZh: '测试环境已确认' }
      ]
    default:
      return common
  }
}
