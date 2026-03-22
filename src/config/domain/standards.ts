import type { UserRole } from '@/composables/useRole'

/**
 * Automotive engineering standards — structured rules for LLM context.
 * Key standards: ISO 26262, ASPICE, ISO 21448 (SOTIF), ISO 21434 (Cybersecurity).
 */

export interface StandardRule {
  id: string
  standard: string
  titleEn: string
  titleZh: string
  rulesEn: string[]
  rulesZh: string[]
  roles: UserRole[]
}

export const STANDARD_RULES: StandardRule[] = [
  // ─── ISO 26262 (Functional Safety) ──────────────────────────────────────────
  {
    id: 'iso26262-asil',
    standard: 'ISO 26262',
    titleEn: 'ASIL Classification',
    titleZh: 'ASIL 分级',
    rulesEn: [
      'Every safety-relevant requirement MUST have an ASIL level (A/B/C/D) or QM',
      'ASIL decomposition between HW and SW must be explicitly documented',
      'Safety goals must trace to HARA results'
    ],
    rulesZh: [
      '每个安全相关需求必须标注 ASIL 等级（A/B/C/D）或 QM',
      '硬件和软件间的 ASIL 分解必须明确记录',
      '安全目标必须追溯到 HARA 结果'
    ],
    roles: ['system-architect', 'sw-developer', 'hw-designer', 'vv-engineer']
  },
  {
    id: 'iso26262-req',
    standard: 'ISO 26262',
    titleEn: 'Safety Requirement Properties',
    titleZh: '安全需求属性',
    rulesEn: [
      'Safety requirements must be verifiable with defined pass/fail criteria',
      'Each requirement must state its verification method (test, analysis, review, or simulation)',
      'Fault detection and reaction time must be specified for safety mechanisms'
    ],
    rulesZh: [
      '安全需求必须可验证，并定义通过/失败标准',
      '每条需求必须说明验证方法（测试、分析、评审或仿真）',
      '安全机制的故障检测和反应时间必须明确'
    ],
    roles: ['system-architect', 'sw-developer', 'vv-engineer']
  },
  {
    id: 'iso26262-hw',
    standard: 'ISO 26262',
    titleEn: 'HW Safety Requirements',
    titleZh: '硬件安全需求',
    rulesEn: [
      'HW diagnostic coverage must meet the target ASIL metrics (SPFM, LFM)',
      'HW architectural metrics must be calculated and documented',
      'Dependent failure analysis (DFA) must be performed'
    ],
    rulesZh: [
      '硬件诊断覆盖率必须满足目标 ASIL 指标（SPFM、LFM）',
      '必须计算和记录硬件架构指标',
      '必须执行相关故障分析（DFA）'
    ],
    roles: ['hw-designer', 'vv-engineer']
  },
  // ─── ASPICE (Process) ───────────────────────────────────────────────────────
  {
    id: 'aspice-req',
    standard: 'ASPICE',
    titleEn: 'Requirement Engineering',
    titleZh: '需求工程',
    rulesEn: [
      'Requirements must be uniquely identified and version-controlled',
      'Bidirectional traceability between levels (stakeholder → system → SW/HW)',
      'Impact analysis must be performed for every requirement change'
    ],
    rulesZh: [
      '需求必须唯一标识并进行版本控制',
      '各层级之间必须双向追溯（利益相关方 → 系统 → 软件/硬件）',
      '每次需求变更必须进行影响分析'
    ],
    roles: ['system-architect', 'sw-developer', 'hw-designer']
  },
  {
    id: 'aspice-verify',
    standard: 'ASPICE',
    titleEn: 'Verification & Validation',
    titleZh: '验证与确认',
    rulesEn: [
      'Test cases must trace to specific requirements',
      'Test results must be documented with pass/fail status',
      'Regression testing must be performed after changes'
    ],
    rulesZh: [
      '测试用例必须追溯到具体需求',
      '测试结果必须记录通过/失败状态',
      '变更后必须执行回归测试'
    ],
    roles: ['sw-developer', 'vv-engineer']
  },
  // ─── ISO 21448 (SOTIF) ─────────────────────────────────────────────────────
  {
    id: 'sotif',
    standard: 'ISO 21448',
    titleEn: 'SOTIF Requirements',
    titleZh: 'SOTIF 需求',
    rulesEn: [
      'Known and unknown unsafe scenarios must be identified',
      'Triggering conditions and functional insufficiencies must be analyzed',
      'Acceptance criteria must address edge cases and degraded performance'
    ],
    rulesZh: [
      '必须识别已知和未知的不安全场景',
      '必须分析触发条件和功能不足',
      '验收标准必须涵盖边界情况和降级性能'
    ],
    roles: ['system-architect', 'sw-developer', 'vv-engineer']
  },
  // ─── ISO 21434 (Cybersecurity) ──────────────────────────────────────────────
  {
    id: 'iso21434',
    standard: 'ISO 21434',
    titleEn: 'Cybersecurity Requirements',
    titleZh: '网络安全需求',
    rulesEn: [
      'Threat Analysis and Risk Assessment (TARA) must be referenced',
      'Cybersecurity goals must be derived from TARA results',
      'Secure communication requirements must specify authentication and encryption'
    ],
    rulesZh: [
      '必须引用威胁分析和风险评估（TARA）',
      '网络安全目标必须源自 TARA 结果',
      '安全通信需求必须指定认证和加密方式'
    ],
    roles: ['system-architect', 'sw-developer']
  }
]

/** Get standard rules relevant to a specific role */
export function getRulesForRole(role: UserRole): StandardRule[] {
  return STANDARD_RULES.filter(r => r.roles.includes(role))
}
