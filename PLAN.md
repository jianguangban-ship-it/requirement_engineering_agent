# Redesign Plan: JIRA AI-Powered Task Workstation v8.0

## Analysis of Current Application

The existing app is a **single HTML file (~1200 lines)** that bundles:
- Vue 3 (from CDN)
- Tailwind CSS (from CDN)
- All logic, styles, config, and i18n in one file

**Current features:**
1. Three-column layout: AI Coach | Task Form | AI Review + JIRA Response
2. Structured 5-part task summary builder (Vehicle/Product/Layer/Component/Detail)
3. Searchable assignee combobox with team filtering
4. AI Coach guidance with quick-action template chips
5. AI Agent analysis + JIRA ticket creation (2-step workflow)
6. Quality score progress bar with live preview
7. i18n (EN/ZH), Test/Prod mode toggle
8. JSON response panels with syntax highlighting

**Problems to solve:**
- Depends on CDN (Vue, Tailwind) — cannot run offline
- Monolithic single file — hard to maintain
- No type safety
- Limited interactivity and UX polish

---

## Technology Choice: TypeScript + Vite + Vue 3

**Why TypeScript over plain JavaScript:**
- Type safety for complex form state, API payloads, and config data
- Better IDE autocomplete for the large team/project configuration objects
- Catches errors at build time (e.g., wrong payload shape sent to webhook)
- Better maintainability as the project grows

**Stack:**
| Layer | Choice | Reason |
|-------|--------|--------|
| Language | **TypeScript** | Type safety, maintainability |
| Framework | **Vue 3 + Composition API** | Already familiar from current code, SFC support |
| Build Tool | **Vite** | Fast dev server, zero-config TS support, bundles everything locally |
| Styling | **CSS Modules + CSS Custom Properties** | No CDN needed, scoped styles per component |
| Icons | **Inline SVG components** | No external icon library needed |
| State | **Vue Reactivity (ref/reactive)** | Already used, no extra library needed |

**All dependencies installed locally via npm — zero internet needed at runtime.**

---

## New Project Structure

```
requirement_engineering_agent/
├── index.html                    # Entry HTML (minimal shell)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts                   # App bootstrap
│   ├── App.vue                   # Root layout component
│   ├── styles/
│   │   ├── variables.css         # CSS custom properties (theme tokens)
│   │   ├── global.css            # Base styles, scrollbar, animations
│   │   └── transitions.css       # Vue transition classes
│   ├── i18n/
│   │   ├── index.ts              # i18n composable (useI18n)
│   │   ├── en.ts                 # English translations
│   │   └── zh.ts                 # Chinese translations
│   ├── config/
│   │   ├── projects.ts           # PROJECT_CONFIG, TEAM_MEMBERS
│   │   ├── constants.ts          # TASK_TYPES, FIBONACCI, VEHICLE/PRODUCT/LAYER options
│   │   └── webhook.ts            # WEBHOOK_CONFIG, URL mode logic
│   ├── types/
│   │   ├── form.ts               # FormState, SummaryState interfaces
│   │   ├── api.ts                # Payload, AIResponse, JiraResponse types
│   │   └── team.ts               # TeamMember, Project interfaces
│   ├── composables/
│   │   ├── useForm.ts            # Form state, validation, quality score
│   │   ├── useWebhook.ts         # API call logic (analyze, create, coach)
│   │   ├── useCombobox.ts        # Searchable dropdown logic
│   │   └── useToast.ts           # Toast notification system
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue     # Header with lang/mode toggles
│   │   │   └── PanelShell.vue    # Reusable panel wrapper (header + body + resize)
│   │   ├── form/
│   │   │   ├── TaskForm.vue      # Main form container
│   │   │   ├── BasicInfoSection.vue    # Project, Assignee, Type, Points
│   │   │   ├── SummaryBuilder.vue      # 5-part summary with live preview
│   │   │   ├── DescriptionEditor.vue   # Description textarea with templates
│   │   │   ├── AssigneeCombobox.vue    # Searchable assignee selector
│   │   │   ├── StoryPointsPicker.vue   # Fibonacci point selector
│   │   │   └── QualityMeter.vue        # Quality score bar + label
│   │   ├── panels/
│   │   │   ├── CoachPanel.vue          # AI Coach panel (left)
│   │   │   ├── AIReviewPanel.vue       # AI Agent review panel (right)
│   │   │   ├── JiraResponsePanel.vue   # JIRA creation result (right)
│   │   │   └── ProcessingSummary.vue   # Summary card after analysis
│   │   ├── shared/
│   │   │   ├── StatusDot.vue           # Animated status indicator
│   │   │   ├── JsonViewer.vue          # Syntax-highlighted JSON display
│   │   │   ├── IconButton.vue          # Reusable icon button
│   │   │   ├── ToastContainer.vue      # Toast notification overlay
│   │   │   └── QuickChip.vue           # Quick action chip button
│   │   └── dev/
│   │       └── DevTools.vue            # Payload viewer + webhook config (collapsible)
│   └── utils/
│       ├── formatJson.ts         # JSON syntax highlighting
│       ├── formatCoach.ts        # Coach response markdown→HTML parser
│       └── validators.ts         # Form validation helpers
```

