<template>
  <div class="json-viewer">
    <div class="json-header" v-if="copyable">
      <button class="copy-btn" @click="copyJson" :title="t('toast.copied')">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
      </button>
    </div>
    <div class="json-display" v-html="formattedJson"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatJson } from '@/utils/formatJson'
import { useI18n } from '@/i18n'
import { useToast } from '@/composables/useToast'

const props = withDefaults(defineProps<{
  data: unknown
  copyable?: boolean
}>(), {
  copyable: true
})

const { t } = useI18n()
const { addToast } = useToast()

const formattedJson = computed(() => formatJson(props.data))

function copyJson() {
  const text = typeof props.data === 'string' ? props.data : JSON.stringify(props.data, null, 2)
  navigator.clipboard.writeText(text).then(() => {
    addToast('success', t('toast.copied'))
  })
}
</script>

<style scoped>
.json-viewer {
  position: relative;
}
.json-header {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
}
.copy-btn {
  padding: 4px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.copy-btn:hover {
  color: var(--accent-blue);
  border-color: var(--accent-blue);
}
.icon {
  width: 14px;
  height: 14px;
}
.json-display {
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
.json-display :deep(.json-string) { color: #a5d6ff; }
.json-display :deep(.json-number) { color: #79c0ff; }
.json-display :deep(.json-boolean) { color: #ff7b72; }
.json-display :deep(.json-null) { color: #8b949e; }
</style>
