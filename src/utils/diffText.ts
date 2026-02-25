/**
 * Simple LCS-based word-level diff.
 * Returns an HTML string with <ins class="diff-add"> and <del class="diff-del"> spans.
 */
export function diffWords(oldText: string, newText: string): string {
  const oldWords = tokenize(oldText)
  const newWords = tokenize(newText)

  const m = oldWords.length
  const n = newWords.length

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to build diff
  const parts: Array<{ type: 'same' | 'add' | 'del'; text: string }> = []
  let i = m
  let j = n

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      parts.unshift({ type: 'same', text: oldWords[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      parts.unshift({ type: 'add', text: newWords[j - 1] })
      j--
    } else {
      parts.unshift({ type: 'del', text: oldWords[i - 1] })
      i--
    }
  }

  return parts
    .map(p => {
      const escaped = escapeHtml(p.text)
      if (p.type === 'add') return `<ins class="diff-add">${escaped}</ins>`
      if (p.type === 'del') return `<del class="diff-del">${escaped}</del>`
      return escaped
    })
    .join('')
}

function tokenize(text: string): string[] {
  // Split into words + whitespace tokens so spacing is preserved
  return text.match(/\S+|\s+/g) ?? []
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
