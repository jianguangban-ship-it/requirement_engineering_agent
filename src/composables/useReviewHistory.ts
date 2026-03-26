import { ref, computed } from 'vue'
import type { ReviewStatus } from '@/config/domain/types'

export interface ReviewRecord {
  id: string
  ticketKey: string
  summary: string
  role: string
  issueType: string
  qualityScore: number
  reviewStatus: ReviewStatus
  checklistPassed: string[]
  checklistFailed: string[]
  timestamp: number
}

export interface ReviewStats {
  total: number
  approved: number
  approvalRate: number
  avgQualityScore: number
  topFailedChecks: { id: string; count: number }[]
}

const LS_KEY = 'review-history'
const MAX_RECORDS = 100

function loadRecords(): ReviewRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const records = ref<ReviewRecord[]>(loadRecords())

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(records.value))
}

export function useReviewHistory() {
  function addRecord(record: Omit<ReviewRecord, 'id' | 'timestamp'>) {
    const entry: ReviewRecord = {
      ...record,
      id: Math.random().toString(36).slice(2, 10),
      timestamp: Date.now()
    }
    records.value = [entry, ...records.value].slice(0, MAX_RECORDS)
    save()
  }

  function clearAll() {
    records.value = []
    save()
  }

  const stats = computed<ReviewStats>(() => {
    const all = records.value
    const total = all.length
    if (total === 0) {
      return { total: 0, approved: 0, approvalRate: 0, avgQualityScore: 0, topFailedChecks: [] }
    }

    const approved = all.filter(r => r.reviewStatus === 'approved' || r.reviewStatus === 'jira-created').length
    const approvalRate = Math.round((approved / total) * 100)
    const avgQualityScore = Math.round(all.reduce((sum, r) => sum + r.qualityScore, 0) / total)

    // Count failed checklist items
    const failCounts = new Map<string, number>()
    for (const r of all) {
      for (const f of r.checklistFailed) {
        failCounts.set(f, (failCounts.get(f) || 0) + 1)
      }
    }
    const topFailedChecks = [...failCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, count }))

    return { total, approved, approvalRate, avgQualityScore, topFailedChecks }
  })

  /** Build a learning context string for LLM prompts based on historical patterns */
  function buildLearningContext(lang: 'zh' | 'en'): string {
    if (records.value.length < 3) return '' // Need enough data

    const s = stats.value
    const lines: string[] = []

    if (lang === 'zh') {
      lines.push('## 历史审查模式')
      lines.push(`- 共 ${s.total} 条审查记录，通过率 ${s.approvalRate}%`)
      lines.push(`- 平均质量评分：${s.avgQualityScore}/100`)
      if (s.topFailedChecks.length > 0) {
        lines.push('- 常见问题：')
        for (const f of s.topFailedChecks) {
          lines.push(`  - ${f.id}（${f.count} 次未通过）`)
        }
      }
      lines.push('请特别关注上述常见问题，在审查中重点检查。')
    } else {
      lines.push('## Historical Review Patterns')
      lines.push(`- ${s.total} reviews total, ${s.approvalRate}% approval rate`)
      lines.push(`- Average quality score: ${s.avgQualityScore}/100`)
      if (s.topFailedChecks.length > 0) {
        lines.push('- Common issues:')
        for (const f of s.topFailedChecks) {
          lines.push(`  - ${f.id} (failed ${f.count} times)`)
        }
      }
      lines.push('Pay special attention to the above common issues during review.')
    }

    return lines.join('\n')
  }

  return {
    records,
    stats,
    addRecord,
    clearAll,
    buildLearningContext
  }
}
