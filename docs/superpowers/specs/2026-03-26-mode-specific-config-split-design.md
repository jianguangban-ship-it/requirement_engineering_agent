# Mode-Specific Configuration Split

**Date:** 2026-03-26
**Status:** Approved

## Summary

Split shared domain configuration files into mode-specific variants (`.design.ts` / `.task.ts`) so Design mode and Task mode each have independent, maintainable config sources. A mode-aware resolver (`mode-config.ts`) routes callers to the correct variant based on `appMode`.

## Motivation

Currently all domain config files are shared between Design and Task modes. Design mode is built around INCOSE requirement quality, ASPICE traceability, and structured requirement elicitation — concepts that don't map well to Task mode's focus on actionable ticket creation, effort estimation, and task dependencies. Splitting the configs allows each mode to evolve independently.

## File Structure

### Mode-Specific Files (renamed + new)

| Current file | Design mode | Task mode |
|---|---|---|
| `elicitation.ts` | `elicitation.design.ts` (renamed) | `elicitation.task.ts` (NEW) |
| `incose.ts` | `incose.design.ts` (renamed) | `quality.task.ts` (NEW) |
| `review-workflow.ts` | `review-workflow.design.ts` (renamed) | `review-workflow.task.ts` (NEW) |
| `traceability.ts` | `traceability.design.ts` (renamed) | `traceability.task.ts` (NEW) |

### New Files

| File | Purpose |
|---|---|
| `src/config/domain/mode-config.ts` | Mode-aware resolver — single entry point for all mode-dependent config |
| `src/config/skills/coach-skill-task-en.md` | Task-focused coach skill (English) |
| `src/config/skills/coach-skill-task-zh.md` | Task-focused coach skill (Chinese) |

### Shared Files (unchanged)

`vocabulary.ts`, `standards.ts`, `aspice.ts`, `assumptions.ts`, `conflicts.ts`, `review-perspectives.ts`, `trace-suggest.ts`, `trace-impact.ts`, `projects.ts`, `constants.ts`, `webhook.ts`, `llm.ts`, `icons.ts`

## Mode-Aware Resolver (`mode-config.ts`)

A single module that imports both mode variants and exports resolver functions keyed by `AppMode`. Callers import from `mode-config.ts` and pass the current `appMode` — they never import `.design` or `.task` files directly.

### Explore mode policy

`explore` mode uses **Design-mode config as fallback**. In practice, explore mode disables coach/task-coach skills entirely (`applyModeFlags` sets both to `false`), so resolver functions are rarely called. But if they are, they return design-mode results rather than crashing.

### Shared interfaces

Both design and task variants must conform to the **same interface shapes** so the resolver returns a single type (not a union):

- **`QualityViolation`** — shared interface with `ruleId: string`, `titleEn`, `titleZh`, `messageEn`, `messageZh`, `severity`, `matches?`. Both `incose.design.ts` and `quality.task.ts` export violations matching this shape. The existing `IncoseViolation` type is widened to `QualityViolation` (with `IncoseRuleId` becoming just `string`).
- **`ElicitationSet`** — both `elicitation.design.ts` and `elicitation.task.ts` export sets conforming to the existing `ElicitationSet` interface (`titleEn`, `titleZh`, `questions: ElicitationQuestion[]`). Task-mode functions are named `getTaskScopingSet` / `buildTaskScopingPrompt` internally but return `ElicitationSet`.
- **`ReviewStep`**, **`ChecklistItem`** — already generic enough, both variants use them as-is.
- **`TraceabilityGap`** — both variants return the same `{ id, messageEn, messageZh, severity }` shape.

### Exported functions

```typescript
getModeElicitationSet(mode, role, lang)      // ElicitationSet
getModeElicitationPrompt(mode, role, lang)   // prompt string
getModeQualityCheck(mode, description)       // QualityViolation[]
getModeQualityPenalty(mode, violations)      // penalty number
getModeReviewSteps(mode)                     // ReviewStep[]
getModeReviewChecklist(mode, role)           // ChecklistItem[]
getModeTraceGaps(mode, ...)                  // TraceabilityGap[]
getModeTraceContext(mode, ...)               // context string
```

