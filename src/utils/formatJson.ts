export function formatJson(data: unknown): string {
  if (!data) return ''

  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2)

  let escaped = jsonString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  escaped = escaped
    .replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (_match, content: string) => {
      return `<span class="json-string">"${content}"</span>`
    })
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="json-number">$1</span>')
    .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
    .replace(/\bnull\b/g, '<span class="json-null">null</span>')

  return escaped
}
