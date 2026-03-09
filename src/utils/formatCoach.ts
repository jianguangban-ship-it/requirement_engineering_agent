import { useI18n } from '@/i18n'
import { renderMarkdown } from '@/utils/markdown'

const { t } = useI18n()

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Render a markdown string to HTML using markdown-it + KaTeX.
 * Applies coach-specific post-processing (turn dividers, status icons).
 */
function formatMarkdownText(text: string): string {
  if (!text) return ''

  // Render markdown (tables, math, code, lists, headings, etc.)
  return renderMarkdown(text)
}

function formatCommentList(comment: string): string {
  if (!comment) return ''
  const text = escapeHtml(comment)
  const items = text.split(/(?=\d+\.\s)/)

  if (items.length > 1) {
    let html = '<div class="coach-issues-list">'
    for (const item of items) {
      const trimmed = item.trim()
      if (!trimmed) continue
      const match = trimmed.match(/^(\d+)\.\s*(.+?)(?:；|;|$)/s)
      if (match) {
        const num = match[1]
        let content = match[2] || trimmed.replace(/^\d+\.\s*/, '')
        content = content.replace(/[；;]\s*$/, '')
        content = content.replace(
          /(缺少|缺失|未提供|未明确|未关联|未提及|未说明|未定义|不明确)/g,
          '<span class="coach-highlight-error">$1</span>'
        )
        html += `<div class="coach-issue-item">
          <span class="coach-issue-num">${num}</span>
          <span class="coach-issue-text">${content}</span>
        </div>`
      }
    }
    html += '</div>'
    return html
  }
  return `<p>${text}</p>`
}

export function formatCoachResponse(data: unknown): string {
  if (!data) return ''

  let item: Record<string, unknown> | null = null
  if (Array.isArray(data)) {
    item = data[0] as Record<string, unknown>
  } else if (typeof data === 'object' && data !== null) {
    item = data as Record<string, unknown>
  } else {
    return escapeHtml(String(data))
  }

  if (!item) return ''

  const hasStructuredFields = item.status || item.comment || item.markdown_msg || item.team

  if (!hasStructuredFields) {
    const text = (item.raw_content || item.message || item.output || item.content || item.text || '') as string
    if (text) return formatMarkdownText(text)
  }

  // Build structured output
  let html = ''

  if (item.status) {
    const status = item.status as string
    const cls = status === 'PASS' ? 'coach-status-pass' :
                status === 'FAIL' ? 'coach-status-fail' : 'coach-status-warn'
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️'
    html += `<div class="coach-status-badge ${cls}">${icon} ${escapeHtml(status)}</div>`
  }

  if (item.team) {
    html += `<div class="coach-info-row">
      <span class="coach-info-label">📂 ${t('coach.team')}:</span>
      <span class="coach-info-value">${escapeHtml(item.team as string)}</span>
    </div>`
  }

  if (item.assignee) {
    html += `<div class="coach-info-row">
      <span class="coach-info-label">👤 ${t('coach.assignee')}:</span>
      <span class="coach-info-value">${escapeHtml(item.assignee as string)}</span>
    </div>`
  }

  if (item.jira_id) {
    html += `<div class="coach-info-row">
      <span class="coach-info-label">🎫 JIRA ID:</span>
      <span class="coach-info-value">${escapeHtml(item.jira_id as string)}</span>
    </div>`
  }

  if (item.markdown_msg) {
    html += `<div class="coach-main-message">${formatMarkdownText(item.markdown_msg as string)}</div>`
  }

  if (item.comment) {
    html += `<div class="coach-comment-section">
      <div class="coach-comment-title">📋 ${t('coach.reviewDetails')}</div>
      <div class="coach-comment-content">${formatCommentList(item.comment as string)}</div>
    </div>`
  }

  if (item.raw_content && !item.markdown_msg && !item.comment) {
    html += `<div class="coach-main-message">${formatMarkdownText(item.raw_content as string)}</div>`
  }

  return html || '<div class="coach-empty">No content available</div>'
}
