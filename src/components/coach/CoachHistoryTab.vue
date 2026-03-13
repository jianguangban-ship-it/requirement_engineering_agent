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
