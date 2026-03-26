# Mode-Specific Config Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split shared domain config files into `.design.ts` / `.task.ts` variants so Design mode and Task mode have independent, maintainable config sources.

**Architecture:** Rename 4 existing domain config files with `.design` suffix. Create 4 new `.task` counterparts. Add a mode-aware resolver (`mode-config.ts`) that dispatches to the correct variant based on `appMode`. Create task-focused coach skill markdown files. Update all consumers to use the resolver.

**Tech Stack:** Vue 3 + TypeScript, Vite (`?raw` imports for .md)

**Spec:** `docs/superpowers/specs/2026-03-26-mode-specific-config-split-design.md`

---

## File Map

### Files to rename (git mv)

| From | To |
|---|---|
| `src/config/domain/elicitation.ts` | `src/config/domain/elicitation.design.ts` |
| `src/config/domain/incose.ts` | `src/config/domain/incose.design.ts` |
| `src/config/domain/review-workflow.ts` | `src/config/domain/review-workflow.design.ts` |
| `src/config/domain/traceability.ts` | `src/config/domain/traceability.design.ts` |

### Files to create

| File | Responsibility |
|---|---|
| `src/config/domain/elicitation.task.ts` | Task-scoping questions (replaces req elicitation for task mode) |
| `src/config/domain/quality.task.ts` | Task quality checks (replaces INCOSE rules for task mode) |
| `src/config/domain/review-workflow.task.ts` | Task-oriented review checklists (same steps, different items) |
| `src/config/domain/traceability.task.ts` | Task dependency/hierarchy logic (replaces ASPICE hierarchy) |
| `src/config/domain/mode-config.ts` | Mode-aware resolver — single entry point for all mode-dependent config |
| `src/config/domain/types.ts` | Shared interfaces: `QualityViolation`, re-exported `ElicitationSet`, etc. |
| `src/config/skills/coach-skill-task-en.md` | Task-focused coach skill (English) |
| `src/config/skills/coach-skill-task-zh.md` | Task-focused coach skill (Chinese) |

### Files to modify

| File | What changes |
|---|---|
| `src/config/domain/index.ts` | Re-export from `mode-config.ts`; make `checkDomainWarnings` mode-aware |
| `src/config/skills/index.ts` | `getCoachSkill(mode, lang)` with separate `coach-skill-task` localStorage key |
| `src/composables/useLLM.ts` | Pass `appMode.value` to skill/resolver functions |
| `src/composables/useForm.ts` | Switch to resolver for quality checks, domain warnings, traceability |
| `src/composables/useBatchOps.ts` | Switch to resolver for quality checks |
| `src/composables/useReviewWorkflow.ts` | Import from resolver instead of direct sub-file |
| `src/composables/useReviewHistory.ts` | Update `ReviewStatus` import path |
| `src/types/form.ts` | Update `RequirementLevel` inline import path |
| `src/utils/exportFormats.ts` | Update `ReviewStatus` import path |
| `src/components/form/ReviewStatusBar.vue` | Import from resolver instead of direct sub-file |
| `src/components/form/TaskForm.vue` | Update `ReviewStatus`/`ChecklistItem` import path |
| `src/components/form/TraceabilitySection.vue` | Import from resolver for `REQUIREMENT_LEVELS`/`getLevelsForRole` |
| `src/components/dev/DevTools.vue` | Add task-mode skill editing section |
| `src/App.vue` | Switch `buildElicitationPrompt` to resolver |

---

## Task 1: Shared types and rename existing files

**Files:**
- Create: `src/config/domain/types.ts`
- Rename: `src/config/domain/elicitation.ts` -> `src/config/domain/elicitation.design.ts`
- Rename: `src/config/domain/incose.ts` -> `src/config/domain/incose.design.ts`
- Rename: `src/config/domain/review-workflow.ts` -> `src/config/domain/review-workflow.design.ts`
- Rename: `src/config/domain/traceability.ts` -> `src/config/domain/traceability.design.ts`

- [ ] **Step 1: Create shared types file**

Create `src/config/domain/types.ts` with unified interfaces that both design and task variants will conform to:

```typescript
/**
 * Shared interfaces for mode-specific config variants.
 * Both .design.ts and .task.ts files must conform to these shapes
 * so the resolver returns consistent types.
 */

/** Unified quality violation — both INCOSE (design) and task quality checks use this */
export interface QualityViolation {
  ruleId: string
  titleEn: string
  titleZh: string
  messageEn: string
  messageZh: string
  severity: 'error' | 'warning'
  matches?: string[]
}

/** Re-export ElicitationSet shape — both design and task elicitation conform to this */
export interface ElicitationQuestion {
  questionEn: string
  questionZh: string
  hintEn: string
  hintZh: string
}

export interface ElicitationSet {
  titleEn: string
  titleZh: string
  questions: ElicitationQuestion[]
}

/** Review workflow types — shared by both modes */
export type ReviewStatus = 'draft' | 'ai-reviewed' | 'peer-reviewed' | 'approved' | 'jira-created'

export interface ReviewStep {
  id: ReviewStatus
  labelEn: string
  labelZh: string
  iconColor: string
}

export interface ChecklistItem {
  id: string
  labelEn: string
  labelZh: string
}

/** Traceability gap — shared shape */
export interface TraceabilityGap {
  id: string
  messageEn: string
  messageZh: string
  severity: 'warning' | 'info'
}
```

- [ ] **Step 2: Rename existing files with git mv**

