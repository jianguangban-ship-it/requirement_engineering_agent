import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({
  html: true,          // allow raw HTML — DOMPurify handles sanitisation
  linkify: true,
  typographer: false,
  breaks: true,        // \n → <br> (GFM-style)
})

md.use(texmath, {
  engine: katex,
  delimiters: ['dollars', 'brackets'],   // $...$, $$...$$, \(...\), \[...\]
  katexOptions: { throwOnError: false },
})

// Sanitise HTML output — allow KaTeX spans, math tags, and standard markdown output
const PURIFY_CONFIG = {
  // Keep everything markdown-it + KaTeX can produce
  ADD_TAGS: ['eq', 'eqn', 'section', 'annotation'],
  ADD_ATTR: ['style', 'class', 'aria-hidden', 'encoding', 'xmlns'],
  // block dangerous stuff
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
} satisfies DOMPurify.Config

/**
 * Render a markdown string to sanitised HTML.
 * Handles GFM tables, lists, code, bold/italic, headings, math, etc.
 */
export function renderMarkdown(text: string): string {
  if (!text) return ''

  // AI models sometimes pre-escape * and _ for Markdown safety inside math.
  // markdown-it-texmath already handles raw delimiters correctly, but the
  // escaped variants (\*, \_) can break math parsing. Clean them inside
  // math contexts before markdown-it processes the text.
  let cleaned = text
    .replace(/(\$\$[\s\S]+?\$\$)/g, (m) => m.replace(/\\\*/g, '*').replace(/\\_/g, '_'))
    .replace(/(\$[^$\n]+?\$)/g, (m) => m.replace(/\\\*/g, '*').replace(/\\_/g, '_'))
    .replace(/(\\\[[\s\S]+?\\\])/g, (m) => m.replace(/\\\*/g, '*').replace(/\\_/g, '_'))
    .replace(/(\\\([\s\S]+?\\\))/g, (m) => m.replace(/\\\*/g, '*').replace(/\\_/g, '_'))

  const rawHtml = md.render(cleaned)
  return DOMPurify.sanitize(rawHtml, PURIFY_CONFIG)
}

/** Expose the md instance for advanced usage if needed */
export { md }
