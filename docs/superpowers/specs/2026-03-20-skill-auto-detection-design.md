# Skill Auto-Detection Design

**Date:** 2026-03-20
**Status:** Approved
**Project:** smart_agent (Vue 3 + TypeScript + Vite)

---

## Overview

Add client-side intent-based skill auto-detection to smart_agent's Coach panel. When a user types a message, the app automatically selects the best matching skill (system prompt) from an open registry, replacing the current manual toggle. A subtle chip indicates which skill is active.

---

## Goals

- Auto-select the right system prompt based on user message content
- Support an open skill registry — adding a new skill requires one registry entry
- Zero latency overhead (synchronous matching, no extra API calls)
- Non-breaking — falls back gracefully when no skill matches

---

## Non-Goals

- LLM-based dispatcher (approach B) — deferred until 5+ skills with overlapping domains
- Persistent per-session skill preferences
- Skill picker UI / manual skill switching dropdown

---

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/config/skills/registry.ts` | Single source of truth — all skill entries |
| `src/utils/skillMatcher.ts` | Scoring engine — matches user message to skill |

### Modified Files

| File | Change |
|------|--------|
| `src/composables/useLLM.ts` | Run matcher before coach requests; expose `activeSkill` and `ignoredSkillId` as module-level refs |
| `src/components/panels/CoachPanel.vue` | Render active skill chip |

---

## Skill Registry

### Entry Shape

```ts
interface SkillEntry {
  id: string          // unique identifier, e.g. 'coach', 'analyze', 'ui-ux-pro-max'
  name: string        // display name shown in chip
  keywords: string[]  // fast-match keyword list (lowercase; substring scan for both EN and ZH)
  systemPrompt: string // the full .md system prompt content (bundled default)
  /** Optional: override prompt resolution for built-in skills that have localStorage customization.
   *  Receives current lang and returns the effective raw prompt (checking localStorage first).
   *  If absent, `systemPrompt` is always used as-is (correct for third-party skills). */
  getRawPrompt?: (lang: 'zh' | 'en') => string
  lang?: 'zh' | 'en' | 'both' // optional language filter
}
```

`description` field is removed — n-gram matching is replaced by keyword-only scoring (see Matching Algorithm). This eliminates the n-gram ambiguity while preserving full matching accuracy via a richer `keywords[]` array.

### Registry File (`src/config/skills/registry.ts`)

Exports `SKILL_REGISTRY: SkillEntry[]`. Built-in skills (`coach`, `analyze`) are pre-registered with a `getRawPrompt` function that delegates to `getCoachSkillRaw`/`getAnalyzeSkillRaw` (which check localStorage first). Third-party skills omit `getRawPrompt` and always use bundled `systemPrompt`.

This pattern is open: any future built-in skill simply provides its own `getRawPrompt` function — no hardcoded ID switch needed.

Adding a skill = one array entry + one `import` statement.

---

## Matching Algorithm (`src/utils/skillMatcher.ts`)

### Input

- `message: string` — the **raw user-typed input** only, before `getUserMessage()` assembles the full payload. This prevents false positives from JIRA field content (e.g. the word "review" in every ticket summary triggering `analyze`).
- `registry: SkillEntry[]`
- `lang: 'zh' | 'en'` — current UI language, used to skip skills filtered by `lang`

### Scoring Formula

```
score = keyword hits
```

Where **keyword hit** = `message.toLowerCase().includes(keyword)` for each entry in `skill.keywords[]`.

This is a pure substring scan — no tokenization, no n-grams. Substring scan works correctly for both English (space-delimited) and Chinese (no delimiters) without special handling.

### Threshold and Selection

- Score must be **≥ 2** to activate (prevents single-word false positives)
- **Tie-break**: highest score wins; if equal, first entry in `SKILL_REGISTRY` wins
- **No match** (score < 2 for all skills): return `null`

### Pseudocode

```ts
function matchSkill(message: string, registry: SkillEntry[], lang: 'zh' | 'en'): SkillEntry | null {
  const lower = message.toLowerCase()
  let best: SkillEntry | null = null
  let bestScore = 1 // minimum to beat is the threshold (≥2 means must be > 1)

  for (const skill of registry) {
    if (skill.lang && skill.lang !== 'both' && skill.lang !== lang) continue
    const score = skill.keywords.filter(kw => lower.includes(kw)).length
    if (score > bestScore) {
      best = skill
      bestScore = score
    }
  }

  return best
}
```

### Example Scores

| User message | Matched skill | Keywords hit |
|---|---|---|
| "help me write a UI button component" | ui-ux-pro-max | `ui`, `component`, `button` → score 3 |
| "review my jira ticket description" | analyze | `review`, `jira`, `description` → score 3 |
| "what do you think?" | null (no match) | score 0 |
| "button" | null (no match) | score 1, below threshold |

---

## State — Module-Level Refs in `useLLM.ts`

```ts
// Module-level (outside useLLM() function body) — persists across re-renders
export const activeSkill = ref<SkillEntry | null>(null)
export const ignoredSkillId = ref<string | null>(null)
```

Module-level placement mirrors `coachSkillEnabled` (already module-level). This ensures the dismissed state persists correctly across re-renders and component remounts.

### `ignoredSkillId` Lifecycle

- Set when user clicks ✕ on the chip: `ignoredSkillId.value = activeSkill.value.id`
- Resets when a **different** skill matches on any subsequent message
- Also resets on `clearCoachResponse()` (clear chat action) — treated as a fresh session
- **Does not reset** if the user submits the same message again after dismissing — the dismiss is sticky within the session until clear or a different skill fires. This is intentional: the user explicitly rejected the suggestion for this context.

---

## Request Flow in `useLLM.ts`

```
user submits message (raw input text)
  │
  ├─ coachSkillEnabled === false?
  │     → skip matcher entirely
  │     → activeSkill = null
  │     → system prompt = '' (existing behavior, unchanged)
  │
  └─ coachSkillEnabled === true
        → run matchSkill(rawInput, SKILL_REGISTRY, lang)
        │
        ├─ match found && match.id !== ignoredSkillId
        │     → activeSkill = match
        │     → systemPrompt = resolveSystemPrompt(match) + getResponseFormat()
        │
        └─ no match (or match ignored)
              → activeSkill = null
              → systemPrompt = getCoachSkill(lang)  // existing logic unchanged
