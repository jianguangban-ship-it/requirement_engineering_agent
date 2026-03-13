# Coach History Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent global coach history with bubble/badge UI, search, filter, replay, delete, and download (JSON/Markdown).

**Architecture:** localStorage-based singleton composable (`useCoachHistory.ts`) following `useTicketHistory.ts` pattern. CoachPanel gains Chat/History tab switch. Each message record has an 8-char hash ID, role badge, and timestamp badge.

**Tech Stack:** Vue 3, TypeScript, localStorage, crypto.getRandomValues()

**Spec:** `docs/superpowers/specs/2026-03-13-coach-history-design.md`

---

## Chunk 1: Data Layer

### Task 1: Add CoachHistoryRecord type

**Files:**
- Modify: `src/types/api.ts:59-66`

- [ ] **Step 1: Add the CoachHistoryRecord interface after ChatMessage**

Add after line 66 in `src/types/api.ts`:

```typescript
/** A single record in the persistent global coach history */
export interface CoachHistoryRecord {
  id: string              // 8-char random hex
  role: 'user' | 'assistant'
  content: string         // raw unrendered content
  timestamp: number       // Date.now() at creation
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/types/api.ts
git commit -m "feat: add CoachHistoryRecord type to api.ts"
```

---

### Task 2: Create useCoachHistory composable

**Files:**
- Create: `src/composables/useCoachHistory.ts`

- [ ] **Step 1: Create the composable with hash generation, CRUD, search, filter, cap, and export**

```typescript
import { ref, computed } from 'vue'
import type { CoachHistoryRecord } from '@/types/api'

const LS_KEY = 'coach-history'
const MAX_RECORDS = 200
const WARN_THRESHOLD = 180

// ─── Hash generation ────────────────────────────────────────────────────────

function generateHashId(existingIds: Set<string>): string {
  let id: string
  do {
    const bytes = new Uint8Array(4)
    crypto.getRandomValues(bytes)
    id = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  } while (existingIds.has(id))
  return id
}

// ─── Time formatting ────────────────────────────────────────────────────────

export function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ─── Storage ────────────────────────────────────────────────────────────────

function loadFromStorage(): CoachHistoryRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as CoachHistoryRecord[]) : []
  } catch {
    return []
  }
}

function saveToStorage(records: CoachHistoryRecord[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(records))
}

// ─── Singleton state (module-level ref) ─────────────────────────────────────

export const coachHistory = ref<CoachHistoryRecord[]>(loadFromStorage())

export const recordCount = computed(() => coachHistory.value.length)
export const isNearCap = computed(() => coachHistory.value.length >= WARN_THRESHOLD)

// ─── CRUD ───────────────────────────────────────────────────────────────────

export function addRecord(role: 'user' | 'assistant', content: string): CoachHistoryRecord {
  const existingIds = new Set(coachHistory.value.map(r => r.id))
  const record: CoachHistoryRecord = {
    id: generateHashId(existingIds),
    role,
    content,
    timestamp: Date.now()
  }
  // Prepend (newest first), enforce cap
  coachHistory.value = [record, ...coachHistory.value].slice(0, MAX_RECORDS)
  saveToStorage(coachHistory.value)
  return record
}

export function deleteRecords(ids: Set<string>): void {
  coachHistory.value = coachHistory.value.filter(r => !ids.has(r.id))
  saveToStorage(coachHistory.value)
}

export function clearHistory(): void {
  coachHistory.value = []
  localStorage.removeItem(LS_KEY)
}

// ─── Search & Filter ────────────────────────────────────────────────────────

export function searchRecords(
  query: string,
  roleFilter: 'all' | 'user' | 'assistant'
): CoachHistoryRecord[] {
  let results = coachHistory.value
  if (roleFilter !== 'all') {
    results = results.filter(r => r.role === roleFilter)
  }
  if (query.trim()) {
    const q = query.toLowerCase()
    results = results.filter(r => r.content.toLowerCase().includes(q))
  }
  return results
}

// ─── Export ─────────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function todayStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function exportAsJson(records: CoachHistoryRecord[]): void {
  const json = JSON.stringify(records, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, `coach-history-${todayStr()}.json`)
}

export function exportAsMarkdown(records: CoachHistoryRecord[]): void {
  const lines = records.map(r => {
    const roleLabel = r.role === 'user' ? 'USER' : 'COACH'
    return `### ${roleLabel} — ${formatTime(r.timestamp)} (#${r.id})\n\n${r.content}\n\n<!-- ====== RECORD BOUNDARY ====== -->`
  })
  const md = lines.join('\n\n')
  const blob = new Blob([md], { type: 'text/markdown' })
  downloadBlob(blob, `coach-history-${todayStr()}.md`)
}

