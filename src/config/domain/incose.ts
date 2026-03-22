/**
 * INCOSE Requirement Quality Rules
 * Checks: Atomic, Complete, Unambiguous, Verifiable, Traceable
 */

export type IncoseRuleId = 'atomic' | 'complete' | 'unambiguous' | 'verifiable' | 'traceable'

export interface IncoseViolation {
  ruleId: IncoseRuleId
  titleEn: string
  titleZh: string
  messageEn: string
  messageZh: string
  severity: 'error' | 'warning'
  /** Matched text fragments that triggered the violation */
  matches?: string[]
}

// ─── Detection patterns ──────────────────────────────────────────────────────

// Atomic: one requirement per statement — detect "and", "or", "also", multiple "shall"
const MULTI_REQ_PATTERN = /\b(shall|must|should)\b/gi
const CONJUNCTION_SPLIT = /\b(and shall|and must|and should|or shall|or must|or should|, and also|; and|; also|shall also)\b/i

// Complete: no TBD, TBC, undefined, to be decided/confirmed/determined
const INCOMPLETE_PATTERN = /\b(TBD|TBC|TODO|FIXME|to be (decided|confirmed|determined|defined|specified|discussed)|undefined|not yet (defined|determined|specified)|待定|待确认|待讨论|待补充|未定义|未确定)\b/ig

// Unambiguous: flag vague words
const VAGUE_WORDS_EN = /\b(appropriate|adequate|sufficient|some|several|many|few|various|reasonable|normal|typical|acceptable|proper|suitable|easy|simple|fast|slow|good|bad|large|small|significant|approximately|roughly|about|etc\.?|and so on|and\/or|if possible|as needed|as appropriate|as required|user[- ]friendly|flexible|robust|efficient|effective|timely|prompt|regular|periodically|often|sometimes|rarely|usually|generally|typically|commonly|mostly|mainly|primarily)\b/ig
const VAGUE_WORDS_ZH = /(?:适当|足够|一些|若干|合理|正常|典型|可接受|合适|简单|快速|大约|大概|等等|左右|如果可能|根据需要|用户友好|灵活|高效|有效|及时|定期|经常|有时|通常|一般)/g

// Verifiable: must have measurable/testable criteria — check for numbers, units, or clear boolean conditions
const MEASURABLE_PATTERN = /\b(\d+\.?\d*\s*(ms|s|sec|min|hour|Hz|kHz|MHz|GHz|V|mV|A|mA|W|kW|%|byte|KB|MB|GB|mm|cm|m|kg|g|°C|dB|bps|kbps|Mbps|Gbps|px))\b|(?:≤|≥|<|>|==|!=|shall not exceed|within \d|at least \d|no more than|maximum|minimum|equal to)/i

// Traceable: references to parent requirements, IDs, or sources
const TRACE_REF_PATTERN = /\b(REQ[-_]?\w{2,}|SYS[-_]?\d|SWE[-_]?\d|HWE[-_]?\d|TS[-_]?\d|TC[-_]?\d|[A-Z]{2,5}-\d{2,})\b|(?:derived from|based on|traces? to|parent|source:|see |ref:|reference:|来源|追溯|父需求|上级需求|关联需求)/i

// ─── Check functions ─────────────────────────────────────────────────────────

function checkAtomic(desc: string): IncoseViolation | null {
  // Count "shall/must/should" occurrences
  const shallMatches = desc.match(MULTI_REQ_PATTERN)
  const hasConjunction = CONJUNCTION_SPLIT.test(desc)

  if (hasConjunction || (shallMatches && shallMatches.length >= 3)) {
    return {
      ruleId: 'atomic',
      titleEn: 'Atomic',
      titleZh: '原子性',
      messageEn: 'Multiple requirements detected in one statement — consider splitting into separate items',
      messageZh: '检测到单条描述中包含多个需求 — 建议拆分为独立条目',
      severity: 'warning'
    }
  }
  return null
}

