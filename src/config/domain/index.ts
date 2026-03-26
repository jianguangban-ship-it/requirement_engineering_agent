import type { UserRole } from '@/composables/useRole'
import { getTermsForRole } from './vocabulary'
import { getRulesForRole } from './standards'

export { DOMAIN_VOCABULARY, getTermsForRole } from './vocabulary'
export type { DomainTerm } from './vocabulary'
export { STANDARD_RULES, getRulesForRole } from './standards'
export type { StandardRule } from './standards'
export { getAspiceProfile } from './aspice'
export type { AspiceProfile, AspiceMapping, AspiceSuggestion } from './aspice'
export { checkIncoseRules, incoseScorePenalty } from './incose.design'
export type { IncoseViolation, IncoseRuleId } from './incose.design'
export { getElicitationSet, buildElicitationPrompt } from './elicitation.design'
export type { ElicitationQuestion, ElicitationSet } from './elicitation.design'
export { detectAssumptions } from './assumptions'
export type { Assumption } from './assumptions'
export { buildConflictCheckPrompt } from './conflicts'
export {
  REQUIREMENT_LEVELS, getDefaultLevel, getLevelsForRole, getLevelDef,
  getValidParentLevels, checkTraceabilityGaps, buildTraceabilityContext
} from './traceability.design'
export type { RequirementLevel, RequirementLevelDef, TraceabilityGap } from './traceability.design'
export { buildTraceSuggestPrompt } from './trace-suggest'
export { buildImpactAnalysisPrompt } from './trace-impact'
export { REVIEW_PERSPECTIVES, buildDeepReviewPrompt } from './review-perspectives'
export type { ReviewPerspective } from './review-perspectives'
export { REVIEW_STEPS, getReviewChecklist } from './review-workflow.design'
export type { ReviewStatus, ReviewStep, ChecklistItem } from './review-workflow.design'

/**
 * Build domain context string to inject into LLM system prompts.
 * Includes relevant vocabulary and standard rules for the active role.
 */
export function buildDomainContext(role: UserRole, lang: 'zh' | 'en'): string {
  const terms = getTermsForRole(role)
  const rules = getRulesForRole(role)

  const lines: string[] = []

  if (lang === 'zh') {
    lines.push('## 领域知识')
    lines.push('')
    lines.push('### 关键术语')
    for (const t of terms) {
      lines.push(`- **${t.term}**${t.abbr && t.abbr !== t.term ? ` (${t.abbr})` : ''}: ${t.descZh}`)
    }
    lines.push('')
    lines.push('### 适用标准')
    for (const r of rules) {
      lines.push(`#### ${r.standard} — ${r.titleZh}`)
      for (const rule of r.rulesZh) {
        lines.push(`- ${rule}`)
      }
    }
  } else {
    lines.push('## Domain Knowledge')
    lines.push('')
    lines.push('### Key Terms')
    for (const t of terms) {
      lines.push(`- **${t.term}**${t.abbr && t.abbr !== t.term ? ` (${t.abbr})` : ''}: ${t.descEn}`)
    }
    lines.push('')
    lines.push('### Applicable Standards')
    for (const r of rules) {
      lines.push(`#### ${r.standard} — ${r.titleEn}`)
      for (const rule of r.rulesEn) {
        lines.push(`- ${rule}`)
      }
    }
  }

  return lines.join('\n')
}

// ─── Domain validation warnings ──────────────────────────────────────────────

export interface DomainWarning {
  id: string
  messageEn: string
  messageZh: string
  severity: 'info' | 'warning'
}

interface WarningRule {
  id: string
  roles: UserRole[]
  /** Returns true if the warning should fire */
  check: (description: string, issueType: string) => boolean
  messageEn: string
  messageZh: string
  severity: 'info' | 'warning'
}

const ASIL_PATTERN = /\b(ASIL[\s\-_]?[A-D]|QM)\b/i
const SAFETY_KEYWORDS = /\b(safety|safe|ASIL|hazard|fault|fail-?safe|安全|危害|故障|失效)\b/i
const VERIFY_METHOD = /\b(test|analysis|review|simulation|demonstration|HIL|SIL|MIL|测试|分析|评审|仿真|演示)\b/i
const TRACE_PATTERN = /\b(REQ[-_]?\d|parent|source|trace|derived|上级需求|父需求|追溯|来源)\b/i
const INTERFACE_KEYWORDS = /\b(CAN|LIN|SPI|I2C|UART|Ethernet|pin|signal|interface|接口|信号|引脚)\b/i
const THERMAL_KEYWORDS = /\b(thermal|temperature|heat|dissipation|cooling|热|温度|散热|冷却)\b/i
const IP_RATING = /\b(IP\s?\d{2}|IP[Xx]\d|防护等级)\b/i

const WARNING_RULES: WarningRule[] = [
  {
    id: 'missing-asil',
    roles: ['system-architect', 'hw-designer'],
    check: (desc, _type) => SAFETY_KEYWORDS.test(desc) && !ASIL_PATTERN.test(desc),
    messageEn: 'Safety-related content detected but no ASIL level specified (A/B/C/D or QM)',
    messageZh: '检测到安全相关内容，但未指定 ASIL 等级（A/B/C/D 或 QM）',
    severity: 'warning'
  },
  {
    id: 'missing-verify-method',
    roles: ['vv-engineer'],
    check: (desc, _type) => desc.length > 20 && !VERIFY_METHOD.test(desc),
    messageEn: 'No verification method specified (test/analysis/review/simulation/demonstration)',
    messageZh: '未指定验证方法（测试/分析/评审/仿真/演示）',
    severity: 'warning'
  },
  {
    id: 'missing-traceability',
    roles: ['system-architect', 'vv-engineer'],
    check: (desc, _type) => desc.length > 50 && !TRACE_PATTERN.test(desc),
    messageEn: 'No traceability reference found — consider linking to a parent requirement or source',
    messageZh: '未发现追溯引用 — 建议关联上级需求或来源',
    severity: 'info'
  },
  {
    id: 'missing-interface-spec',
    roles: ['hw-designer'],
    check: (desc, _type) => desc.length > 50 && INTERFACE_KEYWORDS.test(desc) && !/\b(\d+\s*(MHz|kHz|Mbps|kbps|baud|bit|ms|us|ns|V|mA))\b/i.test(desc),
    messageEn: 'Interface mentioned but no quantitative specs found (frequency, baud rate, voltage, timing)',
    messageZh: '提及接口但未发现量化规格（频率、波特率、电压、时序）',
    severity: 'info'
  },
  {
    id: 'missing-thermal',
    roles: ['me-designer'],
    check: (desc, _type) => desc.length > 50 && !THERMAL_KEYWORDS.test(desc) && !IP_RATING.test(desc),
    messageEn: 'Consider specifying thermal requirements or IP protection rating',
    messageZh: '建议补充热管理需求或 IP 防护等级',
    severity: 'info'
  }
]

/** Run domain-specific validation checks on the description */
export function checkDomainWarnings(
  role: UserRole,
  description: string,
  issueType: string
): DomainWarning[] {
  const desc = description.trim()
  if (!desc) return []

  return WARNING_RULES
    .filter(r => r.roles.includes(role) && r.check(desc, issueType))
    .map(r => ({
      id: r.id,
      messageEn: r.messageEn,
      messageZh: r.messageZh,
      severity: r.severity
    }))
}
