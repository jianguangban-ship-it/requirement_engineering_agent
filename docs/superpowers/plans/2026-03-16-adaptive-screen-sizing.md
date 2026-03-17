# Adaptive Screen Sizing Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the UI proportionally scale across all screen sizes — small laptops (1366x768) through 4K monitors (3840x2160) — keeping all 3 columns visible at every size.

**Architecture:** CSS-only adaptive scaling using `clamp()` with linear interpolation (`calc(A + Bvw)` form). Each CSS variable scales linearly with viewport width, calibrated so 1920px = current baseline values. No JS screen detection needed. The existing drag-resize system and `fr`-based grid stay intact.

**Tech Stack:** CSS custom properties + `clamp()` — no new dependencies.

---

## Design Principles

1. **All 3 columns always visible** — never collapse or hide panels
2. **Proportional scaling** — spacing, fonts, and element sizes scale together
3. **1920px = baseline** — current production appearance preserved at 1920px
4. **No JS detection** — CSS `clamp()` + viewport units handle everything
5. **Preserve drag-resize** — the existing `colFractions` + drag handle system stays

## Strategy: Linear Interpolation via `clamp()`

Each variable uses `clamp(min, calc(intercept + slope * vw), max)` where the slope is calculated so that at 1920px viewport width, the value equals the current baseline.

**Math for each variable:**
- Given: baseline value `B` at 1920px, minimum `Bmin` at 1366px (0.75x), maximum `Bmax` at 3840px (clamp)
- slope = (B - Bmin) / (19.20 - 13.66) = (B - Bmin) / 5.54 (in vw units)
- intercept = Bmin - slope * 13.66

```
Screen width    Example (--space-4)
-------------   -------------------
1366px          12px  (min, 0.75x)
1920px          16px  (baseline, 1.0x)
2560px          ~21px (scales up)
3840px          22px  (clamped max)
```

**CSS validity note:** `calc(Apx + Bvw)` is valid because both terms are `<length>` types that CSS can add. This avoids the invalid `px * vw` multiplication.

---

## Chunk 1: Core Adaptive Variables

### Task 1: Add adaptive fluid variables to `variables.css`

**Files:**
- Modify: `src/styles/variables.css`

- [ ] **Step 1: Add a theme-independent `:root` block at the top of `variables.css` with all fluid sizing variables**

Insert before the existing `:root, [data-theme="dark"]` block:

```css
/* ── Adaptive sizing (theme-independent) ──
   Each variable scales linearly with viewport width using clamp(min, calc(A + Bvw), max).
   Calibrated so 1920px viewport = current baseline values.
   Math: slope = (baseline - min) / 5.54;  intercept = min - slope * 13.66
*/
:root {
  /* Fluid spacing scale */
  --space-1: clamp(3px,  calc(0.53px  + 0.181vw), 6px);
  --space-2: clamp(6px,  calc(1.07px  + 0.361vw), 11px);
  --space-3: clamp(9px,  calc(1.60px  + 0.542vw), 16px);
  --space-4: clamp(12px, calc(2.14px  + 0.722vw), 22px);
  --space-5: clamp(15px, calc(2.67px  + 0.903vw), 27px);
  --space-6: clamp(18px, calc(3.21px  + 1.083vw), 32px);

  /* Fluid typography scale */
  --font-xs:   clamp(9px,  calc(6.53px  + 0.181vw), 14px);
  --font-sm:   clamp(10px, calc(7.53px  + 0.181vw), 15px);
  --font-base: clamp(11px, calc(8.53px  + 0.181vw), 16px);
  --font-md:   clamp(12px, calc(9.53px  + 0.181vw), 18px);
  --font-lg:   clamp(13px, calc(10.53px + 0.181vw), 19px);
  --font-xl:   clamp(14px, calc(9.07px  + 0.361vw), 22px);

  /* Fluid icon sizes */
  --icon-sm: clamp(14px, calc(4.14px  + 0.722vw), 24px);
  --icon-md: clamp(16px, calc(6.14px  + 0.722vw), 27px);

  /* Fluid element sizing */
  --avatar-size:   clamp(26px, calc(6.28px  + 1.444vw), 46px);
  --sidebar-width: clamp(48px, calc(8.55px  + 2.888vw), 86px);
}
```

