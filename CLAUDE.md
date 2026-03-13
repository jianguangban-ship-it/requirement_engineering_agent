# Smart Agent — Project Instructions

### Folder and repo
- **Path:** `E:\smart_agent`
- **Repo:** https://github.com/jianguangban-ship-it/smart_agent

## Post-change checklist (MANDATORY)

After completing any feature, fix, or improvement:

1. **Bump the UI version** in `src/components/layout/AppHeader.vue` — increment the version in `<span class="header-version">vX.XX</span>`
2. **Update PLAN.md** — append a new `## vX.XX` section at the bottom with design rationale, changes list, and modified files table (follow the existing format)
3. Always update `PLAN.md` and `MEMORY.MD` after completing features
Do these automatically without waiting to be asked.

## User Preferences
- Communication language: English
- Commit style: conventional commits (`feat:`, `fix:`, `style:`, `docs:`, `refactor:`)
- Never auto-commit without being asked
- Git push sometimes fails due to corporate SSL — retry the push command if it fails

## Build & Test Commands

```sh
npm test                    # Run linter (standard), type check, transpile, and all tests
npm run build               # Type check only (tsc --noEmit)
npm run transpile           # Generate transpiled test files for various ES targets

# Run a single test file
npx tap test/base.test.js

# Run only JavaScript tests (faster)
npx tap "test/**/*.test.*js"

# Run only TypeScript tests
npx tap --ts test/*.test.*ts
```

## Project stack

- Vue 3 + TypeScript + Vite
- Markdown + Math: `unified` / `remark-parse` / `remark-math` / `remark-gfm` / `remark-breaks` / `remark-rehype` / `rehype-katex` / `rehype-highlight` / `rehype-raw` / `rehype-stringify` + `DOMPurify`
- Math rendering: **KaTeX** (not MathJax) — fast synchronous rendering, good for streaming LLM output
- JSON viewer: recursive `JsonNode.vue` component
- Tests: Vitest + @vue/test-utils

## Architecture decisions — MUST follow

### Prefer AST-based parsing over regex for structured content

**Do NOT use regex-based solutions for parsing markdown, math, or any structured content.**
Use AST-based libraries (unified/remark/rehype ecosystem) instead.

**Why:** In v8.40–v8.42 we learned that regex-based markdown-math parsing (`markdown-it-texmath` with `/\${2}([^$]*?[^\\])\${2}/gmy`) passed all unit tests but failed in production on real LLM output. Subtle whitespace, encoding, and multiline edge cases made regex fundamentally unreliable. The rewrite to AST-based `remark-math` eliminated an entire class of bugs. This applies generally: whenever you need to parse structured text (markdown, HTML, LaTeX, code), prefer a proper parser/AST over regex.

**How to apply:**
- Markdown rendering → `unified` + `remark-*` + `rehype-*` pipeline (already in place)
- Math delimiters → `remark-math` (AST-level, not regex extraction)
- HTML sanitization → `DOMPurify` (DOM-level, not regex stripping)
- If you must use regex, limit it to **simple, flat text transformations** (e.g. `\[...\]` → `$$...$$` delimiter conversion) that don't interact with nested/structured content

### Bilingual (Chinese + English) rendering support

All UI rendering — especially markdown + math — **must work correctly in both Chinese and English contexts**. Key differences to account for:
- Chinese text often has **no space** between text and math delimiters (`横向加速度$a_y$的估计值`)
- Chinese full-width punctuation (，。：；) can appear adjacent to `$` delimiters
- Mixed EN/ZH paragraphs are common in LLM coaching responses
- Test coverage must include Chinese scenarios (see `mathRendering.test.ts` bilingual section, 12+ tests)

## Key files

| Purpose | File |
|---------|------|
| UI version | `src/components/layout/AppHeader.vue` |
| Changelog | `PLAN.md` (append at bottom) |
| Markdown renderer | `src/utils/markdown.ts` |
| Coach formatter | `src/utils/formatCoach.ts` |
| LLM streaming | `src/composables/useLLM.ts` |
| Main orchestrator | `src/App.vue` |
| Payload preview | `src/components/dev/DevTools.vue` |
