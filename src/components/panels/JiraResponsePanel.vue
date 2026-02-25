<template>
  <PanelShell
    :title="t('panel.jiraResponse')"
    :status="statusInfo.status"
    :status-label="t('status.' + statusInfo.key)"
    max-height="280px"
  >
    <template #icon>
      <svg class="panel-icon" style="color: var(--accent-blue);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
      </svg>
    </template>

    <!-- Empty state -->
    <div v-if="!response" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <p class="empty-text">{{ t('panel.waitingJira') }}</p>
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
  isCreating: boolean
}>()

const { t } = useI18n()

const parsedResponse = computed(() => {
  if (!props.response) return null
  try {
    return typeof props.response === 'string' ? JSON.parse(props.response) : props.response
  } catch { return null }
})

const statusInfo = computed(() => {
  if (props.isCreating) return { status: 'loading' as const, key: 'pending' }
  if (parsedResponse.value) {
    const key = (parsedResponse.value as Record<string, unknown>)?.key
    if (key && key !== 'PENDING') return { status: 'success' as const, key: 'created' }
    return { status: 'loading' as const, key: 'pending' }
  }
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
</style>
