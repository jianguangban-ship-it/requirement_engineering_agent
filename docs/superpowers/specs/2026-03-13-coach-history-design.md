# Coach History — Global Q&A Record Storage with Bubble & Badge UI

## Overview

Add persistent global history to the coach response panel. Every message (user and coach) is stored as an individual record with a random hash ID and timestamp. Users can browse, search, filter, replay, delete, and download past records in raw format (JSON or Markdown).

## Architecture: localStorage Composable (Approach A)

Follows existing project patterns (`useTicketHistory.ts`, `useForm.ts`). A new `useCoachHistory.ts` composable manages all CRUD, search, cap enforcement, and export logic against `localStorage`.

## Data Model

`CoachHistoryRecord` is derived from the existing `ChatMessage` type, dropping the ephemeral `isStreaming` field:

```typescript
// Relationship to existing ChatMessage: Omit<ChatMessage, 'isStreaming'>
interface CoachHistoryRecord {
  id: string              // 8-char random hex via crypto.getRandomValues()
  role: 'user' | 'assistant'
  content: string         // raw unrendered content (no HTML, no markdown processing)
  timestamp: number       // Date.now() at creation
}
```

`formattedTime` is **not stored** — it is computed at render time via a utility function `formatTime(ts: number): string` returning `"YYYY-MM-DD HH:mm:ss"`. This avoids redundancy and matches how `ChatBubble.vue` already computes `timeLabel`.

- **Storage key**: `coach-history`
- **Ordering**: Newest first
- **Cap**: 200 records max, FIFO eviction (oldest removed when cap exceeded)
- **Warning threshold**: 180 records — subtle badge on History tab showing "180/200"

## Hash Generation

```typescript
function generateHashId(existingIds: Set<string>): string {
  let id: string
  do {
    const bytes = new Uint8Array(4)
    crypto.getRandomValues(bytes)
    id = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  } while (existingIds.has(id))
  return id
}
// Output example: "a3f9c2b7"
// Re-rolls on collision (theoretically negligible but safely handled)
```

## UI Design

### Tab Bar

CoachPanel gains a secondary tab row **below the existing PanelShell header-actions row** (which contains model badge, skill toggles, copy button). The tabs sit above the chat-container content area.

- **Chat** (default) — existing live conversation, unchanged
- **History** — browsable record list

Tab state is local (not persisted), defaults to Chat on page load.

### Chat Tab (Existing — Enhanced Bubbles)

Each message bubble displays three badges:
1. **Role tag**: `USER` (green `#4ade80` on `#2a4a3a`) or `COACH` (blue `#7eb8ff` on `#1a3a5a`)
2. **Timestamp**: `YYYY-MM-DD HH:mm:ss` in muted gray
3. **Hash ID**: Monospace, truncated 8-char, dimmed (e.g. `#a3f9c2b7`)

Bubble layout: Avatar (U/C circle) → badge row → rounded content area with role-colored background.

### History Tab

#### Search & Filter Bar
- Text input: case-insensitive content search, debounced at 150ms
- Role dropdown: All / User / Coach
- (No date range picker — keep it simple; chronological scroll is sufficient)

#### Action Bar
- Shows count of selected records (e.g. "3 selected")
- **Delete**: Remove selected records (confirm via existing `ConfirmDialog.vue`)
- **Download Raw**: Opens format picker modal. Exports selected records if any are selected; exports all records if none selected.
- **Clear All**: Wipe entire history (confirm via existing `ConfirmDialog.vue`)

#### Record List
- Each record is a compact card with:
  - Checkbox for multi-select
  - Role badge + timestamp + hash ID (same badge style as Chat tab)
  - Content preview (truncated to ~2 lines)
  - **Replay** button (USER records only) — emits `replay` event with content up to `CoachPanel.vue`, which emits to `App.vue` to populate the form description field and auto-trigger `handleCoachRequest()`. Switches to Chat tab.

### Download Modal (Compact)

Centered modal dialog with three format options:
1. **JSON** — `{ }` icon, blue — exports array of `CoachHistoryRecord` objects
2. **Markdown** — `MD` icon, purple — exports each record as headed section with `---` dividers
3. **Both** — `⇊` icon, green — downloads both files

File naming: `coach-history-YYYY-MM-DD.json` / `coach-history-YYYY-MM-DD.md`

#### JSON Format
```json
[
  {
    "id": "a3f9c2b7",
    "role": "user",
    "content": "How to estimate lateral acceleration...",
    "timestamp": 1741858327000
  }
]
```

