<template>
  <div class="batch-panel" v-if="batchItems.length > 0 || showImport">
    <h3 class="batch-title">
      <svg class="batch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
      </svg>
      {{ isZh ? '批量操作' : 'Batch Operations' }}
      <span class="batch-count">{{ batchItems.length }}</span>
      <div class="batch-actions-top">
        <button class="batch-top-btn" @click="showImport = !showImport" :title="isZh ? '导入' : 'Import'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
        </button>
        <button class="batch-top-btn" @click="$emit('addCurrent')" :title="isZh ? '添加当前' : 'Add Current'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px">
            <path stroke-linecap="round" d="M12 5v14m-7-7h14"/>
          </svg>
        </button>
        <button class="batch-top-btn batch-clear" @click="$emit('clearBatch')" :title="isZh ? '清空' : 'Clear'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px">
            <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </h3>

    <!-- Import area -->
    <Transition name="slide-fade">
      <div v-if="showImport" class="import-area">
        <textarea
          v-model="importText"
          class="input-base import-textarea"
          :placeholder="isZh ? '粘贴 CSV 内容（需含 Summary 列头）...' : 'Paste CSV content (requires Summary header)...'"
          rows="4"
        />
        <div class="import-actions">
          <button class="import-btn" @click="handleImport" :disabled="!importText.trim()">
            {{ isZh ? '导入' : 'Import' }}
          </button>
          <label class="import-file-btn">
            {{ isZh ? '选择文件' : 'Choose File' }}
            <input type="file" accept=".csv,.txt" @change="handleFileImport" hidden />
          </label>
        </div>
      </div>
    </Transition>

    <!-- Batch items list -->
    <div v-if="batchItems.length" class="batch-list">
      <div class="batch-toolbar">
        <label class="select-all">
          <input type="checkbox" :checked="allSelected" @change="$emit('toggleAll', !allSelected)" />
          {{ isZh ? '全选' : 'Select All' }}
        </label>
        <span class="selected-label">{{ selectedCount }} {{ isZh ? '已选' : 'selected' }}</span>
        <button
          v-if="selectedCount > 0"
          class="bulk-analyze-btn"
          @click="$emit('bulkAnalyze')"
        >{{ isZh ? '批量分析' : 'Bulk Analyze' }}</button>
      </div>

      <div
        v-for="item in batchItems"
        :key="item.id"
        class="batch-item"
        :class="{ 'item-selected': item.selected }"
      >
        <input type="checkbox" :checked="item.selected" @change="$emit('toggleItem', item.id)" class="item-check" />
        <div class="item-body">
          <div class="item-header">
            <span class="item-level" v-if="item.level !== 'none'">{{ item.level }}</span>
            <span class="item-type">{{ item.issueType }}</span>
            <span class="item-score" :class="item.qualityScore >= 70 ? 'score-good' : item.qualityScore >= 40 ? 'score-mid' : 'score-low'">
              {{ item.qualityScore }}
            </span>
          </div>
          <div class="item-summary">{{ item.summary }}</div>
          <div class="item-desc" v-if="item.description">{{ item.description.slice(0, 80) }}{{ item.description.length > 80 ? '...' : '' }}</div>
        </div>
        <button class="item-remove" @click="$emit('removeItem', item.id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:10px;height:10px">
            <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BatchRequirement } from '@/composables/useBatchOps'
import { useI18n } from '@/i18n'

const props = defineProps<{
  batchItems: BatchRequirement[]
  selectedCount: number
}>()

const emit = defineEmits<{
  addCurrent: []
  clearBatch: []
  toggleItem: [id: string]
  toggleAll: [val: boolean]
  removeItem: [id: string]
  bulkAnalyze: []
  importCSV: [text: string]
}>()

const { isZh } = useI18n()
const showImport = ref(false)
const importText = ref('')

const allSelected = computed(() =>
  props.batchItems.length > 0 && props.batchItems.every(b => b.selected)
)

function handleImport() {
  if (importText.value.trim()) {
    emit('importCSV', importText.value)
    importText.value = ''
    showImport.value = false
  }
}

function handleFileImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const text = reader.result as string
    emit('importCSV', text)
    showImport.value = false
  }
  reader.readAsText(file)
}
</script>

<style scoped>
.batch-panel {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  font-size: 11px;
}
.batch-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.batch-icon {
  width: 14px;
  height: 14px;
  color: var(--accent-orange);
}
.batch-count {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: var(--radius-sm);
  background-color: var(--orange-subtle);
  color: var(--accent-orange);
}
.batch-actions-top {
  margin-left: auto;
  display: flex;
  gap: 2px;
}
.batch-top-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}
.batch-top-btn:hover {
  color: var(--text-primary);
  border-color: var(--accent-blue);
}
.batch-clear:hover {
  color: var(--accent-red);
  border-color: var(--accent-red);
}

/* Import */
.import-area {
  margin-bottom: 8px;
}
.import-textarea {
  width: 100%;
  font-size: 10px;
  padding: 6px;
  resize: vertical;
  margin-bottom: 4px;
}
.import-actions {
  display: flex;
  gap: 4px;
}
.import-btn, .import-file-btn {
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.import-btn {
  background-color: var(--accent-blue);
  color: white;
  border: none;
}
.import-btn:disabled { opacity: 0.4; }
.import-file-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}
.import-file-btn:hover {
  border-color: var(--accent-blue);
}

/* Toolbar */
.batch-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--border-color);
}
.select-all {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-muted);
  cursor: pointer;
}
.selected-label {
  font-size: 10px;
  color: var(--text-muted);
}
.bulk-analyze-btn {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 600;
  background-color: var(--accent-purple);
  color: white;
  border: none;
  cursor: pointer;
  transition: filter 0.15s;
}
.bulk-analyze-btn:hover { filter: brightness(1.15); }

/* Items */
.batch-list {
  max-height: 300px;
  overflow-y: auto;
}
.batch-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 5px 6px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  transition: all 0.15s;
}
.batch-item:hover {
  background-color: var(--bg-tertiary);
}
.item-selected {
  border-color: var(--border-color);
  background-color: var(--bg-tertiary);
}
.item-check {
  accent-color: var(--accent-blue);
  margin-top: 2px;
  flex-shrink: 0;
}
.item-body {
  flex: 1;
  min-width: 0;
}
.item-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}
.item-level {
  font-size: 9px;
  font-weight: 700;
  padding: 0 4px;
  border-radius: 3px;
  background-color: var(--blue-subtle);
  color: var(--accent-blue);
  text-transform: uppercase;
}
.item-type {
  font-size: 9px;
  color: var(--text-muted);
}
.item-score {
  margin-left: auto;
  font-size: 9px;
  font-weight: 700;
}
.score-good { color: var(--accent-green); }
.score-mid { color: var(--accent-orange); }
.score-low { color: var(--accent-red); }
.item-summary {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-desc {
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.3;
}
.item-remove {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px;
}
.item-remove:hover {
  color: var(--accent-red);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
