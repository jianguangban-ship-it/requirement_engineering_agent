<template>
  <PanelShell
    :title="t('coach.title')"
    :status="statusInfo.status"
    :status-label="t('status.' + statusInfo.key)"
    resizable
    height="400px"
    max-height="650px"
  >
    <template #icon>
      <svg class="panel-icon green" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    </template>

    <!-- Empty state -->
    <div v-if="!response && !isLoading" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
      <p class="empty-hint">{{ t('coach.emptyHint') }}</p>
      <p class="empty-sub">{{ t('coach.emptySubHint') }}</p>
      <div class="chips">
        <QuickChip
          v-for="chip in chips"
          :key="chip.key"
          :icon="chip.icon"
          :label="chip.label"
          @click="$emit('applyChip', chip.key)"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="isLoading" class="loading-state">
      <svg class="spinner green" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round" opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
      </svg>
      <p class="loading-text green">{{ t('coach.analyzing') }}</p>
    </div>

    <!-- Coach response -->
    <div v-else class="coach-response" v-html="formattedResponse"></div>

    <template #footer>
      <button
        @click="$emit('request')"
        :disabled="!canRequest || isLoading"
        class="coach-btn"
        :class="{ active: canRequest && !isLoading }"
      >
        <svg v-if="isLoading" class="btn-icon animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round" opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
        </svg>
        <svg v-else class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        <span>{{ isLoading ? t('coach.requesting') : t('coach.requestBtn') }}</span>
      </button>
      <p class="coach-hint">{{ t('coach.hint') }}</p>
    </template>
  </PanelShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { formatCoachResponse } from '@/utils/formatCoach'
import PanelShell from '@/components/layout/PanelShell.vue'
import QuickChip from '@/components/shared/QuickChip.vue'

const props = defineProps<{
  response: unknown
  isLoading: boolean
  canRequest: boolean
}>()

defineEmits<{
  request: []
  applyChip: [key: string]
}>()

const { t, isZh } = useI18n()

const statusInfo = computed(() => {
  if (props.isLoading) return { status: 'loading' as const, key: 'loading' }
  if (props.response) return { status: 'success' as const, key: 'success' }
  return { status: 'idle' as const, key: 'idle' }
})

const formattedResponse = computed(() => formatCoachResponse(props.response))

const chips = computed(() => [
  { key: 'template', icon: '📋', label: isZh.value ? 'AC 模板' : 'AC Template' },
  { key: 'optimize', icon: '✨', label: isZh.value ? '优化描述' : 'Optimize' },
  { key: 'bugReport', icon: '🐛', label: isZh.value ? 'Bug 模板' : 'Bug Template' },
  { key: 'changeReq', icon: '🔄', label: isZh.value ? '变更请求' : 'Change Req' }
])
</script>

<style scoped>
.panel-icon {
  width: 16px;
  height: 16px;
}
.green { color: var(--accent-green); }

.empty-state,
.loading-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 16px;
}
.empty-icon {
  width: 40px;
  height: 40px;
  color: var(--text-muted);
  margin-bottom: 12px;
}
.empty-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.empty-sub {
  font-size: 12px;
  color: var(--text-muted);
  opacity: 0.7;
  margin-bottom: 16px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}
.spinner {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  animation: spin 1s linear infinite;
}
.loading-text {
  font-size: 12px;
}
.coach-response {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* Coach formatted content styles */
.coach-response :deep(.coach-status-badge) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
}
.coach-response :deep(.coach-status-pass) {
  background-color: rgba(63, 185, 80, 0.15);
  color: var(--accent-green);
  border: 1px solid rgba(63, 185, 80, 0.3);
}
.coach-response :deep(.coach-status-fail) {
  background-color: rgba(248, 81, 73, 0.15);
  color: var(--accent-red);
  border: 1px solid rgba(248, 81, 73, 0.3);
}
.coach-response :deep(.coach-status-warn) {
  background-color: rgba(210, 153, 34, 0.15);
  color: var(--accent-orange);
  border: 1px solid rgba(210, 153, 34, 0.3);
}
.coach-response :deep(.coach-info-row) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
  font-size: 12px;
}
.coach-response :deep(.coach-info-label) { color: var(--text-muted); }
.coach-response :deep(.coach-info-value) { color: var(--text-primary); font-weight: 500; }
.coach-response :deep(.coach-main-message) {
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  border-left: 3px solid var(--accent-blue);
}
.coach-response :deep(.coach-comment-title) {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
}
.coach-response :deep(.coach-issues-list) { display: flex; flex-direction: column; gap: 8px; }
.coach-response :deep(.coach-issue-item) {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background-color: rgba(248, 81, 73, 0.06);
  border-radius: 8px;
  border-left: 3px solid var(--accent-red);
}
.coach-response :deep(.coach-issue-num) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  background-color: var(--accent-red);
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
}
.coach-response :deep(.coach-issue-text) { font-size: 12px; line-height: 1.6; color: var(--text-secondary); }
.coach-response :deep(.coach-highlight-error) { color: var(--accent-red); font-weight: 600; }
.coach-response :deep(.coach-para) { margin-bottom: 12px; }
.coach-response :deep(.coach-h3) { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 16px 0 8px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color); }
.coach-response :deep(.coach-h4) { font-size: 13px; font-weight: 600; color: var(--accent-blue); margin: 12px 0 6px; }
.coach-response :deep(.coach-hr) { border: none; border-top: 1px dashed var(--border-color); margin: 16px 0; }
.coach-response :deep(.coach-bold) { color: var(--accent-green); font-weight: 600; }
.coach-response :deep(.coach-code) { background-color: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: var(--font-mono); color: var(--accent-blue); }
.coach-response :deep(.coach-list-item) { display: flex; align-items: flex-start; gap: 8px; margin: 6px 0; padding: 6px 10px; background-color: var(--bg-tertiary); border-radius: 6px; border-left: 3px solid var(--border-color); }
.coach-response :deep(.coach-list-num) { color: var(--accent-blue); font-weight: 600; min-width: 20px; }
.coach-response :deep(.coach-list-bullet) { color: var(--accent-green); font-weight: bold; }
.coach-response :deep(.coach-icon-error) { color: var(--accent-red); }
.coach-response :deep(.coach-icon-success) { color: var(--accent-green); }
.coach-response :deep(.coach-icon-warning) { color: var(--accent-orange); }

/* Footer */
.coach-btn {
  width: 100%;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
}
.coach-btn.active {
  background-color: var(--accent-green);
  color: white;
}
.btn-icon {
  width: 16px;
  height: 16px;
}
.coach-hint {
  font-size: 12px;
  text-align: center;
  color: var(--text-muted);
  margin-top: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
