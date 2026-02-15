<template>
  <PanelShell
    :title="t('panel.aiAgentResponse')"
    :status="statusInfo.status"
    :status-label="t('status.' + statusInfo.key)"
    resizable
  >
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
    </div>

    <!-- Loading state -->
    <div v-else-if="isAnalyzing" class="empty-state">
      <svg class="spinner" style="color: var(--accent-purple);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
        <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round" opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
      </svg>
      <p class="loading-text" style="color: var(--accent-purple);">{{ t('panel.aiAnalyzing') }}</p>
    </div>

    <!-- JSON result -->
    <JsonViewer v-else :data="response" />
  </PanelShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import PanelShell from '@/components/layout/PanelShell.vue'
import JsonViewer from '@/components/shared/JsonViewer.vue'

const props = defineProps<{
  response: unknown
  isAnalyzing: boolean
  hasError: boolean
}>()

const { t } = useI18n()

const statusInfo = computed(() => {
  if (props.isAnalyzing) return { status: 'loading' as const, key: 'loading' }
  if (props.response) return { status: 'success' as const, key: 'success' }
  if (props.hasError) return { status: 'error' as const, key: 'error' }
  return { status: 'idle' as const, key: 'idle' }
})
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
</style>