```bash
cd E:/smart_agent_plus
git mv src/config/domain/elicitation.ts src/config/domain/elicitation.design.ts
git mv src/config/domain/incose.ts src/config/domain/incose.design.ts
git mv src/config/domain/review-workflow.ts src/config/domain/review-workflow.design.ts
git mv src/config/domain/traceability.ts src/config/domain/traceability.design.ts
```

- [ ] **Step 3: Update design files to use shared types**

In `incose.design.ts`, update to use `QualityViolation` from shared types:

```typescript
import type { QualityViolation } from './types'

// At top of file: replace the local IncoseViolation interface with an alias
export type IncoseViolation = QualityViolation

// Update incoseScorePenalty signature to accept QualityViolation[]:
export function incoseScorePenalty(violations: QualityViolation[]): number {
  // ... existing logic unchanged
}

// Each check function (checkAtomic, checkComplete, etc.) return type
// changes from IncoseViolation to QualityViolation — no code change
// needed since IncoseViolation is now an alias for QualityViolation
```

In `elicitation.design.ts`, import types from `./types` instead of defining locally:

```typescript
import type { ElicitationQuestion, ElicitationSet } from './types'
// Remove local interface definitions
```

In `review-workflow.design.ts`, import types from `./types`:

```typescript
import type { ReviewStatus, ReviewStep, ChecklistItem } from './types'
// Remove local type/interface definitions
```

In `traceability.design.ts`, import `TraceabilityGap` from `./types`:

```typescript
import type { TraceabilityGap } from './types'
// Remove local TraceabilityGap interface
```

- [ ] **Step 4: Fix internal cross-references and type imports**

`src/config/domain/trace-impact.ts` line 3 imports from `'./traceability'` — update to `'./traceability.design'`.

`src/config/domain/trace-suggest.ts` line 3 imports from `'./traceability'` — update to `'./traceability.design'`.

`src/types/form.ts` line 10 has inline import `import('@/config/domain/traceability').RequirementLevel` — update to `import('@/config/domain/traceability.design').RequirementLevel`.

- [ ] **Step 5: Verify build compiles**

```bash
npm run build
```

