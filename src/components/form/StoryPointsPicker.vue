<template>
  <div class="points-picker">
    <button
      v-for="point in points"
      :key="point"
      @click="$emit('update:modelValue', point)"
      class="point-btn"
      :class="{ active: modelValue === point }"
    >
      {{ point }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { FIBONACCI_POINTS } from '@/config/constants'

defineProps<{
  modelValue: number
}>()

defineEmits<{
  'update:modelValue': [value: number]
}>()

const points = FIBONACCI_POINTS
</script>

<style scoped>
.points-picker {
  display: flex;
  gap: 6px;
}
.point-btn {
  width: 40px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  font-size: 14px;
  font-weight: 500;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  transition: all 0.2s;
}
.point-btn.active {
  background-color: var(--accent-blue);
  border-color: var(--accent-blue);
  color: white;
}
.point-btn:hover:not(.active) {
  border-color: var(--accent-blue);
  color: var(--accent-blue);
}
</style>