```

### `resolveSystemPrompt(skill: SkillEntry, lang: 'zh' | 'en'): string`

```ts
function resolveSystemPrompt(skill: SkillEntry, lang: 'zh' | 'en'): string {
  // Built-in skills provide getRawPrompt() — delegates to getCoachSkillRaw / getAnalyzeSkillRaw
  // which check localStorage first, then fall back to the bundled default.
  // Third-party skills omit getRawPrompt → always use bundled systemPrompt.
  return skill.getRawPrompt ? skill.getRawPrompt(lang) : skill.systemPrompt
}
```

`lang` is passed explicitly as a parameter (derived from `isZh.value` in the calling request flow), making the function self-contained with no implicit closure variables.

`getResponseFormat()` is always appended (same as today's `getCoachSkill()` behavior).

---

## UI — Active Skill Chip

### Placement

Chip appears above the chat input area in `CoachPanel.vue`, fades in/out via CSS transition.

```
┌─────────────────────────────────────────────┐
│  🎨 ui-ux-pro-max                      ✕   │  ← chip (fade-in)
├─────────────────────────────────────────────┤
│  [  type your message...              ]     │
│                              [Send]         │
└─────────────────────────────────────────────┘
```

### Chip Styling

| Skill | CSS token |
|---|---|
| coach (default) | `--text-secondary` border, no accent fill |
| analyze | `--accent-blue` |
| ui-ux-pro-max | `--accent-purple` (add this CSS variable to `global.css`) |
| any future skill | defaults to `--text-secondary` unless overridden in registry |

### Chip Behavior

- **Visible**: `v-if="activeSkill !== null"`
- **Transition**: `<Transition name="fade">` (opacity + translate-y, 150ms) — matches existing modal transitions
- **✕ dismiss**: sets `ignoredSkillId = activeSkill.id`, clears `activeSkill`
- **Read-only**: no click-to-change interaction

---

## Backward Compatibility

- `coachSkillEnabled = false` disables auto-detection entirely — manual override takes full precedence
- `getCoachSkill()`, `getAnalyzeSkill()`, `getCoachSkillRaw()`, `getAnalyzeSkillRaw()` are **unchanged**
- Analyze flow is **not affected** — auto-detection applies to Coach panel only
- Existing behavior is the fallback when matcher returns null

---

## Testing

| Test case | Expected |
|---|---|
| Message with 3 matching keywords → skill A | skill A selected, `activeSkill = A` |
| Message with 1 matching keyword | `activeSkill = null`, fallback used |
| Two skills tie at score 3 | First in registry wins |
| Message matches dismissed skill (`ignoredSkillId = A`) | `activeSkill = null`, A not activated |
| Same message after dismiss | Dismiss is sticky, `activeSkill = null` |
| Different skill matches after dismiss | `ignoredSkillId` resets, new skill activates |
| `coachSkillEnabled = false`, message matches skill | Matcher skipped, `activeSkill = null` |
| Chinese message: "帮我设计一个UI界面" | ui-ux-pro-max matched via substring scan |
| `clearCoachResponse()` called | `ignoredSkillId` resets |
| Built-in skill with localStorage override | `resolveSystemPrompt` returns localStorage value |
| Third-party skill | `resolveSystemPrompt` returns bundled `.systemPrompt` |