#### Markdown Format
```markdown
### USER — 2026-03-13 14:32:07 (#a3f9c2b7)

How to estimate lateral acceleration...

---

### COACH — 2026-03-13 14:32:15 (#b7e2d1f4)

**Lateral acceleration estimation**

The lateral acceleration can be estimated using: a_y = v^2 / R ...

---
```

## Record Lifecycle

1. **User sends message** → immediately saved to coach history
2. **Coach response completes** → saved when `isStreaming` flips to `false` **on normal completion only**
3. **Records persist** independently of the live conversation — history is the permanent archive, live chat is the ephemeral session

### Save Policy (What Gets Saved)

| Scenario | Save to history? |
|----------|-----------------|
| User sends message | Yes, immediately |
| Coach response completes normally | Yes, when `isStreaming` → `false` and `content` is non-empty |
| User cancels/aborts mid-stream | **No** — partial content is discarded from history |
| 429 rate limit (placeholder popped for retry) | **No** — no content to save |
| Generic error (empty/failed response) | **No** — only save substantive content |

## Storage & Cap Enforcement

- On each `addRecord()` call: check `records.length >= 200`, if so remove oldest (last in array since newest-first)
- At 180+ records: History tab shows warning badge `"180/200"` next to tab title
- `localStorage` size: 200 records × ~500 bytes avg ≈ 100KB — well within limits

## New Files

| File | Purpose |
|------|---------|
| `src/composables/useCoachHistory.ts` | Composable: CRUD, search, filter, cap, export |
| `src/components/coach/CoachHistoryTab.vue` | History tab UI: record list, search, filters, actions |
| `src/components/coach/DownloadModal.vue` | Format picker modal (JSON / Markdown / Both) |

## Modified Files

| File | Change |
|------|--------|
| `src/components/panels/CoachPanel.vue` | Add tab bar, toggle between Chat and History tab |
| `src/components/chat/ChatBubble.vue` | Add hash ID badge to existing bubble layout |
| `src/composables/useLLM.ts` | Push record to coach history when message completes |
| `src/types/api.ts` | Add `CoachHistoryRecord` interface |

## Composable Pattern

`useCoachHistory.ts` uses the **singleton pattern** (module-level `ref()`) matching `useTicketHistory.ts`, since history is global — not per-component. Exports named functions (`addRecord`, `deleteRecords`, `clearHistory`, `searchRecords`, `exportRecords`, etc.) rather than returning from a factory.

## i18n Keys

New strings required in both `src/i18n/en.ts` and `src/i18n/zh.ts`:

| Key | EN | ZH |
|-----|----|----|
| `coach.tabs.chat` | Chat | 对话 |
| `coach.tabs.history` | History | 历史记录 |
| `coach.history.search` | Search messages... | 搜索消息... |
| `coach.history.filterAll` | All | 全部 |
| `coach.history.filterUser` | User | 用户 |
| `coach.history.filterCoach` | Coach | 教练 |
| `coach.history.selected` | {n} selected | 已选择 {n} 条 |
| `coach.history.delete` | Delete | 删除 |
| `coach.history.downloadRaw` | Download Raw | 下载原始数据 |
| `coach.history.clearAll` | Clear All | 清空全部 |
| `coach.history.replay` | Replay | 重新发送 |
| `coach.history.capWarning` | {n}/200 | {n}/200 |
| `coach.download.title` | Download {n} records | 下载 {n} 条记录 |
| `coach.download.chooseFormat` | Choose export format | 选择导出格式 |
| `coach.download.json` | JSON | JSON |
| `coach.download.jsonDesc` | Raw structured data with metadata | 含元数据的结构化数据 |
| `coach.download.markdown` | Markdown | Markdown |
| `coach.download.markdownDesc` | Human-readable with raw content | 人类可读的原始内容 |
| `coach.download.both` | Both | 两者都下载 |
| `coach.download.cancel` | Cancel | 取消 |

## Markdown Export Separator

To avoid ambiguity with `---` horizontal rules that may appear inside coach content, the Markdown export uses a distinctive separator:

```markdown
<!-- ====== RECORD BOUNDARY ====== -->
```

## Out of Scope

- Per-ticket history (only global)
- Date range picker in filters (chronological scroll sufficient for 200 records)
- Cross-tab sync
- Backend/API storage
- IndexedDB (localStorage sufficient for 200-record cap)
- Keyboard accessibility (tab/arrow navigation) — deferred to future iteration