- [ ] **Step 2: Remove the old static `--space-1` through `--space-6` from both theme blocks**

In the `:root, [data-theme="dark"]` block (lines 39-44), delete:
```css
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
```

These are now defined in the new theme-independent `:root` block above.

- [ ] **Step 3: Verify the CSS parses correctly**

Run: `cd E:/smart_agent && npx vite build --mode development 2>&1 | head -20`
Expected: No CSS parse errors. The spacing variables are already consumed by components, so the app should render normally.

- [ ] **Step 4: Commit**

```bash
git add src/styles/variables.css
git commit -m "feat: add fluid adaptive sizing variables with clamp()"
```

---

### Task 2: Update `App.vue` main layout to use adaptive variables

**Files:**
- Modify: `src/App.vue` (scoped styles, lines 605-765)

- [ ] **Step 1: Replace hardcoded padding in `.app-main`**

| Selector | Old | New |
|----------|-----|-----|
| `.app-main` padding | `24px` | `var(--space-6)` |
| `.app-main` max-width | `2000px` | `clamp(1200px, 95vw, 3600px)` |

- [ ] **Step 2: Replace hardcoded sizes in modal styles**

| Selector | Old | New |
|----------|-----|-----|
| `.modal-overlay` padding | `24px` | `var(--space-6)` |
| `.modal-content` padding | `24px` | `var(--space-6)` |
| `.modal-content` max-width | `600px` | `clamp(400px, 35vw, 700px)` |
| `.modal-content` gap | `16px` | `var(--space-4)` |
| `.modal-title` font-size | `16px` | `var(--font-xl)` |
| `.modal-hint` font-size | `13px` | `var(--font-md)` |
| `.modal-payload` padding | `12px` | `var(--space-3)` |
| `.modal-actions` gap | `12px` | `var(--space-3)` |
| `.btn` gap | `8px` | `var(--space-2)` |
| `.btn` padding | `8px 20px` | `var(--space-2) var(--space-5)` |
| `.btn` font-size | `14px` | `var(--font-lg)` |

- [ ] **Step 3: Add proportional min-width constraints to grid columns**

Replace the existing `.col-left`, `.col-center`, `.col-right` rules. Remove the dead `min-width: 0` and add fluid min-widths:

```css
.col-left {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: clamp(200px, 15vw, 400px);
}

.col-center {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: clamp(250px, 20vw, 500px);
}

.col-right {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: clamp(150px, 12vw, 350px);
}
```

- [ ] **Step 4: Fix focus mode conflict — override min-width on `.col-right` when hidden**

The `.layout-focus` class sets `grid-template-columns: 5fr 6px 3fr 0px 0fr` which gives `.col-right` zero width. But the new `min-width: clamp(...)` would fight this. Add an override:

```css
.grid-layout.layout-focus .col-right {
  min-width: 0;
  overflow: hidden;
}
```

- [ ] **Step 5: Verify build**

Run: `cd E:/smart_agent && npx vite build --mode development 2>&1 | head -20`

- [ ] **Step 6: Commit**

```bash
git add src/App.vue
git commit -m "style: use adaptive CSS variables and grid constraints in App.vue"
```

---

### Task 3: Update `AppHeader.vue` to use adaptive variables

**Files:**
- Modify: `src/components/layout/AppHeader.vue` (lines 89-249)

- [ ] **Step 1: Replace all hardcoded pixel values with CSS variables**

