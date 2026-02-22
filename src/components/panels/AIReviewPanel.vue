<template>
  <PanelShell
    :title="t('panel.aiAgentResponse')"
    :status="statusInfo.status"
    :status-label="t('status.' + statusInfo.key)"
    resizable
  >
    <template #header-actions>
      <span class="mode-badge" :class="analyzeMode === 'llm' ? 'badge-llm' : 'badge-n8n'">
        {{ analyzeMode === 'llm' ? 'GLM' : 'n8n' }}
      </span>
      <button v-if="isMarkdownResponse && !isAnalyzing" class="copy-btn" @click="copyResponse" :title="t('toast.copied')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="2" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-linecap="round"/>
        </svg>
      </button>
    </template>

    <template #icon>
      <svg class="panel-icon" style="color: var(--accent-purple);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
    </template>

    <!-- Empty state -->
    <div v-if="!response && !isAnalyzing" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
      <p class="empty-text">{{ t('panel.waitingAI') }}</p>
      <div v-if="hadError" class="retry-row">
        <button class="retry-btn" :disabled="retryCountdown > 0" @click="handleRetry">
          <svg class="retry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          {{ retryCountdown > 0 ? `${retryCountdown}s` : t('panel.retryBtn') }}
        </button>
      </div>
    </div>

    <!-- Loading state (waiting for first token) -->
    <div v-else-if="isAnalyzing && !response" class="empty-state">
      <svg class="spinner" style="color: var(--accent-purple);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round" opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
      </svg>
      <p class="loading-text" style="color: var(--accent-purple);">{{ t('panel.aiAnalyzing') }}</p>
      <button class="cancel-btn" @click="$emit('cancel')">
        <svg class="cancel-icon" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
        {{ t('settings.cancel') }}
      </button>
    </div>

    <!-- LLM markdown result (streaming or complete) -->
    <div v-else-if="isMarkdownResponse">
      <div v-if="isAnalyzing" class="cancel-row">
        <button class="cancel-btn" @click="$emit('cancel')">
          <svg class="cancel-icon" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          {{ t('settings.cancel') }}
        </button>
      </div>
      <div class="coach-response" v-html="formattedAnalysis" />
      <span v-if="isAnalyzing" class="streaming-cursor" />
      <div v-if="!isAnalyzing && (wasCancelled || hadError)" class="retry-row">
        <button class="retry-btn" :disabled="retryCountdown > 0" @click="handleRetry">
          <svg class="retry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          {{ retryCountdown > 0 ? `${retryCountdown}s` : t('panel.retryBtn') }}
        </button>
      </div>
    </div>

    <!-- Webhook JSON result -->
    <JsonViewer v-else :data="response" />
  </PanelShell>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { useI18n } from '@/i18n'
import { formatCoachResponse } from '@/utils/formatCoach'
import { useToast } from '@/composables/useToast'
import { analyzeMode } from '@/config/llm'
import PanelShell from '@/components/layout/PanelShell.vue'
import JsonViewer from '@/components/shared/JsonViewer.vue'

const props = defineProps<{
  response: unknown
  isAnalyzing: boolean
  hasError: boolean
  wasCancelled: boolean
  hadError: boolean
}>()

const emit = defineEmits<{ cancel: []; retry: [] }>()

const { t } = useI18n()
const { addToast } = useToast()

const retryCountdown = ref(0)
let _cooldownTimer: number | null = null

function handleRetry() {
  emit('retry')
  retryCountdown.value = 2
  _cooldownTimer = window.setInterval(() => {
    retryCountdown.value--
    if (retryCountdown.value <= 0) {
      clearInterval(_cooldownTimer!)
      _cooldownTimer = null
    }
  }, 1000)
}

onUnmounted(() => { if (_cooldownTimer !== null) clearInterval(_cooldownTimer) })

const statusInfo = computed(() => {
  if (props.isAnalyzing) return { status: 'loading' as const, key: 'loading' }
  if (props.response) return { status: 'success' as const, key: 'success' }
  if (props.hasError) return { status: 'error' as const, key: 'error' }
  return { status: 'idle' as const, key: 'idle' }
})

const isMarkdownResponse = computed(() => {
  const r = props.response as Record<string, unknown>
  return !!r && ('markdown_msg' in r || 'message' in r)
})

const formattedAnalysis = computed(() => formatCoachResponse(props.response))

const rawText = computed(() => {
  const r = props.response as Record<string, unknown>
  return typeof r?.message === 'string' ? r.message : ''
})

async function copyResponse() {
  if (!rawText.value) return
  await navigator.clipboard.writeText(rawText.value)
  addToast('success', t('toast.copied'), 2000)
}
</script>