---

## UI/UX Redesign Ideas

### 1. Improved Layout (Responsive Three-Column)

```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo] JIRA AI Task Workstation v8.0     [EN|中文] [Test|Prod] │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ AI Coach ──────┐  ┌─ Task Form ───────┐  ┌─ AI Review ───┐ │
│  │                  │  │ ┌──────────────┐  │  │               │ │
│  │  Guidance &      │  │ │ Basic Info   │  │  │  AI Agent     │ │
│  │  Suggestions     │  │ │ Project|Type │  │  │  Response     │ │
│  │                  │  │ │ Assignee     │  │  │               │ │
│  │  [Quick Chips]   │  │ └──────────────┘  │  ├───────────────┤ │
│  │                  │  │ ┌──────────────┐  │  │               │ │
│  │  ─ ─ ─ ─ ─ ─ ─  │  │ │ Summary      │  │  │  JIRA Result  │ │
│  │                  │  │ │ [5-part]     │  │  │               │ │
│  │  Coach response  │  │ │ Live Preview │  │  ├───────────────┤ │
│  │  with formatted  │  │ │ Quality ████ │  │  │  Summary Card │ │
│  │  markdown        │  │ └──────────────┘  │  │  Points|Tasks │ │
│  │                  │  │ ┌──────────────┐  │  │               │ │
│  │                  │  │ │ Description  │  │  ├───────────────┤ │
│  │                  │  │ │              │  │  │ ▶ Dev Tools   │ │
│  │                  │  │ └──────────────┘  │  │   (collapsed) │ │
│  │ [Get Guidance]   │  │ [Reset] [Analyze] │  │               │ │
│  └──────────────────┘  │         [Create]  │  └───────────────┘ │
│                        └───────────────────┘                     │
├──────────────────────────────────────────────────────────────────┤
│  Toast notifications appear here (bottom-right, auto-dismiss)    │
└──────────────────────────────────────────────────────────────────┘
```

### 2. New Interactive Features

| Feature | Description |
|---------|-------------|
| **Toast Notifications** | Replace inline error banner with stackable toasts (success/error/warning) that auto-dismiss after 5s. Less intrusive, won't shift layout. |
| **Keyboard Shortcuts** | `Ctrl+Enter` = Submit/Analyze, `Ctrl+Shift+Enter` = Create JIRA, `Escape` = Close dropdowns. Shortcut hints shown on buttons. |
| **Form Section Collapse** | Each form section (Basic Info, Summary, Description) can be collapsed/expanded. Sections auto-expand when incomplete. |
| **Smooth Transitions** | Vue `<Transition>` for panel content changes, dropdown open/close, button state changes. |
| **Better Loading States** | Skeleton placeholders instead of spinner-only states in panels. Shows progress context. |
| **Confirmation Dialog** | Before JIRA creation ("Confirm Create"), show a modal with payload summary for final review. |
| **Auto-save Draft** | Form state persisted to `localStorage`. Restore on page reload with "Resume draft?" prompt. |
| **Resizable Panels** | CSS `resize` handle on coach and review panels (kept from original, improved with drag handle visual). |
| **Copy to Clipboard** | One-click copy for JSON payloads, JIRA ticket IDs, and formatted summaries. |