| Selector | Old | New |
|----------|-----|-----|
| `.app-header` padding | `12px 24px` | `var(--space-3) var(--space-6)` |
| `.header-left` gap | `12px` | `var(--space-3)` |
| `.traffic-lights` gap | `8px` | `var(--space-2)` |
| `.dot` width/height | `12px` | `var(--space-3)` |
| `.header-title` font-size | `14px` | `var(--font-lg)` |
| `.header-version` font-size | `12px` | `var(--font-base)` |
| `.header-right` gap | `12px` | `var(--space-3)` |
| `.toggle-group` gap | `4px` | `var(--space-1)` |
| `.toggle-group` padding | `4px` | `var(--space-1)` |
| `.toggle-btn` padding | `4px 8px` | `var(--space-1) var(--space-2)` |
| `.toggle-btn` font-size | `11px` | `var(--font-sm)` |
| `.toggle-btn` gap | `4px` | `var(--space-1)` |
| `.mode-dot` width/height | `6px` | `calc(var(--space-1) * 1.5)` |
| `.status-badge` font-size | `12px` | `var(--font-base)` |
| `.status-badge` padding | `4px 8px` | `var(--space-1) var(--space-2)` |
| `.status-badge` gap | `6px` | `calc(var(--space-1) * 1.5)` |
| `.status-pulse` width/height | `6px` | `calc(var(--space-1) * 1.5)` |
| `.theme-btn` width/height | `30px` | `clamp(24px, calc(2.14px + 1.444vw), 40px)` |
| `.theme-btn svg` width/height | `14px` | `var(--icon-sm)` |
| `.settings-btn` width/height | `30px` | `clamp(24px, calc(2.14px + 1.444vw), 40px)` |
| `.settings-btn` font-size | `15px` | `var(--icon-sm)` |

- [ ] **Step 2: Verify build**

Run: `cd E:/smart_agent && npx vite build --mode development 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppHeader.vue
git commit -m "style: use adaptive CSS variables in AppHeader"
```

---

### Task 4: Update `AppSidebar.vue` to use adaptive variables

**Files:**
- Modify: `src/components/layout/AppSidebar.vue` (lines 42-105)

- [ ] **Step 1: Replace hardcoded values**

| Selector | Old | New |
|----------|-----|-----|
| `.sidebar` width | `64px` | `var(--sidebar-width)` |
| `.sidebar` padding-top | `12px` | `var(--space-3)` |
| `.sidebar` gap | `8px` | `var(--space-2)` |
| `.sidebar-logo` margin-bottom | `12px` | `var(--space-3)` |
| `.logo-icon` font-size | `20px` | `var(--icon-md)` |
| `.logo-text` font-size | `10px` | `var(--font-xs)` |
| `.sidebar-nav` gap | `4px` | `var(--space-1)` |
| `.sidebar-nav` padding | `0 8px` | `0 var(--space-2)` |
| `.nav-btn` padding | `10px 4px` | `var(--space-2) var(--space-1)` |
| `.nav-icon` font-size | `18px` | `var(--icon-sm)` |
| `.nav-label` font-size | `10px` | `var(--font-xs)` |

Note: `.nav-btn` gap `2px` is kept as-is (too small to scale).

- [ ] **Step 2: Verify build**

Run: `cd E:/smart_agent && npx vite build --mode development 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppSidebar.vue
git commit -m "style: use adaptive CSS variables in AppSidebar"
```

---

## Chunk 2: Panel & Content Components

### Task 5: Update `PanelShell.vue` to use adaptive variables

**Files:**
- Modify: `src/components/layout/PanelShell.vue` (lines 68-136)

- [ ] **Step 1: Replace hardcoded values**

