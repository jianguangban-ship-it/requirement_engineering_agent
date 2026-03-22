import type { UserRole } from '@/composables/useRole'

/**
 * Multi-Perspective Review — defines 4 review viewpoints
 * and builds a combined system prompt for deep analysis.
 */

export interface ReviewPerspective {
  id: string
  labelEn: string
  labelZh: string
  iconColor: string
}

export const REVIEW_PERSPECTIVES: ReviewPerspective[] = [
  { id: 'safety',          labelEn: 'Safety',          labelZh: '安全性',    iconColor: 'var(--accent-red)' },
  { id: 'testability',     labelEn: 'Testability',     labelZh: '可测试性',  iconColor: 'var(--accent-purple)' },
  { id: 'implementability', labelEn: 'Implementability', labelZh: '可实现性', iconColor: 'var(--accent-blue)' },
  { id: 'completeness',    labelEn: 'Completeness',    labelZh: '完整性',    iconColor: 'var(--accent-green)' }
]

/** Build a multi-perspective system prompt for Deep Review */
export function buildDeepReviewPrompt(role: UserRole, lang: 'zh' | 'en'): string {
  const lines: string[] = []

  if (lang === 'zh') {
    lines.push('你是一位多视角需求审查专家。请从以下 **四个维度** 逐一分析该需求，每个维度作为独立章节输出。')
    lines.push('')
    lines.push('**输出格式要求**：请严格使用以下四个二级标题，每个标题下给出详细分析：')
    lines.push('')

    // Safety
    lines.push('## 🛡️ 安全性分析')
    lines.push('分析要点：')
    lines.push('- ISO 26262 功能安全合规性')
    lines.push('- ASIL 等级一致性（是否与上下游需求匹配）')
    lines.push('- 安全目标覆盖（是否遗漏安全场景）')
    lines.push('- 故障模式（FMEA/FTA 是否需要更新）')
    _appendRoleSafetyZh(lines, role)
    lines.push('')

    // Testability
    lines.push('## 🧪 可测试性分析')
    lines.push('分析要点：')
    lines.push('- V&V 团队能否为此编写明确的测试用例？')
    lines.push('- 验收标准是否可量化、可观测？')
    lines.push('- 是否需要特殊测试环境（HIL/SIL/MIL）？')
    lines.push('- 是否包含模糊词汇导致测试无法判定通过/失败？')
    lines.push('')

    // Implementability
    lines.push('## ⚙️ 可实现性分析')
    lines.push('分析要点：')
    lines.push('- 该需求对SW/HW/ME团队是否技术可行？')
    lines.push('- 是否存在隐含的性能约束或资源限制？')
    lines.push('- 是否需要新增接口或修改现有架构？')
    lines.push('- 工作量估算是否合理（故事点参考）？')
    _appendRoleImplZh(lines, role)
    lines.push('')

    // Completeness
    lines.push('## 📋 完整性分析')
    lines.push('分析要点：')
    lines.push('- 是否存在未定义的术语或缩写？')
    lines.push('- 是否包含 TBD/TBC 待决项？')
    lines.push('- 是否缺少前置条件、触发条件或异常处理？')
    lines.push('- 接口定义是否完整（信号名、参数、单位、范围）？')
    lines.push('- 追溯链是否完整（上级需求、下游产物）？')
    lines.push('')

    // Summary
    lines.push('最后请输出一个总结表格：')
    lines.push('| 维度 | 评级 | 关键发现 | 建议动作 |')
    lines.push('|------|------|---------|---------|')
    lines.push('评级使用：✅ 通过 / ⚠️ 需改进 / ❌ 严重问题')

  } else {
    lines.push('You are a Multi-Perspective Requirement Review Expert. Analyze the requirement from **four distinct viewpoints**, each as a separate section.')
    lines.push('')
    lines.push('**Output format**: Use exactly these four H2 headings, with detailed analysis under each:')
    lines.push('')

    // Safety
    lines.push('## 🛡️ Safety Analysis')
    lines.push('Analyze:')
    lines.push('- ISO 26262 functional safety compliance')
    lines.push('- ASIL level consistency (alignment with upstream/downstream requirements)')
    lines.push('- Safety goal coverage (any missing safety scenarios)')
    lines.push('- Fault modes (do FMEA/FTA need updating?)')
    _appendRoleSafetyEn(lines, role)
    lines.push('')

    // Testability
    lines.push('## 🧪 Testability Analysis')
    lines.push('Analyze:')
    lines.push('- Can V&V write clear test cases for this requirement?')
    lines.push('- Are acceptance criteria quantifiable and observable?')
    lines.push('- Does it require special test environments (HIL/SIL/MIL)?')
    lines.push('- Are there vague terms that make pass/fail determination impossible?')
    lines.push('')

    // Implementability
    lines.push('## ⚙️ Implementability Analysis')
    lines.push('Analyze:')
    lines.push('- Is this requirement technically feasible for SW/HW/ME teams?')
    lines.push('- Are there implicit performance constraints or resource limitations?')
    lines.push('- Does it require new interfaces or architectural changes?')
    lines.push('- Is the effort estimation (story points) reasonable?')
    _appendRoleImplEn(lines, role)
    lines.push('')

    // Completeness
    lines.push('## 📋 Completeness Analysis')
    lines.push('Analyze:')
    lines.push('- Are there undefined terms or abbreviations?')
    lines.push('- Are there TBD/TBC items?')
    lines.push('- Are preconditions, trigger conditions, or error handling missing?')
    lines.push('- Are interface definitions complete (signal names, parameters, units, ranges)?')
    lines.push('- Is the traceability chain complete (parent requirements, downstream artifacts)?')
    lines.push('')

    // Summary
    lines.push('Finally, output a summary table:')
    lines.push('| Dimension | Rating | Key Findings | Recommended Actions |')
    lines.push('|-----------|--------|--------------|-------------------|')
    lines.push('Ratings: ✅ Pass / ⚠️ Needs Improvement / ❌ Critical Issue')
  }

  return lines.join('\n')
}

