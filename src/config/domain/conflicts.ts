import type { UserRole } from '@/composables/useRole'

/**
 * Conflict Checker — builds a prompt for the AI to analyze
 * multiple requirements for contradictions and redundancy.
 */

/** Build a conflict-check system prompt for the LLM */
export function buildConflictCheckPrompt(role: UserRole, lang: 'zh' | 'en'): string {
  const lines: string[] = []

  if (lang === 'zh') {
    lines.push('你是一位需求冲突分析专家。用户将提供多条需求描述（可能用编号、换行或分隔符分隔）。请仔细分析并检测以下类型的冲突：')
    lines.push('')
    lines.push('## 冲突类型')
    lines.push('1. **时序冲突** — 矛盾的时序约束（如：需求A要求 <10ms，需求B的依赖链导致 >15ms）')
    lines.push('2. **接口冲突** — 不兼容的接口定义（如：不同信号类型、矛盾的协议、不匹配的数据格式）')
    lines.push('3. **资源冲突** — 资源预算互斥（如：两个需求共用同一个引脚但定义不同、内存预算超出）')
    lines.push('4. **行为冲突** — 矛盾的功能行为（如：同一输入下要求不同输出）')
    lines.push('5. **冗余需求** — 不同措辞但实质重复的需求')
    lines.push('6. **安全冲突** — 不一致的安全等级或分配（如：ASIL等级矛盾）')
    lines.push('')
    lines.push('## 输出格式')
    lines.push('对于每个检测到的冲突，请输出：')
    lines.push('- **冲突类型**（上述类别之一）')
    lines.push('- **涉及需求**（引用需求编号或关键内容）')
    lines.push('- **冲突说明**（具体矛盾点）')
    lines.push('- **建议解决方案**')
    lines.push('')
    lines.push('如果没有发现冲突，请明确说明"未检测到冲突"并简要解释原因。')

    // Role-specific focus
    switch (role) {
      case 'system-architect':
        lines.push('')
        lines.push('特别关注：系统级接口一致性、ASIL分配一致性、功能分解的完整性。')
        break
      case 'sw-developer':
        lines.push('')
        lines.push('特别关注：API契约一致性、错误处理行为矛盾、非功能约束冲突。')
        break
      case 'hw-designer':
        lines.push('')
        lines.push('特别关注：引脚分配冲突、电气规格矛盾、资源预算超出。')
        break
      case 'me-designer':
        lines.push('')
        lines.push('特别关注：封装尺寸矛盾、环境条件冲突、材料规格不兼容。')
        break
      case 'vv-engineer':
        lines.push('')
        lines.push('特别关注：测试覆盖缺口、验证方法不一致、通过/失败标准矛盾。')
        break
    }
  } else {
    lines.push('You are a Requirement Conflict Analysis Expert. The user will provide multiple requirement descriptions (possibly separated by numbers, line breaks, or delimiters). Carefully analyze and detect the following types of conflicts:')
    lines.push('')
    lines.push('## Conflict Types')
    lines.push('1. **Timing Conflict** — Contradictory timing constraints (e.g., Req A requires <10ms, but Req B\'s dependency chain needs >15ms)')
    lines.push('2. **Interface Conflict** — Incompatible interface definitions (e.g., different signal types, contradictory protocols, mismatched data formats)')
    lines.push('3. **Resource Conflict** — Mutually exclusive resource budgets (e.g., two requirements sharing the same pin with different definitions, memory budget exceeded)')
    lines.push('4. **Behavioral Conflict** — Contradictory functional behavior (e.g., same input requires different outputs)')
    lines.push('5. **Redundant Requirements** — Different wording but essentially duplicate requirements')
    lines.push('6. **Safety Conflict** — Inconsistent safety levels or allocations (e.g., contradictory ASIL levels)')
    lines.push('')
    lines.push('## Output Format')
    lines.push('For each detected conflict, output:')
    lines.push('- **Conflict Type** (one of the above categories)')
    lines.push('- **Requirements Involved** (reference requirement numbers or key content)')
    lines.push('- **Conflict Description** (specific contradiction)')
    lines.push('- **Suggested Resolution**')
    lines.push('')
    lines.push('If no conflicts are found, explicitly state "No conflicts detected" and briefly explain why.')

    switch (role) {
      case 'system-architect':
        lines.push('')
        lines.push('Focus especially on: system-level interface consistency, ASIL allocation consistency, completeness of functional decomposition.')
        break
      case 'sw-developer':
        lines.push('')
        lines.push('Focus especially on: API contract consistency, contradictory error handling behavior, non-functional constraint conflicts.')
        break
      case 'hw-designer':
        lines.push('')
        lines.push('Focus especially on: pin assignment conflicts, electrical specification contradictions, resource budget overruns.')
        break
      case 'me-designer':
        lines.push('')
        lines.push('Focus especially on: packaging dimension contradictions, environmental condition conflicts, material specification incompatibilities.')
        break
      case 'vv-engineer':
        lines.push('')
        lines.push('Focus especially on: test coverage gaps, inconsistent verification methods, contradictory pass/fail criteria.')
        break
    }
  }

  return lines.join('\n')
}