function checkComplete(desc: string): IncoseViolation | null {
  const matches: string[] = []
  let m: RegExpExecArray | null
  const pattern = new RegExp(INCOMPLETE_PATTERN.source, 'ig')
  while ((m = pattern.exec(desc)) !== null) {
    if (!matches.includes(m[0])) matches.push(m[0])
  }

  if (matches.length > 0) {
    return {
      ruleId: 'complete',
      titleEn: 'Complete',
      titleZh: '完整性',
      messageEn: `Incomplete markers found: ${matches.join(', ')}`,
      messageZh: `发现未完成标记：${matches.join('、')}`,
      severity: 'error',
      matches
    }
  }
  return null
}

function checkUnambiguous(desc: string): IncoseViolation | null {
  const matches: string[] = []
  let m: RegExpExecArray | null

  const enPattern = new RegExp(VAGUE_WORDS_EN.source, 'ig')
  while ((m = enPattern.exec(desc)) !== null) {
    const lower = m[0].toLowerCase()
    if (!matches.includes(lower)) matches.push(lower)
  }

  const zhPattern = new RegExp(VAGUE_WORDS_ZH.source, 'g')
  while ((m = zhPattern.exec(desc)) !== null) {
    if (!matches.includes(m[0])) matches.push(m[0])
  }

  if (matches.length > 0) {
    const display = matches.slice(0, 5).join(', ')
    const extra = matches.length > 5 ? ` (+${matches.length - 5})` : ''
    return {
      ruleId: 'unambiguous',
      titleEn: 'Unambiguous',
      titleZh: '无歧义',
      messageEn: `Vague terms found: ${display}${extra} — use precise, measurable language`,
      messageZh: `发现模糊用语：${display}${extra} — 请使用精确、可度量的表述`,
      severity: 'warning',
      matches
    }
  }
  return null
}

function checkVerifiable(desc: string): IncoseViolation | null {
  // Only check if description is substantial enough to warrant verification criteria
  if (desc.length < 80) return null

  if (!MEASURABLE_PATTERN.test(desc)) {
    return {
      ruleId: 'verifiable',
      titleEn: 'Verifiable',
      titleZh: '可验证',
      messageEn: 'No measurable acceptance criteria found — add quantitative thresholds or clear pass/fail conditions',
      messageZh: '未发现可度量的验收标准 — 请添加量化阈值或明确的通过/失败条件',
      severity: 'warning'
    }
  }
  return null
}

function checkTraceable(desc: string): IncoseViolation | null {
  // Only flag for substantial descriptions
  if (desc.length < 100) return null

  if (!TRACE_REF_PATTERN.test(desc)) {
    return {
      ruleId: 'traceable',
      titleEn: 'Traceable',
      titleZh: '可追溯',
      messageEn: 'No requirement ID or source reference found — link to parent requirement or source document',
      messageZh: '未发现需求ID或来源引用 — 请关联上级需求或来源文档',
      severity: 'warning'
    }
  }
  return null
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Run all INCOSE quality checks on a requirement description */
export function checkIncoseRules(description: string): IncoseViolation[] {
  const desc = description.trim()
  if (!desc) return []

  const violations: IncoseViolation[] = []

  const atomic = checkAtomic(desc)
  if (atomic) violations.push(atomic)

  const complete = checkComplete(desc)
  if (complete) violations.push(complete)

  const unambiguous = checkUnambiguous(desc)
  if (unambiguous) violations.push(unambiguous)

  const verifiable = checkVerifiable(desc)
  if (verifiable) violations.push(verifiable)

  const traceable = checkTraceable(desc)
  if (traceable) violations.push(traceable)

  return violations
}

/** Calculate an INCOSE quality penalty (0–15 points deducted from quality score) */
export function incoseScorePenalty(violations: IncoseViolation[]): number {
  let penalty = 0
  for (const v of violations) {
    if (v.severity === 'error') penalty += 5
    else penalty += 3
  }
  return Math.min(penalty, 15)
}