| Selector | Old | New |
|----------|-----|-----|
| `.panel-header` padding | `12px 16px` | `var(--space-3) var(--space-4)` |
| `.panel-title` gap | `8px` | `var(--space-2)` |
| `.title-text` font-size | `14px` | `var(--font-lg)` |
| `.panel-right` gap | `12px` | `var(--space-3)` |
| `.panel-status` gap | `8px` | `var(--space-2)` |
| `.status-label` font-size | `12px` | `var(--font-base)` |
| `.panel-body` padding | `12px` | `var(--space-3)` |
| `.panel-footer` padding | `12px` | `var(--space-3)` |

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/PanelShell.vue
git commit -m "style: use adaptive CSS variables in PanelShell"
```

---

### Task 6: Update `coach-response.css` to use adaptive variables

**Files:**
- Modify: `src/styles/coach-response.css` (lines 1-138)

- [ ] **Step 1: Replace heading font sizes**

| Selector | Old | New |
|----------|-----|-----|
| `h1, h2` font-size | `14px` | `var(--font-lg)` |
| `h1, h2` margin | `12px 0 6px` | `var(--space-3) 0 calc(var(--space-1) * 1.5)` |
| `h3` font-size | `13px` | `var(--font-md)` |
| `h3` margin | `10px 0 5px` | `var(--space-2) 0 var(--space-1)` |
| `h4-h6` font-size | `12px` | `var(--font-base)` |
| `h4-h6` margin | `8px 0 4px` | `var(--space-2) 0 var(--space-1)` |

- [ ] **Step 2: Replace paragraph, list, code, and table sizes**

| Selector | Old | New |
|----------|-----|-----|
| `p` margin | `0 0 6px` | `0 0 calc(var(--space-1) * 1.5)` |
| `code` padding | `2px 6px` | `2px calc(var(--space-1) * 1.5)` |
| `code` font-size | `12px` | `var(--font-base)` |
| `pre` padding | `10px 12px` | `var(--space-2) var(--space-3)` |
| `pre` margin | `6px 0` | `calc(var(--space-1) * 1.5) 0` |
| `ul/ol` padding-left | `20px` | `var(--space-5)` |
| `ul/ol` margin | `4px 0` | `var(--space-1) 0` |
| `blockquote` padding | `4px 10px` | `var(--space-1) var(--space-2)` |
| `blockquote` margin | `6px 0` | `calc(var(--space-1) * 1.5) 0` |
| `table` font-size | `12px` | `var(--font-base)` |
| `table` margin | `8px 0` | `var(--space-2) 0` |
| `th` padding | `6px 10px` | `calc(var(--space-1) * 1.5) var(--space-2)` |
| `td` padding | `5px 10px` | `var(--space-1) var(--space-2)` |
| `hr` margin | `10px 0` | `var(--space-2) 0` |

Note: `li` margin `2px 0` kept as-is (too small to scale).

- [ ] **Step 3: Replace coach-specific element sizes**

| Selector | Old | New |
|----------|-----|-----|
| `.coach-status-badge` font-size | `12px` | `var(--font-base)` |
| `.coach-status-badge` gap | `5px` | `var(--space-1)` |
| `.coach-status-badge` margin-bottom | `8px` | `var(--space-2)` |
| `.coach-info-row` font-size | `12px` | `var(--font-base)` |
| `.coach-info-row` gap | `8px` | `var(--space-2)` |
| `.coach-main-message` margin | `6px 0` | `calc(var(--space-1) * 1.5) 0` |
| `.coach-comment-title` font-size | `12px` | `var(--font-base)` |
| `.coach-comment-title` margin-bottom | `6px` | `calc(var(--space-1) * 1.5)` |
| `.coach-issues-list` gap | `5px` | `var(--space-1)` |
| `.coach-issue-item` gap | `8px` | `var(--space-2)` |
| `.coach-issue-num` min-width/height | `18px` | `var(--icon-sm)` |
| `.coach-issue-num` font-size | `10px` | `var(--font-xs)` |
| `.coach-issue-text` font-size | `12px` | `var(--font-base)` |

- [ ] **Step 4: Verify build**

- [ ] **Step 5: Commit**

```bash
git add src/styles/coach-response.css
git commit -m "style: use adaptive CSS variables in coach-response.css"
```

---

### Task 7: Update `ChatBubble.vue` to use adaptive variables

**Files:**
- Modify: `src/components/chat/ChatBubble.vue`

**Actual CSS class names** (verified from source):

- [ ] **Step 1: Replace hardcoded values**

| Selector | Old | New |
|----------|-----|-----|
| `.chat-msg` gap | `10px` | `var(--space-2)` |
| `.chat-msg` margin-bottom | `16px` | `var(--space-4)` |
| `.msg-avatar` width/height | `34px` | `var(--avatar-size)` |
| `.msg-avatar-user` width/height | `34px` | `var(--avatar-size)` |
| `.msg-avatar-user svg` width/height | `20px` | `var(--icon-md)` |
| `.msg-bubble` min-width | `60px` | `60px` (keep — functional minimum) |
| `.msg-bubble` padding | `10px 14px` | `var(--space-2) var(--space-3)` |
| `.msg-role-label` gap | `8px` | `var(--space-2)` |
| `.msg-role-label` font-size | `11px` | `var(--font-sm)` |
| `.msg-role-label` margin-bottom | `4px` | `var(--space-1)` |
| `.msg-time` font-size | `10px` | `var(--font-xs)` |
| `.msg-hash` font-size | `9px` | `var(--font-xs)` |
| `.msg-user-text` font-size | `13px` | `var(--font-md)` |

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/ChatBubble.vue
git commit -m "style: use adaptive CSS variables in ChatBubble"
```