// ─── Role-specific safety guidance ──────────────────────────────────────────

function _appendRoleSafetyZh(lines: string[], role: UserRole) {
  switch (role) {
    case 'system-architect':
      lines.push('- 系统安全概念是否完整？安全机制是否明确？')
      break
    case 'sw-developer':
      lines.push('- 软件安全需求是否从系统安全需求正确分解？')
      lines.push('- 是否考虑了运行时错误检测和恢复？')
      break
    case 'hw-designer':
      lines.push('- 硬件随机故障目标值是否明确？')
      lines.push('- 诊断覆盖率是否满足目标 ASIL？')
      break
    case 'me-designer':
      lines.push('- 机械防护是否满足安全需求？')
      break
    case 'vv-engineer':
      lines.push('- 安全验证方法是否覆盖所有安全需求？')
      lines.push('- 是否需要独立评估？')
      break
  }
}

function _appendRoleSafetyEn(lines: string[], role: UserRole) {
  switch (role) {
    case 'system-architect':
      lines.push('- Is the system safety concept complete? Are safety mechanisms specified?')
      break
    case 'sw-developer':
      lines.push('- Are SW safety requirements correctly derived from system safety requirements?')
      lines.push('- Is runtime error detection and recovery considered?')
      break
    case 'hw-designer':
      lines.push('- Are HW random fault targets specified?')
      lines.push('- Does diagnostic coverage meet the target ASIL?')
      break
    case 'me-designer':
      lines.push('- Does mechanical protection meet safety requirements?')
      break
    case 'vv-engineer':
      lines.push('- Do safety verification methods cover all safety requirements?')
      lines.push('- Is independent assessment needed?')
      break
  }
}

// ─── Role-specific implementability guidance ─────────────────────────────────

function _appendRoleImplZh(lines: string[], role: UserRole) {
  switch (role) {
    case 'system-architect':
      lines.push('- 系统架构是否需要重大变更？')
      break
    case 'sw-developer':
      lines.push('- 是否存在 AUTOSAR 约束或 BSW 配置限制？')
      lines.push('- CPU/RAM 资源预算是否足够？')
      break
    case 'hw-designer':
      lines.push('- PCB 面积和层数是否支持？')
      lines.push('- 关键器件是否有采购风险？')
      break
    case 'me-designer':
      lines.push('- 制造工艺是否可行？模具成本是否合理？')
      break
    case 'vv-engineer':
      lines.push('- 测试设备和环境是否具备？')
      break
  }
}

function _appendRoleImplEn(lines: string[], role: UserRole) {
  switch (role) {
    case 'system-architect':
      lines.push('- Does this require major architectural changes?')
      break
    case 'sw-developer':
      lines.push('- Are there AUTOSAR constraints or BSW configuration limitations?')
      lines.push('- Is the CPU/RAM resource budget sufficient?')
      break
    case 'hw-designer':
      lines.push('- Does the PCB area and layer count support this?')
      lines.push('- Are there procurement risks for key components?')
      break
    case 'me-designer':
      lines.push('- Is the manufacturing process feasible? Are tooling costs reasonable?')
      break
    case 'vv-engineer':
      lines.push('- Are the required test equipment and environments available?')
      break
  }
}
