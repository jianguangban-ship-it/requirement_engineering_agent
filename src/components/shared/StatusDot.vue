<template>
  <span class="status-dot" :class="statusClass"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: 'idle' | 'loading' | 'success' | 'error'
}>()

const statusClass = computed(() => `status-${props.status}`)
</script>

<style scoped>
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.status-idle { background-color: var(--text-muted); }
.status-loading { background-color: var(--accent-orange); animation: pulse 1s ease-in-out infinite; }
.status-success { background-color: var(--accent-green); }
.status-error { background-color: var(--accent-red); }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