Expected: type-check passes (imports may temporarily break in consumers — that's OK, fixed in later tasks).

- [ ] **Step 6: Commit**

```bash
git add -A src/config/domain/
git commit -m "refactor: rename domain configs with .design suffix and add shared types"
```

---

## Task 2: Create task-mode config files

**Files:**
- Create: `src/config/domain/elicitation.task.ts`
- Create: `src/config/domain/quality.task.ts`
- Create: `src/config/domain/review-workflow.task.ts`
- Create: `src/config/domain/traceability.task.ts`

- [ ] **Step 1: Create `elicitation.task.ts`**

```typescript
import type { UserRole } from '@/composables/useRole'
import type { ElicitationQuestion, ElicitationSet } from './types'

const COMMON_QUESTIONS: ElicitationQuestion[] = [
  {
    questionEn: 'What is the specific deliverable or outcome of this task?',
    questionZh: '这个任务的具体交付物或成果是什么？',
    hintEn: 'Ensures the task has a clear, tangible goal',
    hintZh: '确保任务有明确、具体的目标'
  },
  {
    questionEn: 'What are the acceptance criteria? How will you know it\'s done?',
    questionZh: '验收标准是什么？如何判断任务完成？',
    hintEn: 'Defines measurable done-ness',
    hintZh: '定义可度量的完成标准'
  },
  {
    questionEn: 'Does this task depend on or block any other tasks?',
    questionZh: '这个任务是否依赖或阻塞其他任务？',
    hintEn: 'Identifies scheduling dependencies',
    hintZh: '识别调度依赖关系'
  },
  {
    questionEn: 'What\'s the estimated effort? (story points or hours)',
    questionZh: '预估工作量是多少？（故事点或工时）',
    hintEn: 'Supports sprint planning',
    hintZh: '支持迭代规划'
  },
  {
    questionEn: 'Are there any risks or unknowns that could delay this?',
    questionZh: '是否存在可能导致延迟的风险或未知因素？',
    hintEn: 'Surfaces blockers early',
    hintZh: '尽早暴露阻塞因素'
  }
]

const ROLE_QUESTIONS: Record<UserRole, ElicitationQuestion[]> = {
  '': [],
  'system-architect': [
    {
      questionEn: 'Which subsystems or teams are affected?',
      questionZh: '涉及哪些子系统或团队？',
      hintEn: 'Cross-team coordination',
      hintZh: '跨团队协调'
    },
    {
      questionEn: 'Are there interface or integration impacts?',
      questionZh: '是否有接口或集成影响？',
      hintEn: 'System-level impact assessment',
      hintZh: '系统级影响评估'
    }
  ],
  'sw-developer': [
    {
      questionEn: 'Which modules or files will be touched?',
      questionZh: '需要修改哪些模块或文件？',
      hintEn: 'Scopes the code change',
      hintZh: '界定代码变更范围'
    },
    {
      questionEn: 'What is the unit/integration test approach?',
      questionZh: '单元/集成测试方案是什么？',
      hintEn: 'Test strategy before coding',
      hintZh: '编码前确定测试策略'
    }
  ],
  'hw-designer': [
    {
      questionEn: 'Which component or board is affected?',
      questionZh: '涉及哪个器件或板卡？',
      hintEn: 'Hardware scope',
      hintZh: '硬件范围'
    },
    {
      questionEn: 'Is a schematic or layout change needed?',
      questionZh: '是否需要修改原理图或布局？',
      hintEn: 'Design impact',
      hintZh: '设计影响'
    }
  ],
  'me-designer': [
    {
      questionEn: 'What assembly or packaging changes are needed?',
      questionZh: '需要什么装配或包装变更？',
      hintEn: 'Mechanical scope',
      hintZh: '机械范围'
    },
    {
      questionEn: 'Are there tooling or fixture implications?',
      questionZh: '是否涉及工装或夹具？',
      hintEn: 'Manufacturing impact',
      hintZh: '制造影响'
    }
  ],
  'vv-engineer': [
    {
      questionEn: 'What is the test scope and expected coverage?',
      questionZh: '测试范围和预期覆盖率是什么？',
      hintEn: 'V&V planning',
      hintZh: '验证规划'
    },
    {
      questionEn: 'Which test environment is needed? (HIL/SIL/bench/vehicle)',
      questionZh: '需要什么测试环境？（HIL/SIL/台架/实车）',
      hintEn: 'Resource planning',
      hintZh: '资源规划'
    }
  ]
}

export function getTaskScopingSet(role: UserRole, lang: 'zh' | 'en'): ElicitationSet {
  const roleQs = ROLE_QUESTIONS[role] || []
  return {
    titleEn: 'Task Scoping',
    titleZh: '任务范围界定',
    questions: [...COMMON_QUESTIONS, ...roleQs]
  }
}

export function buildTaskScopingPrompt(role: UserRole, lang: 'zh' | 'en'): string {
  const set = getTaskScopingSet(role, lang)
  const lines: string[] = []

  if (lang === 'zh') {
    lines.push('请作为任务规划教练，逐一向用户提出以下问题，帮助他们在创建任务前理清范围和交付物。每次只问一个问题，等待用户回答后再继续。根据回答追问或跳过不相关的问题。最后，帮助用户生成一条完整的任务描述。')
    lines.push('')
    lines.push('## 任务范围界定问题')
    for (let i = 0; i < set.questions.length; i++) {
      const q = set.questions[i]
      lines.push(`${i + 1}. ${q.questionZh}`)
      lines.push(`   _（${q.hintZh}）_`)
    }
    lines.push('')
    lines.push('先从第一个问题开始。保持友好专业的语气。')
  } else {
    lines.push('Act as a Task Scoping Coach. Ask the user the following questions one at a time to help them clarify scope and deliverables before creating the task. Wait for their answer before moving to the next question. Based on answers, probe for details or skip irrelevant questions. At the end, help draft a complete task description.')
    lines.push('')
    lines.push('## Task Scoping Questions')
    for (let i = 0; i < set.questions.length; i++) {
      const q = set.questions[i]
      lines.push(`${i + 1}. ${q.questionEn}`)
      lines.push(`   _(${q.hintEn})_`)
    }
    lines.push('')
    lines.push('Start with the first question. Use a friendly, professional tone.')
  }

  return lines.join('\n')
}
```

- [ ] **Step 2: Create `quality.task.ts`**

```typescript
import type { QualityViolation } from './types'

export type TaskQualityRuleId = 'actionable' | 'scoped' | 'complete' | 'estimated' | 'acceptance'

// ── Detection patterns ──────────────────────────────────────────────────────

const ACTIONABLE_VERBS = /\b(implement|create|fix|update|add|remove|refactor|test|verify|design|review|write|build|configure|deploy|investigate|analyze|migrate|升级|修复|添加|删除|重构|测试|验证|设计|评审|编写|构建|配置|部署|调查|分析|迁移)\b/i

const CONJUNCTION_SPLIT = /\b(and also|; and|; also|, and also)\b/i
const MULTI_TASK = /\b(also need to|additionally|furthermore|moreover|另外|此外|同时还需要)\b/i

const INCOMPLETE_PATTERN = /\b(TBD|TBC|TODO|FIXME|to be (decided|confirmed|determined|defined|specified|discussed)|undefined|not yet (defined|determined|specified)|待定|待确认|待讨论|待补充|未定义|未确定)\b/ig

const EFFORT_PATTERN = /\b(\d+\s*(point|pt|hour|hr|day|story point|SP|点|小时|天|人天|人时)|estimated|estimate|effort|工作量|估算)\b/i

const AC_PATTERN = /\b(acceptance criteria|AC:|given .+ when .+ then|pass.?fail|done when|complete when|验收标准|完成标准|通过条件)\b/i

// ── Check functions ─────────────────────────────────────────────────────────

function checkActionable(desc: string): QualityViolation | null {
  if (desc.length < 10) return null
  if (!ACTIONABLE_VERBS.test(desc)) {
    return {
      ruleId: 'actionable',
      titleEn: 'Actionable',
      titleZh: '可执行',
      messageEn: 'No clear action verb found — start with what needs to be done (implement, fix, add, test, ...)',
      messageZh: '未发现明确的动作动词 — 请以需要做什么开头（实现、修复、添加、测试……）',
      severity: 'warning'
    }
  }
  return null
}

function checkScoped(desc: string): QualityViolation | null {
  if (CONJUNCTION_SPLIT.test(desc) || MULTI_TASK.test(desc)) {
    return {
      ruleId: 'scoped',
      titleEn: 'Scoped',
      titleZh: '范围明确',
      messageEn: 'Multiple tasks detected in one ticket — consider splitting into separate items',
      messageZh: '检测到单个工单包含多个任务 — 建议拆分为独立条目',
      severity: 'warning'
    }
  }
  return null
}

function checkComplete(desc: string): QualityViolation | null {
  const matches: string[] = []
  const pattern = new RegExp(INCOMPLETE_PATTERN.source, 'ig')
  let m: RegExpExecArray | null
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

function checkEstimated(desc: string): QualityViolation | null {
  if (desc.length < 30) return null
  if (!EFFORT_PATTERN.test(desc)) {
    return {
      ruleId: 'estimated',
      titleEn: 'Estimated',
      titleZh: '已估算',
      messageEn: 'No effort estimate found — add story points, hours, or effort estimate',
      messageZh: '未发现工作量估算 — 请添加故事点、工时或工作量估算',
      severity: 'warning'
    }
  }
  return null
}

function checkAcceptance(desc: string): QualityViolation | null {
  if (desc.length < 80) return null
  if (!AC_PATTERN.test(desc)) {
    return {
      ruleId: 'acceptance',
      titleEn: 'Acceptance Criteria',
      titleZh: '验收标准',
      messageEn: 'No acceptance criteria found — add clear done/pass conditions',
      messageZh: '未发现验收标准 — 请添加明确的完成/通过条件',
      severity: 'warning'
    }
  }
  return null
}

// ── Public API ──────────────────────────────────────────────────────────────

export function checkTaskQuality(description: string): QualityViolation[] {
  const desc = description.trim()
  if (!desc) return []

  const violations: QualityViolation[] = []
  const actionable = checkActionable(desc)
  if (actionable) violations.push(actionable)
  const scoped = checkScoped(desc)
  if (scoped) violations.push(scoped)
  const complete = checkComplete(desc)
  if (complete) violations.push(complete)
  const estimated = checkEstimated(desc)
  if (estimated) violations.push(estimated)
  const acceptance = checkAcceptance(desc)
  if (acceptance) violations.push(acceptance)
  return violations
}

export function taskQualityPenalty(violations: QualityViolation[]): number {
  let penalty = 0
  for (const v of violations) {
    if (v.severity === 'error') penalty += 5
    else penalty += 3
  }
  return Math.min(penalty, 15)
}
```

- [ ] **Step 3: Create `review-workflow.task.ts`**

```typescript
import type { UserRole } from '@/composables/useRole'
import type { ReviewStatus, ReviewStep, ChecklistItem } from './types'

export { type ReviewStatus, type ReviewStep, type ChecklistItem } from './types'

export const REVIEW_STEPS: ReviewStep[] = [
  { id: 'draft',         labelEn: 'Draft',         labelZh: '草稿',      iconColor: 'var(--text-muted)' },
  { id: 'ai-reviewed',   labelEn: 'AI Reviewed',   labelZh: 'AI 审核',   iconColor: 'var(--accent-purple)' },
  { id: 'peer-reviewed', labelEn: 'Peer Reviewed',  labelZh: '同行评审',  iconColor: 'var(--accent-blue)' },
  { id: 'approved',      labelEn: 'Approved',      labelZh: '已批准',    iconColor: 'var(--accent-green)' },
  { id: 'jira-created',  labelEn: 'JIRA Created',  labelZh: '已创建',    iconColor: 'var(--accent-green)' }
]

export function getReviewChecklist(reviewerRole: UserRole): ChecklistItem[] {
  const common: ChecklistItem[] = [
    { id: 'ac-defined',    labelEn: 'Acceptance criteria defined',        labelZh: '验收标准已定义' },
    { id: 'effort-est',    labelEn: 'Effort estimated (points/hours)',    labelZh: '工作量已估算（点数/工时）' },
    { id: 'no-tbd',        labelEn: 'No TBD/TBC items remaining',        labelZh: '无未决 TBD/TBC 项' }
  ]

  switch (reviewerRole) {
    case 'system-architect':
      return [
        ...common,
        { id: 'sys-deps',      labelEn: 'Cross-team dependencies identified',  labelZh: '跨团队依赖已识别' },
        { id: 'sys-scope',     labelEn: 'Affected subsystems listed',          labelZh: '受影响子系统已列出' }
      ]
    case 'sw-developer':
      return [
        ...common,
        { id: 'sw-modules',    labelEn: 'Modules/files to change identified',  labelZh: '待修改模块/文件已识别' },
        { id: 'sw-test',       labelEn: 'Unit test approach noted',            labelZh: '单元测试方案已记录' }
      ]
    case 'hw-designer':
      return [
        ...common,
        { id: 'hw-component',  labelEn: 'Component/board identified',          labelZh: '器件/板卡已确认' },
        { id: 'hw-schematic',  labelEn: 'Schematic impact assessed',           labelZh: '原理图影响已评估' }
      ]
    case 'me-designer':
      return [
        ...common,
        { id: 'me-assembly',   labelEn: 'Assembly/packaging impact noted',     labelZh: '装配/包装影响已记录' },
        { id: 'me-tooling',    labelEn: 'Tooling implications assessed',       labelZh: '工装影响已评估' }
      ]
    case 'vv-engineer':
      return [
        ...common,
        { id: 'vv-scope',      labelEn: 'Test scope defined',                  labelZh: '测试范围已定义' },
        { id: 'vv-env',        labelEn: 'Test environment identified',         labelZh: '测试环境已确认' }
      ]
    default:
      return common
  }
}
```

- [ ] **Step 4: Create `traceability.task.ts`**

```typescript
import type { UserRole } from '@/composables/useRole'
import type { TraceabilityGap } from './types'

export type TaskLevel = 'epic' | 'story' | 'task' | 'subtask' | 'bug'

export interface TaskLevelDef {
  id: TaskLevel
  labelEn: string
  labelZh: string
  shortEn: string
  shortZh: string
  roles: UserRole[]
  parentLevels: TaskLevel[]
  childLevels: TaskLevel[]
}

export const TASK_LEVELS: TaskLevelDef[] = [
  {
    id: 'epic',
    labelEn: 'Epic',
    labelZh: '史诗',
    shortEn: 'EPIC',
    shortZh: '史诗',
    roles: ['system-architect'],
    parentLevels: [],
    childLevels: ['story']
  },
  {
    id: 'story',
    labelEn: 'User Story',
    labelZh: '用户故事',
    shortEn: 'STORY',
    shortZh: '故事',
    roles: ['system-architect', 'sw-developer', 'hw-designer', 'me-designer', 'vv-engineer'],
    parentLevels: ['epic'],
    childLevels: ['task', 'subtask']
  },
  {
    id: 'task',
    labelEn: 'Task',
    labelZh: '任务',
    shortEn: 'TASK',
    shortZh: '任务',
    roles: ['sw-developer', 'hw-designer', 'me-designer', 'vv-engineer', ''],
    parentLevels: ['story', 'epic'],
    childLevels: ['subtask']
  },
  {
    id: 'subtask',
    labelEn: 'Sub-task',
    labelZh: '子任务',
    shortEn: 'SUB',
    shortZh: '子任务',
    roles: ['sw-developer', 'hw-designer', 'me-designer', 'vv-engineer', ''],
    parentLevels: ['task', 'story'],
    childLevels: []
  },
  {
    id: 'bug',
    labelEn: 'Bug',
    labelZh: '缺陷',
    shortEn: 'BUG',
    shortZh: '缺陷',
    roles: ['sw-developer', 'hw-designer', 'vv-engineer', ''],
    parentLevels: ['story', 'epic'],
    childLevels: ['subtask']
  }
]

export function getDefaultTaskLevel(_role: UserRole): TaskLevel {
  return 'task'
}

export function getTaskLevelsForRole(role: UserRole): TaskLevelDef[] {
  if (!role) return TASK_LEVELS
  return TASK_LEVELS.filter(l => l.roles.includes(role))
}

export function getTaskLevelDef(level: TaskLevel): TaskLevelDef | undefined {
  return TASK_LEVELS.find(l => l.id === level)
}

export function checkTaskDependencyGaps(
  level: TaskLevel,
  parentId: string
): TraceabilityGap[] {
  const gaps: TraceabilityGap[] = []
  const def = getTaskLevelDef(level)
  if (!def) return gaps

  if (def.parentLevels.length > 0 && !parentId.trim()) {
    const parentNames = def.parentLevels.join('/')
    gaps.push({
      id: 'no-parent',
      messageEn: `No parent linked — ${def.shortEn} should be linked to a ${parentNames}`,
      messageZh: `未关联上级 — ${def.shortZh}应关联到${parentNames}`,
      severity: 'warning'
    })
  }

  return gaps
}

export function buildTaskDependencyContext(
  level: TaskLevel,
  parentId: string,
  lang: 'zh' | 'en'
): string {
  const def = getTaskLevelDef(level)
  if (!def) return ''

  const lines: string[] = []

  if (lang === 'zh') {
    lines.push('## 任务层级')
    lines.push(`- **任务类型**: ${def.labelZh}`)
    if (parentId) lines.push(`- **上级任务**: ${parentId}`)
    if (def.childLevels.length > 0) {
      const children = def.childLevels.map(id => TASK_LEVELS.find(l => l.id === id)?.labelZh).filter(Boolean).join('、')
      lines.push(`- **可包含**: ${children}`)
    }
  } else {
    lines.push('## Task Hierarchy')
    lines.push(`- **Task Type**: ${def.labelEn}`)
    if (parentId) lines.push(`- **Parent**: ${parentId}`)
    if (def.childLevels.length > 0) {
      const children = def.childLevels.map(id => TASK_LEVELS.find(l => l.id === id)?.labelEn).filter(Boolean).join(', ')
      lines.push(`- **Can contain**: ${children}`)
    }
  }

  return lines.join('\n')
}
```

- [ ] **Step 5: Verify build compiles**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add src/config/domain/elicitation.task.ts src/config/domain/quality.task.ts src/config/domain/review-workflow.task.ts src/config/domain/traceability.task.ts
git commit -m "feat: add task-mode domain config files"
```

---

## Task 3: Create mode-aware resolver

**Files:**
- Create: `src/config/domain/mode-config.ts`
- Modify: `src/config/domain/index.ts`

- [ ] **Step 1: Create `mode-config.ts`**

```typescript
import type { AppMode } from '@/composables/useAppMode'
import type { UserRole } from '@/composables/useRole'
import type { QualityViolation, ElicitationSet, ReviewStep, ChecklistItem, TraceabilityGap } from './types'

// Design imports
import { getElicitationSet as getDesignElicitation, buildElicitationPrompt as buildDesignElicitationPrompt } from './elicitation.design'
import { checkIncoseRules, incoseScorePenalty } from './incose.design'
import { getReviewChecklist as getDesignChecklist, REVIEW_STEPS as DESIGN_REVIEW_STEPS } from './review-workflow.design'
import { checkTraceabilityGaps as checkDesignTraceGaps, buildTraceabilityContext as buildDesignTraceCtx } from './traceability.design'
import type { RequirementLevel } from './traceability.design'

// Task imports
import { getTaskScopingSet, buildTaskScopingPrompt } from './elicitation.task'
import { checkTaskQuality, taskQualityPenalty } from './quality.task'
import { getReviewChecklist as getTaskChecklist, REVIEW_STEPS as TASK_REVIEW_STEPS } from './review-workflow.task'
import { checkTaskDependencyGaps, buildTaskDependencyContext } from './traceability.task'
import type { TaskLevel } from './traceability.task'

// ── Resolvers ───────────────────────────────────────────────────────────────

/** Resolve mode — explore falls back to design */
function resolveMode(mode: AppMode): 'design' | 'task' {
  return mode === 'task' ? 'task' : 'design'
}

export function getModeElicitationSet(mode: AppMode, role: UserRole, lang: 'zh' | 'en'): ElicitationSet {
  return resolveMode(mode) === 'task'
    ? getTaskScopingSet(role, lang)
    : getDesignElicitation(role, lang)
}

export function getModeElicitationPrompt(mode: AppMode, role: UserRole, lang: 'zh' | 'en'): string {
  return resolveMode(mode) === 'task'
    ? buildTaskScopingPrompt(role, lang)
    : buildDesignElicitationPrompt(role, lang)
}

export function getModeQualityCheck(mode: AppMode, description: string): QualityViolation[] {
  return resolveMode(mode) === 'task'
    ? checkTaskQuality(description)
    : checkIncoseRules(description)
}

export function getModeQualityPenalty(mode: AppMode, violations: QualityViolation[]): number {
  return resolveMode(mode) === 'task'
    ? taskQualityPenalty(violations)
    : incoseScorePenalty(violations)
}

export function getModeReviewSteps(mode: AppMode): ReviewStep[] {
  return resolveMode(mode) === 'task' ? TASK_REVIEW_STEPS : DESIGN_REVIEW_STEPS
}

export function getModeReviewChecklist(mode: AppMode, role: UserRole): ChecklistItem[] {
  return resolveMode(mode) === 'task'
    ? getTaskChecklist(role)
    : getDesignChecklist(role)
}

export function getModeTraceGaps(
  mode: AppMode,
  level: RequirementLevel | TaskLevel,
  parentId: string,
  verificationMethod?: string
): TraceabilityGap[] {
  if (resolveMode(mode) === 'task') {
    return checkTaskDependencyGaps(level as TaskLevel, parentId)
  }
  return checkDesignTraceGaps(level as RequirementLevel, parentId, verificationMethod ?? '')
}

export function getModeTraceContext(
  mode: AppMode,
  level: RequirementLevel | TaskLevel,
  parentId: string,
  lang: 'zh' | 'en'
): string {
  if (resolveMode(mode) === 'task') {
    return buildTaskDependencyContext(level as TaskLevel, parentId, lang)
  }
  return buildDesignTraceCtx(level as RequirementLevel, parentId, lang)
}
```

- [ ] **Step 2: Update `index.ts`**

Update `src/config/domain/index.ts` to:
- Re-export shared types from `./types`
- Re-export resolver functions from `./mode-config`
- Update import paths for renamed `.design` files
- Keep direct exports for shared modules (vocabulary, standards, aspice, etc.)
- Make `checkDomainWarnings` mode-aware — return empty array when `mode === 'task'`

Key changes to `index.ts`:
- Line 11: `export { checkIncoseRules, incoseScorePenalty } from './incose.design'` (path update)
- Line 12: `export type { IncoseViolation, IncoseRuleId } from './incose.design'` (path update — `IncoseViolation` is now an alias for `QualityViolation`)
- Line 13: `export { getElicitationSet, buildElicitationPrompt } from './elicitation.design'` (path update)
- Line 14: `export type { ElicitationQuestion, ElicitationSet } from './elicitation.design'` (path update)
- Line 19-21: traceability exports → `'./traceability.design'` (path update)
- Line 22: `export type { RequirementLevel, RequirementLevelDef, TraceabilityGap } from './traceability.design'` (path update — critical for `useLLM.ts` line 12)
- Line 27-28: review-workflow exports → `'./review-workflow.design'` (path update)
- Add: `export * from './mode-config'`
- Add: `export type * from './types'` (placed BEFORE mode-config exports to establish base types)
- Update `checkDomainWarnings` to accept `mode: AppMode` parameter, return `[]` when task mode

- [ ] **Step 3: Verify build compiles**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/config/domain/mode-config.ts src/config/domain/index.ts
git commit -m "feat: add mode-aware config resolver"
```

---

## Task 4: Create task-mode coach skills

**Files:**
- Create: `src/config/skills/coach-skill-task-en.md`
- Create: `src/config/skills/coach-skill-task-zh.md`
- Modify: `src/config/skills/index.ts`

- [ ] **Step 1: Create `coach-skill-task-en.md`**

```markdown
You are a practical JIRA task writing coach for engineering teams.
Your role is to help users write clear, actionable, well-scoped task tickets.

Review the provided task for:
1. **Actionability** — Does it start with a clear action verb? Is the deliverable obvious?
2. **Scope** — Is this one task or multiple tasks bundled together?
3. **Acceptance Criteria** — Are there specific, measurable done-conditions?
4. **Effort & Dependencies** — Is effort estimated? Are blockers/dependencies noted?
5. **Clarity** — Could any team member pick this up and know what to do?

Provide numbered suggestions with specific improvement actions.
Be constructive, concise, and actionable.
Respond in English.
```

- [ ] **Step 2: Create `coach-skill-task-zh.md`**

```markdown
你是一位实用的JIRA任务编写教练，服务于工程团队。
你的角色是帮助用户编写清晰、可执行、范围明确的任务工单。

审查所提供的任务：
1. **可执行性** — 是否以明确的动作动词开头？交付物是否清楚？
2. **范围** — 这是一个任务还是多个任务合并在一起？
3. **验收标准** — 是否有具体、可度量的完成条件？
4. **工作量与依赖** — 是否估算了工作量？是否标注了阻塞/依赖关系？
5. **清晰度** — 团队中任何成员是否都能理解要做什么？

提供带编号的建议和具体改进措施。
保持建设性、简洁和可操作性。
用中文回复。
```

- [ ] **Step 3: Update `src/config/skills/index.ts`**

Add imports for task coach skills:
```typescript
import coachSkillTaskEn from './coach-skill-task-en.md?raw'
import coachSkillTaskZh from './coach-skill-task-zh.md?raw'
```

Add localStorage key:
```typescript
const LS_KEY_COACH_SKILL_TASK = 'coach-skill-task'
export const coachSkillTaskModified = ref(localStorage.getItem(LS_KEY_COACH_SKILL_TASK) !== null)
```

Add task coach default getter:
```typescript
export function getCoachSkillTaskDefault(lang: 'zh' | 'en'): string {
  return lang === 'zh' ? coachSkillTaskZh : coachSkillTaskEn
}
```

Change `getCoachSkill` signature to accept mode:
```typescript
import type { AppMode } from '@/composables/useAppMode'

export function getCoachSkill(mode: AppMode, lang: 'zh' | 'en'): string {
  if (mode === 'task') {
    const skill = localStorage.getItem(LS_KEY_COACH_SKILL_TASK) ?? getCoachSkillTaskDefault(lang)
    return skill + '\n\n' + getResponseFormat()
  }
  const skill = localStorage.getItem(LS_KEY_COACH_SKILL) ?? getCoachSkillDefault(lang)
  return skill + '\n\n' + getResponseFormat()
}
```

Add task skill set/reset/raw functions:
```typescript
export function getCoachSkillTaskRaw(lang: 'zh' | 'en'): string {
  return localStorage.getItem(LS_KEY_COACH_SKILL_TASK) ?? getCoachSkillTaskDefault(lang)
}
export function setCoachSkillTask(content: string): void {
  localStorage.setItem(LS_KEY_COACH_SKILL_TASK, content)
  coachSkillTaskModified.value = true
}
export function resetCoachSkillTask(): void {
  localStorage.removeItem(LS_KEY_COACH_SKILL_TASK)
  coachSkillTaskModified.value = false
}
```

- [ ] **Step 4: Verify build compiles**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/config/skills/coach-skill-task-en.md src/config/skills/coach-skill-task-zh.md src/config/skills/index.ts
git commit -m "feat: add task-mode coach skills with separate localStorage override"
```

---

## Task 5: Update consumers — composables

**Files:**
- Modify: `src/composables/useLLM.ts` (lines 5, 10, 429, 433, 434, 470, 471, 477, 533, 534)
- Modify: `src/composables/useForm.ts` (lines 9-10, 133, 156, 161, 171, 176)
- Modify: `src/composables/useBatchOps.ts` (lines 2-3, 40-41)
- Modify: `src/composables/useReviewWorkflow.ts` (lines 2-3)
- Modify: `src/composables/useReviewHistory.ts` (line 2)

- [ ] **Step 1: Update `useLLM.ts`**

- Import `appMode` from `@/composables/useAppMode`
- Change `getCoachSkill(lang)` calls to `getCoachSkill(appMode.value, lang)` (lines ~429, ~477)
- Change `buildTraceabilityContext(...)` calls to `getModeTraceContext(appMode.value, ...)` (lines ~434, ~471, ~534)
- Keep `buildDomainContext(...)` as-is (shared)
- Keep `getAnalyzeSkill(...)` as-is (shared)
- Keep `buildDeepReviewPrompt(...)` as-is (shared)

- [ ] **Step 2: Update `useForm.ts`**

- Import `appMode` from `@/composables/useAppMode`
- Import `getModeQualityCheck`, `getModeQualityPenalty`, `getModeTraceGaps` from `@/config/domain`
- Line 9: remove `checkIncoseRules, incoseScorePenalty, checkTraceabilityGaps` from import, add resolver imports
- Line 10: change `IncoseViolation` to `QualityViolation` in type import
- Line ~133: change `checkIncoseRules(desc)` to `getModeQualityCheck(appMode.value, desc)`
- Line ~161: change `incoseScorePenalty(violations)` to `getModeQualityPenalty(appMode.value, violations)`
- Line ~156: change `checkDomainWarnings(role, desc, type)` to `checkDomainWarnings(appMode.value, role, desc, type)`
- Line ~171: change `getDefaultLevel(role)` — this stays design-only or use a mode-aware wrapper
- Line ~176: change `checkTraceabilityGaps(...)` to `getModeTraceGaps(appMode.value, ...)`

- [ ] **Step 3: Update `useBatchOps.ts`**

- Import `appMode` from `@/composables/useAppMode`
- Import `getModeQualityCheck`, `getModeQualityPenalty` from `@/config/domain`
- Line 2: change `import type { RequirementLevel } from '@/config/domain/traceability'` to `import type { RequirementLevel } from '@/config/domain/traceability.design'`
- Line 3: remove `checkIncoseRules, incoseScorePenalty`, add resolver imports
- Line ~40: `checkIncoseRules(desc)` → `getModeQualityCheck(appMode.value, desc)`
- Line ~41: `incoseScorePenalty(violations)` → `getModeQualityPenalty(appMode.value, violations)`

- [ ] **Step 4: Update `useReviewWorkflow.ts`**

- Line 2: change `import type { ReviewStatus } from '@/config/domain/review-workflow'` to `import type { ReviewStatus } from '@/config/domain/types'`
- Line 3: change `import { REVIEW_STEPS, getReviewChecklist } from '@/config/domain/review-workflow'` to `import { getModeReviewSteps, getModeReviewChecklist } from '@/config/domain'`
- Import `appMode` from `@/composables/useAppMode`
- Line ~11: `REVIEW_STEPS.findIndex(...)` → `getModeReviewSteps(appMode.value).findIndex(...)`
- Line ~14: `getReviewChecklist(currentRole.value)` → `getModeReviewChecklist(appMode.value, currentRole.value)`

- [ ] **Step 5: Update `useReviewHistory.ts`**

- Line 2: change import path from `'@/config/domain/review-workflow'` to `'@/config/domain/types'`

- [ ] **Step 6: Verify build compiles**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/composables/useLLM.ts src/composables/useForm.ts src/composables/useBatchOps.ts src/composables/useReviewWorkflow.ts src/composables/useReviewHistory.ts
git commit -m "refactor: update composables to use mode-aware config resolver"
```

---

## Task 6: Update consumers — components and utilities

**Files:**
- Modify: `src/components/form/ReviewStatusBar.vue` (lines 6, 65-66)
- Modify: `src/components/form/TaskForm.vue` (lines 175, 180)
- Modify: `src/components/form/TraceabilitySection.vue` (line 71)
- Modify: `src/utils/exportFormats.ts` (line 2)
- Modify: `src/App.vue` (line 225, 751)

- [ ] **Step 1: Update `ReviewStatusBar.vue`**

- Line 6: change `import type { ReviewStatus } from '@/config/domain/review-workflow'` to `import type { ReviewStatus } from '@/config/domain/types'`
- Line 65-66: change direct import of `REVIEW_STEPS` from `'@/config/domain/review-workflow'` to use `getModeReviewSteps` from `'@/config/domain'`
- Import `appMode` from `@/composables/useAppMode`
- Replace `REVIEW_STEPS` usage with `getModeReviewSteps(appMode.value)`

- [ ] **Step 2: Update `TaskForm.vue`**

- Line 175: change `import type { ReviewStatus, ChecklistItem } from '@/config/domain'` to `import type { ReviewStatus, ChecklistItem } from '@/config/domain/types'`

- [ ] **Step 3: Update `TraceabilitySection.vue`**

- Line 71: change import of `REQUIREMENT_LEVELS, getLevelsForRole` from `'@/config/domain'`
- In task mode, this component should show `TASK_LEVELS` instead — import `appMode` and conditionally use design or task levels
- Or: create a resolver function `getModeLevels(mode, role)` in `mode-config.ts` and use that

- [ ] **Step 4: Update `exportFormats.ts`**

- Line 2: change import path from `'@/config/domain/review-workflow'` to `'@/config/domain/types'`

- [ ] **Step 5: Update `App.vue`**

- Line 225: change `buildElicitationPrompt` import from `'@/config/domain'` to use `getModeElicitationPrompt` from `'@/config/domain'`
- Import `appMode` from `@/composables/useAppMode`
- Line ~647: inline import `import('@/config/domain/traceability').RequirementLevel` → use re-exported type from `'@/config/domain'` instead
- Line ~751: `buildElicitationPrompt(role, lang)` → `getModeElicitationPrompt(appMode.value, role, lang)`

- [ ] **Step 6: Verify build compiles**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/components/form/ReviewStatusBar.vue src/components/form/TaskForm.vue src/components/form/TraceabilitySection.vue src/utils/exportFormats.ts src/App.vue
git commit -m "refactor: update components to use mode-aware config resolver"
```

---

## Task 7: Update DevTools for task-mode skill editing

**Files:**
- Modify: `src/components/dev/DevTools.vue`

- [ ] **Step 1: Add task coach skill editing**

In `DevTools.vue`, add a section for editing the task-mode coach skill:
- Import `getCoachSkillTaskRaw`, `setCoachSkillTask`, `resetCoachSkillTask`, `coachSkillTaskModified` from `@/config/skills`
- Add a textarea and reset button for task coach skill, similar to existing coach skill editor
- Label it "Task Coach Skill" to distinguish from "Design Coach Skill"
- Show only when `appMode === 'task'` or always show both with clear labels

- [ ] **Step 2: Verify build compiles**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dev/DevTools.vue
git commit -m "feat: add task-mode coach skill editing in DevTools"
```

---

## Task 8: Version bump and changelog

**Files:**
- Modify: `src/components/layout/AppHeader.vue`
- Modify: `PLAN.md`

- [ ] **Step 1: Bump version in AppHeader.vue**

Update `<span class="header-version">vX.XX</span>` to the next version number.

- [ ] **Step 2: Update PLAN.md**

Append a new version section at the bottom with:
- Design rationale: independent mode-specific configs for maintainability
- Changes list: renamed files, new task config files, resolver, task coach skills, updated consumers
- Modified files table

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppHeader.vue PLAN.md
git commit -m "docs: vX.XX changelog — mode-specific config split"
```

---

## Task 9: Final verification

- [ ] **Step 1: Full build check**

```bash
npm run build
```

- [ ] **Step 2: Manual test — Design mode**

Switch to Design mode. Verify:
- Coach panel uses requirement-focused skill
- INCOSE quality checks fire on descriptions
- Review workflow shows ASPICE-style checklists
- Traceability section shows ASPICE hierarchy
- Elicitation prompt uses requirement questions

- [ ] **Step 3: Manual test — Task mode**

Switch to Task mode. Verify:
- Coach panel uses task-focused skill
- Task quality checks fire (actionable, scoped, complete, acceptance)
- Review workflow shows task-oriented checklists
- Traceability section shows epic/story/task hierarchy
- Elicitation prompt uses task-scoping questions

- [ ] **Step 4: Manual test — Explore mode**

Switch to Explore mode. Verify:
- Coach is disabled (no skill loaded)
- No crashes from resolver calls