export function exportRecords(records: CoachHistoryRecord[], format: 'json' | 'markdown' | 'both'): void {
  if (format === 'json' || format === 'both') exportAsJson(records)
  if (format === 'markdown' || format === 'both') exportAsMarkdown(records)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/composables/useCoachHistory.ts
git commit -m "feat: create useCoachHistory composable with CRUD, search, filter, cap, export"
```

---

### Task 3: Add i18n keys for coach history

**Files:**
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/zh.ts`

- [ ] **Step 1: Add missing ConfirmDialog i18n keys and coach history keys to en.ts**

First, add a top-level `confirm` section to `en.ts` (the existing `ConfirmDialog.vue` references `t('confirm.cancel')` and `t('confirm.confirm')` but these keys are missing):

```typescript
  confirm: {
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
```

Then find the `coach` section and add these keys inside it (after the last existing coach key):

```typescript
    // History tabs & features
    tabChat: 'Chat',
    tabHistory: 'History',
    historySearch: 'Search messages...',
    historyFilterAll: 'All',
    historyFilterUser: 'User',
    historyFilterCoach: 'Coach',
    historySelected: '{n} selected',
    historyDelete: 'Delete',
    historyDownloadRaw: 'Download Raw',
    historyClearAll: 'Clear All',
    historyReplay: 'Replay',
    historyCapWarning: '{n}/200',
    historyEmpty: 'No history records yet',
    historyEmptySub: 'Coach conversations will appear here',
    downloadTitle: 'Download {n} records',
    downloadChooseFormat: 'Choose export format',
    downloadJson: 'JSON',
    downloadJsonDesc: 'Raw structured data with metadata',
    downloadMarkdown: 'Markdown',
    downloadMarkdownDesc: 'Human-readable with raw content',
    downloadBoth: 'Both',
    downloadCancel: 'Cancel',
    confirmDeleteTitle: 'Delete Records',
    confirmDeleteMsg: 'Are you sure you want to delete {n} selected records?',
    confirmClearTitle: 'Clear All History',
    confirmClearMsg: 'This will permanently delete all {n} history records. This cannot be undone.',
```

- [ ] **Step 2: Add missing ConfirmDialog i18n keys and coach history keys to zh.ts**

First, add a top-level `confirm` section to `zh.ts`:

```typescript
  confirm: {
    cancel: '取消',
    confirm: '确认'
  },
```

Then find the `coach` section and add these keys in Chinese:

```typescript
    // History tabs & features
    tabChat: '对话',
    tabHistory: '历史记录',
    historySearch: '搜索消息...',
    historyFilterAll: '全部',
    historyFilterUser: '用户',
    historyFilterCoach: '教练',
    historySelected: '已选择 {n} 条',
    historyDelete: '删除',
    historyDownloadRaw: '下载原始数据',
    historyClearAll: '清空全部',
    historyReplay: '重新发送',
    historyCapWarning: '{n}/200',
    historyEmpty: '暂无历史记录',
    historyEmptySub: '教练对话将会显示在这里',
    downloadTitle: '下载 {n} 条记录',
    downloadChooseFormat: '选择导出格式',
    downloadJson: 'JSON',
    downloadJsonDesc: '含元数据的结构化数据',
    downloadMarkdown: 'Markdown',
    downloadMarkdownDesc: '人类可读的原始内容',
    downloadBoth: '两者都下载',
    downloadCancel: '取消',
    confirmDeleteTitle: '删除记录',
    confirmDeleteMsg: '确定要删除选中的 {n} 条记录吗？',
    confirmClearTitle: '清空所有历史',
    confirmClearMsg: '这将永久删除全部 {n} 条历史记录，此操作无法撤销。',
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/i18n/en.ts src/i18n/zh.ts
git commit -m "feat: add i18n keys for coach history (EN + ZH)"
```

---

## Chunk 2: UI Components

### Task 4: Create DownloadModal component

**Files:**
- Create: `src/components/coach/DownloadModal.vue`

- [ ] **Step 1: Create the download format picker modal**

```vue
<template>
  <Transition name="modal">
    <div class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-content" role="dialog" aria-modal="true">
        <h3 class="modal-title">
          {{ t('coach.downloadTitle').replace('{n}', String(recordCount)) }}
        </h3>
        <p class="modal-subtitle">{{ t('coach.downloadChooseFormat') }}</p>

        <div class="format-options">
          <button class="format-option" @click="$emit('select', 'json')">
            <span class="format-icon format-json">{ }</span>
            <div class="format-info">
              <span class="format-name">{{ t('coach.downloadJson') }}</span>
              <span class="format-desc">{{ t('coach.downloadJsonDesc') }}</span>
            </div>
          </button>

          <button class="format-option" @click="$emit('select', 'markdown')">
            <span class="format-icon format-md">MD</span>
            <div class="format-info">
              <span class="format-name">{{ t('coach.downloadMarkdown') }}</span>
              <span class="format-desc">{{ t('coach.downloadMarkdownDesc') }}</span>
            </div>
          </button>

          <button class="format-option" @click="$emit('select', 'both')">
            <span class="format-icon format-both">⇊</span>
            <div class="format-info">
              <span class="format-name">{{ t('coach.downloadBoth') }}</span>
              <span class="format-desc">JSON + Markdown</span>
            </div>
          </button>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="$emit('cancel')">{{ t('coach.downloadCancel') }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'
const { t } = useI18n()
defineProps<{ recordCount: number }>()
defineEmits<{ select: [format: 'json' | 'markdown' | 'both']; cancel: [] }>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6000;
  padding: 24px;
}
.modal-content {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  padding: 20px;
  max-width: 300px;
  width: 100%;
  animation: scaleIn 0.2s ease-out;
}
.modal-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}
.modal-subtitle {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 14px;
}
.format-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.format-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: var(--bg-tertiary);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.format-option:hover {
  border-color: var(--accent-blue);
  background-color: var(--blue-wash, var(--bg-secondary));
}
.format-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.format-json {
  background-color: var(--blue-subtle);
  color: var(--accent-blue);
}
.format-md {
  background-color: var(--purple-subtle, #2a1a3a);
  color: var(--accent-purple, #a78bfa);
}
.format-both {
  background-color: var(--green-subtle);
  color: var(--accent-green);
}
.format-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.format-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}
.format-desc {
  font-size: 10px;
  color: var(--text-muted);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
.btn-cancel {
  font-size: 12px;
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
}
.btn-cancel:hover {
  color: var(--text-secondary);
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
/* Transition */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/coach/DownloadModal.vue
git commit -m "feat: create DownloadModal component with JSON/Markdown/Both format picker"
```

---

### Task 5: Create CoachHistoryTab component

**Files:**
- Create: `src/components/coach/CoachHistoryTab.vue`

- [ ] **Step 1: Create the history tab with search, filter, multi-select, actions, and record list**

```vue
<template>
  <div class="history-tab">
    <!-- Search & Filter Bar -->
    <div class="history-toolbar">
      <input
        v-model="searchQuery"
        class="history-search"
        type="text"
        :placeholder="t('coach.historySearch')"
      />
      <select v-model="roleFilter" class="history-filter">
        <option value="all">{{ t('coach.historyFilterAll') }}</option>
        <option value="user">{{ t('coach.historyFilterUser') }}</option>
        <option value="assistant">{{ t('coach.historyFilterCoach') }}</option>
      </select>
    </div>

    <!-- Action Bar -->
    <div v-if="filteredRecords.length > 0" class="history-actions">
      <label class="select-all-label">
        <input
          type="checkbox"
          :checked="allSelected"
          :indeterminate="someSelected && !allSelected"
          @change="toggleSelectAll"
        />
      </label>
      <span v-if="selectedIds.size > 0" class="selected-count">
        {{ t('coach.historySelected').replace('{n}', String(selectedIds.size)) }}
      </span>
      <button
        v-if="selectedIds.size > 0"
        class="action-btn action-delete"
        @click="showDeleteConfirm = true"
      >
        {{ t('coach.historyDelete') }}
      </button>
      <button class="action-btn action-download" @click="showDownloadModal = true">
        {{ t('coach.historyDownloadRaw') }}
      </button>
      <button class="action-btn action-clear" @click="showClearConfirm = true">
        {{ t('coach.historyClearAll') }}
      </button>
    </div>

    <!-- Record List -->
    <div v-if="filteredRecords.length > 0" class="history-list">
      <div
        v-for="record in filteredRecords"
        :key="record.id"
        class="history-record"
        :class="{ 'record-selected': selectedIds.has(record.id) }"
      >
        <input
          type="checkbox"
          :checked="selectedIds.has(record.id)"
          @change="toggleSelect(record.id)"
          class="record-checkbox"
        />
        <div class="record-body">
          <div class="record-badges">
            <span class="role-badge" :class="[`badge-${record.role}`]">
              {{ record.role === 'user' ? t('coach.userLabel') : t('coach.agentLabel') }}
            </span>
            <span class="record-time">{{ formatTime(record.timestamp) }}</span>
            <span class="record-hash">#{{ record.id }}</span>
            <button
              v-if="record.role === 'user'"
              class="replay-btn"
              @click="$emit('replay', record.content)"
            >
              {{ t('coach.historyReplay') }}
            </button>
          </div>
          <div class="record-preview">{{ truncate(record.content, 150) }}</div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="history-empty">
      <p class="empty-title">{{ t('coach.historyEmpty') }}</p>
      <p class="empty-sub">{{ t('coach.historyEmptySub') }}</p>
    </div>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      v-if="showDeleteConfirm"
      :title="t('coach.confirmDeleteTitle')"
      :message="t('coach.confirmDeleteMsg').replace('{n}', String(selectedIds.size))"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />

    <!-- Confirm Clear All Dialog -->
    <ConfirmDialog
      v-if="showClearConfirm"
      :title="t('coach.confirmClearTitle')"
      :message="t('coach.confirmClearMsg').replace('{n}', String(recordCount))"
      @confirm="handleClearAll"
      @cancel="showClearConfirm = false"
    />

    <!-- Download Modal -->
    <DownloadModal
      v-if="showDownloadModal"
      :record-count="downloadTargetCount"
      @select="handleDownload"
      @cancel="showDownloadModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '@/i18n'
import {
  coachHistory,
  recordCount,
  searchRecords,
  deleteRecords,
  clearHistory,
  exportRecords,
  formatTime
} from '@/composables/useCoachHistory'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import DownloadModal from '@/components/coach/DownloadModal.vue'

const emit = defineEmits<{ replay: [content: string] }>()
const { t } = useI18n()

// ─── Search & Filter ────────────────────────────────────────────────────────
const searchQuery = ref('')
const roleFilter = ref<'all' | 'user' | 'assistant'>('all')
let _debounceTimer: number | null = null
const debouncedQuery = ref('')

watch(searchQuery, (val) => {
  if (_debounceTimer) clearTimeout(_debounceTimer)
  _debounceTimer = window.setTimeout(() => {
    debouncedQuery.value = val
  }, 150)
})

const filteredRecords = computed(() =>
  searchRecords(debouncedQuery.value, roleFilter.value)
)

// ─── Selection ──────────────────────────────────────────────────────────────
const selectedIds = ref<Set<string>>(new Set())

const allSelected = computed(() =>
  filteredRecords.value.length > 0 && filteredRecords.value.every(r => selectedIds.value.has(r.id))
)
const someSelected = computed(() =>
  filteredRecords.value.some(r => selectedIds.value.has(r.id))
)

function toggleSelect(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredRecords.value.map(r => r.id))
  }
}

// ─── Actions ────────────────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)
const showClearConfirm = ref(false)
const showDownloadModal = ref(false)

const downloadTargetCount = computed(() =>
  selectedIds.value.size > 0 ? selectedIds.value.size : coachHistory.value.length
)

function handleDelete() {
  deleteRecords(selectedIds.value)
  selectedIds.value = new Set()
  showDeleteConfirm.value = false
}

function handleClearAll() {
  clearHistory()
  selectedIds.value = new Set()
  showClearConfirm.value = false
}

function handleDownload(format: 'json' | 'markdown' | 'both') {
  const records = selectedIds.value.size > 0
    ? coachHistory.value.filter(r => selectedIds.value.has(r.id))
    : coachHistory.value
  exportRecords(records, format)
  showDownloadModal.value = false
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '...'
}
</script>

<style scoped>
.history-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Toolbar */
.history-toolbar {
  display: flex;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
}
.history-search {
  flex: 1;
  padding: 5px 10px;
  font-size: 11px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
}
.history-search:focus {
  border-color: var(--accent-blue);
}
.history-filter {
  padding: 5px 8px;
  font-size: 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
}

/* Action bar */
.history-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border-color);
  font-size: 10px;
}
.select-all-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.selected-count {
  color: var(--text-muted);
}
.action-btn {
  font-size: 10px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
}
.action-btn:hover { opacity: 0.8; }
.action-delete {
  color: var(--accent-red);
  background: var(--red-subtle);
}
.action-download {
  color: var(--accent-blue);
  background: var(--blue-subtle);
}
.action-clear {
  margin-left: auto;
  color: var(--accent-red);
  background: transparent;
}

/* Record list */
.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 10px;
}
.history-record {
  display: flex;
  gap: 8px;
  padding: 8px;
  margin-bottom: 6px;
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  transition: all 0.15s;
}
.record-selected {
  background-color: var(--blue-wash, var(--bg-secondary));
  border: 1px solid var(--accent-blue);
}
.history-record:not(.record-selected) {
  border: 1px solid transparent;
}
.record-checkbox {
  margin-top: 2px;
  accent-color: var(--accent-blue);
  flex-shrink: 0;
}
.record-body {
  flex: 1;
  min-width: 0;
}
.record-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 3px;
}
.role-badge {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
}
.badge-user {
  background-color: var(--green-subtle);
  color: var(--accent-green);
}
.badge-assistant {
  background-color: var(--blue-subtle);
  color: var(--accent-blue);
}
.record-time {
  font-size: 9px;
  color: var(--text-muted);
}
.record-hash {
  font-size: 8px;
  color: var(--text-muted);
  opacity: 0.6;
  font-family: var(--font-mono);
}
.replay-btn {
  margin-left: auto;
  font-size: 9px;
  color: var(--accent-blue);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0 4px;
}
.replay-btn:hover {
  text-decoration: underline;
}
.record-preview {
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Empty state */
.history-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}
.empty-title {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.empty-sub {
  font-size: 11px;
  color: var(--text-muted);
  opacity: 0.7;
}
</style>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/coach/CoachHistoryTab.vue
git commit -m "feat: create CoachHistoryTab with search, filter, multi-select, replay, delete, download"
```

---

## Chunk 3: Integration

### Task 6: Add hash ID badge to ChatBubble

**Files:**
- Modify: `src/components/chat/ChatBubble.vue:20-24`

- [ ] **Step 1: Add hashId prop and display it in the badge row**

In `ChatBubble.vue`, update the props to accept an optional `hashId`:

```typescript
const props = defineProps<{
  message: ChatMessage
  hashId?: string
}>()
```

Then update the template badge row (line 21-24) to include the hash badge after the time:

```html
      <span class="msg-role-label" :class="[`role-${message.role}`]">
        {{ message.role === 'assistant' ? t('coach.agentLabel') : t('coach.userLabel') }}
        <span class="msg-time">{{ timeLabel }}</span>
        <span v-if="hashId" class="msg-hash">#{{ hashId }}</span>
      </span>
```

**Do NOT change the existing `timeLabel` computed** — keep the compact `"HH:mm"` format for live chat bubbles. The full `YYYY-MM-DD HH:mm:ss` timestamp is shown in the History tab records. The hash ID badge is the only addition to the live chat bubble.

- [ ] **Step 2: Add CSS for the hash badge**

Add to the `<style scoped>` section:

```css
.msg-hash {
  font-size: 9px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  opacity: 0.4;
  font-family: var(--font-mono);
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/chat/ChatBubble.vue
git commit -m "feat: add hash ID badge to ChatBubble"
```

---

### Task 7: Add tab bar and history integration to CoachPanel

**Files:**
- Modify: `src/components/panels/CoachPanel.vue`

- [ ] **Step 1: Import CoachHistoryTab and add tab state**

Add imports to the `<script setup>` block:

```typescript
import CoachHistoryTab from '@/components/coach/CoachHistoryTab.vue'
import { coachHistory, isNearCap, recordCount } from '@/composables/useCoachHistory'
```

Add tab state ref:

```typescript
const activeTab = ref<'chat' | 'history'>('chat')
```

Add the `replay` emit:

```typescript
const emit = defineEmits<{
  cancel: []
  retry: []
  applyChip: [key: string]
  importTemplates: [templates: import('@/types/template').TemplateDefinition[]]
  replay: [content: string]
}>()
```

Add the replay handler:

```typescript
function handleReplay(content: string) {
  activeTab.value = 'chat'
  emit('replay', content)
}
```

- [ ] **Step 2: Add tab bar to the template**

Insert the tab bar **after** the `</template>` closing tag for `#icon` slot (after line 45) and **before** the empty state div (line 47). The tab bar goes inside the PanelShell default slot, above all content:

```html
    <!-- Tab bar -->
    <div class="coach-tabs">
      <button
        class="coach-tab"
        :class="{ 'tab-active': activeTab === 'chat' }"
        @click="activeTab = 'chat'"
      >
        {{ t('coach.tabChat') }}
      </button>
      <button
        class="coach-tab"
        :class="{ 'tab-active': activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        {{ t('coach.tabHistory') }}
        <span v-if="isNearCap" class="cap-badge">
          {{ t('coach.historyCapWarning').replace('{n}', String(recordCount)) }}
        </span>
      </button>
    </div>
```

- [ ] **Step 3: Wrap existing chat content in v-if="activeTab === 'chat'" and add history tab**

Wrap the existing empty state div and chat-container div with `v-show="activeTab === 'chat'"`:

```html
    <template v-if="activeTab === 'chat'">
      <!-- Empty state (existing) -->
      <div v-if="messages.length === 0 && !isLoading" class="empty-state">
        ...existing empty state content...
      </div>
      <!-- Chat messages (existing) -->
      <div v-else class="chat-container" ref="chatContainerRef">
        ...existing chat content...
      </div>
    </template>

    <!-- History tab -->
    <CoachHistoryTab
      v-if="activeTab === 'history'"
      @replay="handleReplay"
    />
```

- [ ] **Step 4: Add tab bar CSS**

Add to the `<style scoped>` section:

```css
/* Tab bar */
.coach-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
}
.coach-tab {
  flex: 1;
  text-align: center;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.coach-tab:hover {
  color: var(--text-secondary);
}
.tab-active {
  color: var(--accent-blue);
  border-bottom-color: var(--accent-blue);
  background-color: var(--bg-secondary);
}
.cap-badge {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 8px;
  background-color: var(--orange-subtle, var(--bg-tertiary));
  color: var(--accent-orange);
  font-weight: 600;
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/panels/CoachPanel.vue
git commit -m "feat: add Chat/History tab bar and CoachHistoryTab integration to CoachPanel"
```

---

### Task 8: Wire up history saving in useLLM and replay in App.vue

**Files:**
- Modify: `src/composables/useLLM.ts:96-173`
- Modify: `src/App.vue` (coach request handler and CoachPanel usage)

- [ ] **Step 1: Add history saving to useLLM.ts**

At the top of `useLLM.ts`, add import:

```typescript
import { addRecord } from '@/composables/useCoachHistory'
```

In `createStreamFlow`, after the user message is pushed to `messages` (around line 99-105), add a call to save the user message to history:

```typescript
      if (!_isAutoRetry) {
        messages.value.push({
          id: nextMsgId(),
          role: 'user',
          content: userMessage,
          timestamp: Date.now()
        })
        // Save user message to global coach history
        if (opts.chatMode) {
          const record = addRecord('user', userMessage)
          messages.value[messages.value.length - 1].hashId = record.id
        }
      }
```

After normal completion (lines 168-173), **replace** the existing block with this expanded version that adds history saving. The original code only sets `isStreaming = false`; we add `addRecord` after it:

```typescript
      // Mark streaming complete (REPLACES lines 168-173)
      if (opts.chatMode) {
        const lastMsg = messages.value[messages.value.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.isStreaming = false
          // Save completed coach response to global history
          if (lastMsg.content) {
            const record = addRecord('assistant', lastMsg.content)
            lastMsg.hashId = record.id
          }
        }
      }
```

**Important:** Do NOT add `addRecord` calls in the error/cancel/429 catch blocks — only save on normal completion per the spec's save policy.

- [ ] **Step 2: Wire up replay event in App.vue**

Find where `<CoachPanel>` is used in `App.vue` and add the `@replay` handler. The replay event should populate the description field and trigger a coach request:

Add the replay handler in `App.vue`'s `<script setup>`:

```typescript
function handleReplay(content: string) {
  // Populate the description field with the replayed content
  form.description = content
  // Force Skill OFF for replay — avoids canSubmit guard issues when
  // form fields (project, type) are empty. Replay sends raw content directly.
  if (coachSkillEnabled.value) {
    setCoachSkillEnabled(false)
  }
  // Use nextTick to ensure form.description is reactive-updated before request
  nextTick(() => handleCoachRequest())
}
```

Import `setCoachSkillEnabled` and `coachSkillEnabled` if not already imported in App.vue (they come from `useLLM`).

Add `@replay="handleReplay"` to the `<CoachPanel>` component in the template.

- [ ] **Step 3: Store hashId on ChatMessage and pass to ChatBubble**

First, add an optional `hashId` field to the `ChatMessage` interface in `src/types/api.ts`:

```typescript
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isStreaming?: boolean
  hashId?: string         // 8-char hex from coach history record
}
```

Then in `useLLM.ts`, where `addRecord` is called (Steps 1 above), capture the returned record ID and store it on the ChatMessage:

For user messages:
```typescript
        // Save user message to global coach history
        if (opts.chatMode) {
          const record = addRecord('user', userMessage)
          // Store hash on the ChatMessage for badge display
          messages.value[messages.value.length - 1].hashId = record.id
        }
```

For assistant messages (after `lastMsg.isStreaming = false`):
```typescript
          if (lastMsg.content) {
            const record = addRecord('assistant', lastMsg.content)
            lastMsg.hashId = record.id
          }
```

Finally in `CoachPanel.vue`, pass the hashId directly:

```html
        <ChatBubble
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
          :hash-id="msg.hashId"
        />
```

This avoids fragile timestamp-proximity matching — the hash is deterministically linked.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx vue-tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/composables/useLLM.ts src/App.vue src/components/panels/CoachPanel.vue
git commit -m "feat: wire up coach history saving in useLLM and replay in App.vue"
```

---

## Chunk 4: Version Bump & Docs

### Task 9: Bump version and update PLAN.md

**Files:**
- Modify: `src/components/layout/AppHeader.vue:10`
- Modify: `PLAN.md`

- [ ] **Step 1: Bump version from v8.43 to v8.44**

In `src/components/layout/AppHeader.vue`, line 10, change:

```html
<span class="header-version">v8.44</span>
```

- [ ] **Step 2: Append v8.44 section to PLAN.md**

Add at the bottom of `PLAN.md`:

```markdown
## v8.44

**Coach History — Global Q&A Record Storage with Bubble & Badge UI**

### Design Rationale
- Users needed persistent access to past coach conversations across sessions
- Each message gets a unique 8-char hash ID + full timestamp for identification
- localStorage chosen over IndexedDB — 200-record cap keeps it well within limits
- Singleton composable pattern matches existing `useTicketHistory.ts`

### Changes
1. **CoachHistoryRecord type** — new interface in `api.ts`, derived from ChatMessage minus `isStreaming`
2. **useCoachHistory composable** — singleton with CRUD, search, filter, cap (200), export (JSON/MD)
3. **Chat/History tabs** — CoachPanel gains tab bar below header-actions; Chat is live conversation, History is past records
4. **Hash ID badges** — every chat bubble now shows role badge + timestamp + hash ID
5. **History tab UI** — search (debounced 150ms), role filter, multi-select with checkboxes, delete, clear all
6. **Replay** — click on past USER messages to re-send to coach
7. **Download modal** — compact modal with JSON / Markdown / Both format picker
8. **i18n** — full EN + ZH strings for all new UI elements
9. **Save policy** — only saves on normal completion (not cancel/error/429)

### Modified Files
| File | Change |
|------|--------|
| `src/types/api.ts` | Added `CoachHistoryRecord` interface |
| `src/composables/useCoachHistory.ts` | **New** — history composable |
| `src/composables/useLLM.ts` | Save messages to history on completion |
| `src/components/panels/CoachPanel.vue` | Tab bar, history tab integration, replay emit |
| `src/components/chat/ChatBubble.vue` | Hash ID badge, full timestamp format |
| `src/components/coach/CoachHistoryTab.vue` | **New** — history tab UI |
| `src/components/coach/DownloadModal.vue` | **New** — format picker modal |
| `src/components/layout/AppHeader.vue` | Version bump to v8.44 |
| `src/i18n/en.ts` | Coach history i18n keys |
| `src/i18n/zh.ts` | Coach history i18n keys (Chinese) |
| `PLAN.md` | This section |
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppHeader.vue PLAN.md
git commit -m "docs: bump version to v8.44 and update PLAN.md with coach history changelog"
```
