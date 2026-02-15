<template>
  <div class="dev-tools">
    <details>
      <summary class="dev-summary">{{ t('dev.viewPayload') }}</summary>
      <div class="dev-content">
        <JsonViewer :data="payload" />
      </div>
    </details>

    <details>
      <summary class="dev-summary">⚡ {{ t('dev.webhookConfig') }}</summary>
      <div class="dev-config">
        <div class="config-row">
          <span class="config-label">{{ t('dev.currentMode') }}:</span>
          <span :style="{ color: isProd ? 'var(--accent-green)' : 'var(--accent-orange)' }">
            {{ isProd ? t('dev.production') : t('dev.testing') }}
          </span>
        </div>
        <div class="config-row">
          <span class="config-label">Active URL:</span>
          <code class="config-url">{{ activeUrl }}</code>
        </div>
        <div class="config-hint">
          💡 {{ t('dev.configHint') }} <code class="config-code">WEBHOOK_CONFIG</code>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'
import { WEBHOOK_CONFIG, useProductionMode } from '@/config/webhook'
import { computed } from 'vue'
import JsonViewer from '@/components/shared/JsonViewer.vue'

defineProps<{
  payload: string
}>()

const { t } = useI18n()
const isProd = useProductionMode

const activeUrl = computed(() =>
  isProd.value ? WEBHOOK_CONFIG.prodUrl : WEBHOOK_CONFIG.testUrl
)
</script>

<style scoped>
.dev-tools {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dev-summary {
  cursor: pointer;
  font-size: 12px;
  padding: 4px 0;
  color: var(--text-muted);
}
.dev-content {
  margin-top: 8px;
  padding: 12px;
  border-radius: var(--radius-lg);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  overflow-x: auto;
}
.dev-config {
  margin-top: 8px;
  padding: 16px;
  border-radius: var(--radius-lg);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 12px;
}
.config-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.config-label {
  color: var(--text-muted);
}
.config-url {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  background-color: var(--bg-tertiary);
  color: var(--accent-blue);
  font-family: var(--font-mono);
  font-size: 11px;
}
.config-hint {
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
}
.config-code {
  color: var(--accent-green);
}
</style>
