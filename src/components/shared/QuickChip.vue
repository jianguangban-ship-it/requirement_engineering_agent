<template>
  <button class="quick-chip" @click="$emit('click')">
    <span class="chip-icon">{{ icon }}</span>
    <span class="chip-label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.quick-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-muted);
  transition: all 0.2s ease;
  white-space: nowrap;
}
.quick-chip:hover {
  border-color: var(--accent-blue);
  color: var(--accent-blue);
  background-color: rgba(88, 166, 255, 0.08);
}
.chip-icon,
.chip-label {
  font-size: 12px;
}
</style>