<style scoped>
.panel-icon { width: 16px; height: 16px; }
.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 16px;
}
.empty-icon { width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 8px; }
.empty-text { font-size: 12px; color: var(--text-muted); }
.spinner { width: 32px; height: 32px; margin-bottom: 8px; animation: spin 1s linear infinite; }
.loading-text { font-size: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Markdown response styles (mirrors CoachPanel) */
.coach-response {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-secondary);
}
.coach-response :deep(.coach-status-badge) {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-bottom: 12px;
}
.coach-response :deep(.coach-status-pass) { background-color: rgba(63,185,80,.15); color: var(--accent-green); border: 1px solid rgba(63,185,80,.3); }
.coach-response :deep(.coach-status-fail) { background-color: rgba(248,81,73,.15); color: var(--accent-red); border: 1px solid rgba(248,81,73,.3); }
.coach-response :deep(.coach-status-warn) { background-color: rgba(210,153,34,.15); color: var(--accent-orange); border: 1px solid rgba(210,153,34,.3); }
.coach-response :deep(.coach-info-row) { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--border-color); font-size: 12px; }
.coach-response :deep(.coach-info-label) { color: var(--text-muted); }
.coach-response :deep(.coach-info-value) { color: var(--text-primary); font-weight: 500; }
.coach-response :deep(.coach-main-message) { background-color: var(--bg-tertiary); border-radius: 8px; padding: 12px; margin: 12px 0; border-left: 3px solid var(--accent-purple); }
.coach-response :deep(.coach-comment-title) { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color); }
.coach-response :deep(.coach-issues-list) { display: flex; flex-direction: column; gap: 8px; }
.coach-response :deep(.coach-issue-item) { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; background-color: rgba(248,81,73,.06); border-radius: 8px; border-left: 3px solid var(--accent-red); }
.coach-response :deep(.coach-issue-num) { display: flex; align-items: center; justify-content: center; min-width: 22px; height: 22px; background-color: var(--accent-red); color: white; border-radius: 50%; font-size: 11px; font-weight: 600; }
.coach-response :deep(.coach-issue-text) { font-size: 12px; line-height: 1.6; color: var(--text-secondary); }
.coach-response :deep(.coach-highlight-error) { color: var(--accent-red); font-weight: 600; }
.coach-response :deep(.coach-para) { margin-bottom: 12px; }
.coach-response :deep(.coach-h3) { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 16px 0 8px; padding-bottom: 6px; border-bottom: 1px solid var(--border-color); }
.coach-response :deep(.coach-h4) { font-size: 13px; font-weight: 600; color: var(--accent-purple); margin: 12px 0 6px; }
.coach-response :deep(.coach-hr) { border: none; border-top: 1px dashed var(--border-color); margin: 16px 0; }
.coach-response :deep(.coach-bold) { color: var(--accent-purple); font-weight: 600; }
.coach-response :deep(.coach-code) { background-color: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: var(--font-mono); color: var(--accent-blue); }
.coach-response :deep(.coach-list-item) { display: flex; align-items: flex-start; gap: 8px; margin: 6px 0; padding: 6px 10px; background-color: var(--bg-tertiary); border-radius: 6px; border-left: 3px solid var(--border-color); }
.coach-response :deep(.coach-list-num) { color: var(--accent-purple); font-weight: 600; min-width: 20px; }
.coach-response :deep(.coach-list-bullet) { color: var(--accent-purple); font-weight: bold; }
.coach-response :deep(.coach-icon-error) { color: var(--accent-red); }
.coach-response :deep(.coach-icon-success) { color: var(--accent-green); }
.coach-response :deep(.coach-icon-warning) { color: var(--accent-orange); }

/* Mode badge */
.mode-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.3px;
  line-height: 1;
}
.badge-llm {
  background-color: rgba(88, 166, 255, 0.15);
  color: var(--accent-blue);
  border: 1px solid rgba(88, 166, 255, 0.3);
}
.badge-n8n {
  background-color: rgba(210, 153, 34, 0.15);
  color: var(--accent-orange);
  border: 1px solid rgba(210, 153, 34, 0.3);
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}
.copy-btn:hover {
  color: var(--accent-purple);
  border-color: var(--border-color);
  background-color: var(--bg-secondary);
}
.copy-btn svg {
  width: 13px;
  height: 13px;
}

.streaming-cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background-color: var(--accent-purple);
  margin-left: 2px;
  vertical-align: text-bottom;
  border-radius: 1px;
  animation: blink 0.9s step-end infinite;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.cancel-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.cancel-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
  background-color: rgba(248, 81, 73, 0.1);
  color: var(--accent-red);
  border: 1px solid rgba(248, 81, 73, 0.3);
  cursor: pointer;
  transition: background-color 0.15s;
  margin-top: 12px;
}
.cancel-btn:hover { background-color: rgba(248, 81, 73, 0.2); }
.cancel-icon { width: 12px; height: 12px; }

.retry-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.15s;
}
.retry-btn:hover:not(:disabled) {
  color: var(--accent-purple);
  border-color: var(--accent-purple);
}
.retry-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.retry-icon { width: 12px; height: 12px; }
</style>