---

### Task 8: Update `global.css` to use adaptive variables

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Replace hardcoded values in input and utility styles**

| Selector | Old | New |
|----------|-----|-----|
| `.input-base` padding | `10px 14px` | `var(--space-2) var(--space-3)` |
| `.input-base` font-size | `14px` | `var(--font-lg)` |
| `::-webkit-scrollbar` width | `6px` | `calc(var(--space-1) * 1.5)` |
| `::-webkit-scrollbar` height | `6px` | `calc(var(--space-1) * 1.5)` |

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "style: use adaptive CSS variables in global.css"
```

---

## Chunk 3: Modals, Forms & Remaining Components

### Task 9: Update modal components to use adaptive variables

**Files:**
- Modify: `src/components/settings/LLMSettings.vue`
- Modify: `src/components/shared/HotkeyModal.vue`
- Modify: `src/components/shared/ConfirmDialog.vue`

- [ ] **Step 1: Update `LLMSettings.vue` modal sizing**

| Selector | Old | New |
|----------|-----|-----|
| `.modal-overlay` padding | `24px` | `var(--space-6)` |
| `.modal-content` padding | `24px` | `var(--space-6)` |
| `.modal-content` max-width | `800px` | `clamp(500px, 45vw, 900px)` |
| `.modal-content` gap | `20px` | `var(--space-5)` |
| `.modal-title` font-size | `16px` | `var(--font-xl)` |
| `.field-group` gap | `8px` | `var(--space-2)` |
| `.field-label` font-size | `13px` | `var(--font-md)` |
| `.field-input` padding | `8px 12px` | `var(--space-2) var(--space-3)` |
| `.field-input` font-size | `13px` | `var(--font-md)` |
| `.btn-test` padding | `8px 12px` | `var(--space-2) var(--space-3)` |
| `.btn-test` font-size | `12px` | `var(--font-base)` |
| `.key-badge` font-size | `11px` | `var(--font-sm)` |
| `.skill-textarea` padding | `8px 12px` | `var(--space-2) var(--space-3)` |
| `.skill-textarea` font-size | `12px` | `var(--font-base)` |
| `.skill-hint` font-size | `11px` | `var(--font-sm)` |
| `.chip-icon-preview` font-size | `16px` | `var(--font-xl)` |
| `.chip-label-preview` font-size | `12px` | `var(--font-base)` |
| `.chip-content-area` font-size | `11px` | `var(--font-sm)` |
| `.btn-add-chip` padding | `7px 12px` | `var(--space-2) var(--space-3)` |
| `.btn-add-chip` font-size | `12px` | `var(--font-base)` |
| `.btn-export` padding | `8px 12px` | `var(--space-2) var(--space-3)` |
| `.btn-export` font-size | `12px` | `var(--font-base)` |
| `.btn` padding | `8px 20px` | `var(--space-2) var(--space-5)` |
| `.btn` font-size | `14px` | `var(--font-lg)` |
| `.modal-actions` gap | `12px` | `var(--space-3)` |

- [ ] **Step 2: Update `HotkeyModal.vue` modal sizing**

| Selector | Old | New |
|----------|-----|-----|
| `.modal-overlay` padding | `24px` | `var(--space-6)` |
| `.modal-content` padding | `24px` | `var(--space-6)` |
| `.modal-content` max-width | `420px` | `clamp(300px, 25vw, 500px)` |
| `.modal-content` gap | `16px` | `var(--space-4)` |
| `.modal-title` font-size | `16px` | `var(--font-xl)` |
| `.close-btn` width/height | `28px` | `clamp(22px, calc(0.42px + 1.444vw), 38px)` |
| `.close-btn` font-size | `12px` | `var(--font-base)` |
| `.key-cell` padding | `10px 12px 10px 0` | `var(--space-2) var(--space-3) var(--space-2) 0` |
| `.desc-cell` padding | `10px 0` | `var(--space-2) 0` |
| `.desc-cell` font-size | `13px` | `var(--font-md)` |
| `.key` padding | `3px 8px` | `3px var(--space-2)` |
| `.key` font-size | `11px` | `var(--font-sm)` |

- [ ] **Step 3: Update `ConfirmDialog.vue` modal sizing**

| Selector | Old | New |
|----------|-----|-----|
| `.modal-overlay` padding | `24px` | `var(--space-6)` |
| `.modal-content` padding | `24px` | `var(--space-6)` |
| `.modal-content` max-width | `420px` | `clamp(300px, 25vw, 500px)` |
| `.modal-content` gap | `12px` | `var(--space-3)` |
| `.modal-title` font-size | `16px` | `var(--font-xl)` |
| `.modal-message` font-size | `14px` | `var(--font-lg)` |
| `.modal-actions` gap | `10px` | `var(--space-2)` |
| `.modal-actions` margin-top | `8px` | `var(--space-2)` |
| `.btn` padding | `8px 18px` | `var(--space-2) var(--space-5)` |
| `.btn` font-size | `13px` | `var(--font-md)` |

- [ ] **Step 4: Verify build**

Run: `cd E:/smart_agent && npx vite build --mode development 2>&1 | head -20`

- [ ] **Step 5: Commit**

```bash
git add src/components/settings/LLMSettings.vue src/components/shared/HotkeyModal.vue src/components/shared/ConfirmDialog.vue
git commit -m "style: use adaptive CSS variables in modal components"
```

---

### Task 10: Update form components to use adaptive variables

**Files:**
- Modify: `src/components/form/TaskForm.vue`
- Modify: `src/components/form/BasicInfoSection.vue`

- [ ] **Step 1: Update `TaskForm.vue`**

| Selector | Old | New |
|----------|-----|-----|
| `.task-form` gap | `16px` | `var(--space-4)` |
| `.error-banner` padding | `12px` | `var(--space-3)` |
| `.error-content` gap | `8px` | `var(--space-2)` |
| `.error-icon` width/height | `16px` | `var(--font-xl)` |
| `.error-text` font-size | `14px` | `var(--font-lg)` |
| `.close-icon` width/height | `16px` | `var(--font-xl)` |
| `.form-actions` padding | `16px 20px` | `var(--space-4) var(--space-5)` |
| `.action-group` gap | `8px` | `var(--space-2)` |
| `.action-btn` width/height | `36px` | `clamp(28px, calc(4.28px + 1.651vw), 48px)` |
| `.action-icon` width/height | `18px` | `var(--icon-sm)` |

- [ ] **Step 2: Update `BasicInfoSection.vue`**

| Selector | Old | New |
|----------|-----|-----|
| `.basic-info` padding | `20px` | `var(--space-5)` |
| `.section-title` font-size | `11px` | `var(--font-sm)` |
| `.section-title` margin-bottom | `12px` | `var(--space-3)` |
| `.row-2col` gap | `12px` | `var(--space-3)` |
| `.mt` margin-top | `12px` | `var(--space-3)` |
| `.field-label` font-size | `12px` | `var(--font-base)` |
| `.field-label` margin-bottom | `6px` | `calc(var(--space-1) * 1.5)` |
| `.field-select` font-size | `14px` | `var(--font-lg)` |
| `.type-buttons` gap | `8px` | `var(--space-2)` |
| `.type-btn` gap | `6px` | `calc(var(--space-1) * 1.5)` |
| `.type-btn` padding | `6px 12px` | `calc(var(--space-1) * 1.5) var(--space-3)` |
| `.type-btn` font-size | `14px` | `var(--font-lg)` |
| `.type-dot` width/height | `6px` | `calc(var(--space-1) * 1.5)` |

- [ ] **Step 3: Verify build**

Run: `cd E:/smart_agent && npx vite build --mode development 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add src/components/form/TaskForm.vue src/components/form/BasicInfoSection.vue
git commit -m "style: use adaptive CSS variables in form components"
```

---

### Task 11: Update remaining component files

**Files:**
- Modify: `src/components/defects/DefectDetail.vue`
- Modify: `src/components/shared/ToastContainer.vue`

- [ ] **Step 1: Update `DefectDetail.vue` drawer width**

Change:
```css
width: 520px;
```
To:
```css
width: clamp(360px, 30vw, 620px);
```

- [ ] **Step 2: Update `ToastContainer.vue` toast sizing**

| Selector | Old | New |
|----------|-----|-----|
| `.toast-container` bottom/right | `24px` | `var(--space-6)` |
| `.toast-item` min-width | `280px` | `clamp(220px, 18vw, 350px)` |
| `.toast-item` max-width | `420px` | `clamp(320px, 25vw, 500px)` |

- [ ] **Step 3: Verify build**

- [ ] **Step 4: Commit**

```bash
git add src/components/defects/DefectDetail.vue src/components/shared/ToastContainer.vue
git commit -m "style: use adaptive sizing in DefectDetail and ToastContainer"
```

---

## Chunk 4: Testing & Finalization

### Task 12: Visual testing across viewport sizes

- [ ] **Step 1: Start dev server**

Run: `cd E:/smart_agent && npm run dev`

- [ ] **Step 2: Test at 1366x768 (small laptop)**

Open browser DevTools -> responsive mode -> set to 1366x768.
Verify:
- All 3 columns visible and readable
- Text is not too small (minimum ~10px)
- Spacing is tighter but not cramped
- Sidebar is narrower (~48px) but icons still recognizable
- Drag handles still work
- Focus mode (right panel hidden) works without overflow

- [ ] **Step 3: Test at 1920x1080 (standard monitor — baseline)**

Set to 1920x1080.
Verify:
- Layout looks identical to current production (this IS the baseline — 1920px = scale 1.0)
- No visual regressions from before the changes
- All spacing and font sizes match pre-change values

- [ ] **Step 4: Test at 2560x1440 (QHD monitor)**

Set to 2560x1440.
Verify:
- Layout uses more horizontal space (max-width increased from 2000px)
- Text and spacing are slightly larger
- No excessive whitespace

- [ ] **Step 5: Test at 3840x2160 (4K monitor)**

Set to 3840x2160.
Verify:
- Layout fills the screen reasonably (up to 3600px max-width)
- Text is readable without zooming
- Elements are proportionally larger
- Modals scale correctly

- [ ] **Step 6: Commit any fixes needed**

---

### Task 13: Final commit and version bump

- [ ] **Step 1: Bump version in `package.json`**

Change `"version"` from current to next minor (e.g., `"8.44.0"`).

- [ ] **Step 2: Bump version in `AppHeader.vue`** (per user feedback — always keep UI version in sync)

Update the displayed version string to match.

- [ ] **Step 3: Commit**

```bash
git add package.json src/components/layout/AppHeader.vue
git commit -m "chore: bump version to 8.44.0 for adaptive screen sizing"
```

---

## Summary Table

Values at each viewport width (1920px = current baseline):

| Screen Size | --space-4 | --font-base | --font-lg | Sidebar Width |
|-------------|-----------|-------------|-----------|---------------|
| 1366x768    | 12px      | 11px        | 13px      | 48px          |
| 1920x1080   | 16px      | 12px        | 14px      | 64px          |
| 2560x1440   | 21px      | 13px        | 15px      | 82px          |
| 3840x2160   | 22px (max)| 16px (max)  | 19px (max)| 86px (max)    |

**Total files modified:** 14
**New dependencies:** None
**Breaking changes:** None — all visual, proportional scaling. 1920px baseline preserved exactly.