### 3. Visual Design Improvements

- **Consistent spacing**: 8px grid system instead of mixed px values
- **Better color contrast**: Ensure WCAG AA compliance for all text
- **Subtle gradients**: Header and panel headers use subtle gradient backgrounds
- **Focus indicators**: Clear focus rings for accessibility (keyboard navigation)
- **Empty states**: Illustrated empty states with contextual guidance (not just text)
- **Button hierarchy**: Primary (filled) → Secondary (outlined) → Ghost (text-only)
- **Micro-animations**: Button press scale, input focus glow, status dot pulse

---

## Implementation Steps

### Step 1: Project Scaffolding
- Initialize Vite + Vue 3 + TypeScript project
- Install all dependencies locally (vue, typescript, vite)
- Configure `tsconfig.json`, `vite.config.ts`
- Create directory structure

### Step 2: Type Definitions & Config
- Define TypeScript interfaces (`FormState`, `TeamMember`, `Project`, `APIPayload`, etc.)
- Migrate `PROJECT_CONFIG`, `TEAM_MEMBERS`, constants to typed config files
- Migrate `WEBHOOK_CONFIG` with typed URL mode logic

### Step 3: Core Composables
- `useI18n()` — reactive language switching with typed translation keys
- `useForm()` — form state, computed summary, quality score, validation
- `useWebhook()` — API calls (analyze, create, coach) with error handling
- `useCombobox()` — dropdown state, filtering, keyboard navigation
- `useToast()` — toast notification queue with auto-dismiss

### Step 4: Shared Components
- `PanelShell.vue` — reusable wrapper with header, status dot, resizable body
- `StatusDot.vue`, `JsonViewer.vue`, `QuickChip.vue`, `IconButton.vue`
- `ToastContainer.vue` — fixed-position toast overlay

### Step 5: Form Components
- `AssigneeCombobox.vue` — searchable dropdown with highlight matching
- `SummaryBuilder.vue` — 5-part inputs + live preview + quality meter
- `DescriptionEditor.vue` — textarea with template chip insertion
- `StoryPointsPicker.vue` — Fibonacci button group
- `BasicInfoSection.vue` — project select, assignee, type
- `TaskForm.vue` — orchestrates all form sections

### Step 6: Panel Components
- `CoachPanel.vue` — AI coach with chips, loading state, formatted response
- `AIReviewPanel.vue` — AI analysis JSON display
- `JiraResponsePanel.vue` — JIRA creation result
- `ProcessingSummary.vue` — summary card with corrected points, subtask count
- `DevTools.vue` — collapsible payload viewer + webhook config

### Step 7: Layout & App Shell
- `AppHeader.vue` — logo, title, lang toggle, mode toggle, status badge
- `App.vue` — three-column grid layout, responsive breakpoints
- Global styles: CSS variables, animations, transitions

### Step 8: Polish & Testing
- Add keyboard shortcuts (`Ctrl+Enter`, etc.)
- Add localStorage draft auto-save/restore
- Add `<Transition>` animations on panel content
- Cross-browser test (Chrome, Firefox, Edge)
- Verify fully offline operation (no network requests for assets)

---

## How to Run Locally

After implementation, the user runs:

```bash
# Install dependencies (one-time, requires internet)
npm install

# Start dev server (no internet needed after install)
npm run dev
# → opens http://localhost:5173

# Build for production (static files, no server needed)
npm run build
# → outputs to dist/ folder, open dist/index.html
```

---

## Summary

| Aspect | Current | Redesigned |
|--------|---------|------------|
| Files | 1 HTML (1200 lines) | ~30 focused files |
| Language | JavaScript | TypeScript |
| Dependencies | CDN (online) | npm (local) |
| Styling | Inline + Tailwind CDN | CSS Modules + Custom Properties |
| Components | Monolithic | 15+ SFC components |
| Error handling | Inline banner | Toast notifications |
| State persistence | None | localStorage draft |
| Accessibility | Minimal | Keyboard shortcuts, focus rings |
| Build | None | Vite (instant HMR) |
