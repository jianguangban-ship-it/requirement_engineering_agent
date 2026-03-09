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
- Markdown: `markdown-it` + `markdown-it-texmath` (KaTeX) + `DOMPurify`
- Syntax highlighting: `highlight.js` (tree-shaken, 13 languages)
- JSON viewer: recursive `JsonNode.vue` component
- Tests: Vitest + @vue/test-utils

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