## Task-Mode Config Content

### `elicitation.task.ts` — Task Scoping Questions

Replaces requirement elicitation with practical task-scoping questions:
- "What is the specific deliverable or outcome of this task?"
- "What are the acceptance criteria? How will you know it's done?"
- "Does this task depend on or block any other tasks?"
- "What's the estimated effort? (Fibonacci points)"
- "Are there any risks or unknowns that could delay this?"

Role-specific questions still apply (e.g., SW developer: "Which modules/files will be touched?", VV engineer: "What test coverage is expected?").

Exports `getTaskScopingSet(role, lang)` and `buildTaskScopingPrompt(role, lang)` — both return the shared `ElicitationSet` interface so the resolver doesn't need union types.

### `quality.task.ts` — Task Quality Checks

Replaces INCOSE rules with task-focused quality checks:

| Rule ID | What it checks |
|---|---|
| `actionable` | Has a clear verb + deliverable, not vague |
| `scoped` | Not too broad — flags conjunctions (similar to INCOSE atomic) |
| `complete` | No TBD/TBC (same pattern as INCOSE) |
| `estimated` | Points/effort assigned |
| `acceptance` | Has pass/fail criteria or AC |

Same return shape: array of violations with `ruleId`, `titleEn/Zh`, `messageEn/Zh`, `severity`.

### `review-workflow.task.ts` — Task Review Workflow

Same 5 workflow steps (`Draft -> AI Reviewed -> Peer Reviewed -> Approved -> JIRA Created`), but `getReviewChecklist(role)` returns task-oriented items:
- Common: "Acceptance criteria defined", "Effort estimated", "No TBD items"
- SW: "Modules/files identified", "Unit test approach noted"
- VV: "Test scope defined", "Test environment identified"
- HW: "Component/board identified", "Schematic impact assessed"
- ME: "Assembly/packaging impact noted"
- System: "Cross-team dependencies identified"

### `traceability.task.ts` — Task Dependencies

Replaces ASPICE requirement hierarchy with task relationship logic:
- Type: `TaskLevel = 'epic' | 'story' | 'task' | 'subtask' | 'bug'`
- `checkTaskDependencyGaps()` — flags tasks with no parent epic/story, missing blockers
- `buildTaskDependencyContext()` — injects dependency context into LLM prompts

### `coach-skill-task-*.md` — Task Coach Skills

Focus areas:
- Breaking work into actionable tickets
- Writing clear acceptance criteria
- Effort estimation guidance
- Dependency awareness
- No INCOSE/ASPICE language

## Integration Points

### Files that change

| File | Change |
|---|---|
| `src/config/domain/index.ts` | Re-export from `mode-config.ts`; remove direct exports of renamed files; make `checkDomainWarnings` mode-aware (skip automotive warnings in task mode) |
| `src/config/skills/index.ts` | `getCoachSkill(lang)` becomes `getCoachSkill(mode, lang)` — loads task skill when `mode === 'task'`; add separate localStorage key `'coach-skill-task'` for task-mode overrides |
| `src/composables/useLLM.ts` | Pass `appMode.value` to skill getters and resolver functions |
| `src/composables/useBatchOps.ts` | Switch `checkIncoseRules` / `incoseScorePenalty` to `getModeQualityCheck` / `getModeQualityPenalty` |
| `src/composables/useForm.ts` | Switch quality checks and `checkDomainWarnings` to mode-aware versions |
| `src/components/form/ReviewStatusBar.vue` | Change direct import from `review-workflow` to resolver import |
| Other components using `checkIncoseRules` | Switch to `getModeQualityCheck(mode, desc)` |
| Other components using `getElicitationSet` | Switch to `getModeElicitationSet(mode, role, lang)` |
| Other components using `REVIEW_STEPS` / `getReviewChecklist` | Switch to resolver equivalents |
| `src/components/dev/DevTools.vue` | Add task-mode skill editing with separate localStorage key |

### Files that don't change

`projects.ts`, `constants.ts`, `webhook.ts`, `llm.ts`, `icons.ts`, `useAppMode.ts`
