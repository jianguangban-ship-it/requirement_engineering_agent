<template>
  <div class="quality-meter">
    <div class="meter-header">
      <div class="meter-left">
        <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
        <span class="meter-label">{{ label }}</span>
      </div>
      <div class="meter-right">
        <slot name="header-actions" />
        <span class="meter-score" :style="{ color: scoreColor }">{{ score }}%</span>
        <span class="meter-quality" :style="{ color: scoreColor }">{{ qualityLabel }}</span>
      </div>
    </div>
    <div class="meter-track">
      <div class="meter-fill" :style="{ width: score + '%', backgroundColor: scoreColor }"></div>
    </div>
    <code class="meter-preview" :class="{ filled: !!preview }">
      {{ preview || placeholder }}
    </code>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  score: number
  scoreColor: string
  qualityLabel: string
  preview: string
  placeholder: string
}>()
</script>

<style scoped>
.quality-meter {
  padding: 8px;
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
}
.meter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.meter-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.eye-icon {
  width: 12px;
  height: 12px;
  color: var(--accent-green);
}
.meter-label {
  font-size: 12px;
  color: var(--text-muted);
}
.meter-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.meter-score {
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 500;
}
.meter-quality {
  font-size: 12px;
}
.meter-track {
  width: 100%;
  height: 3px;
  border-radius: var(--radius-full);
  background-color: var(--bg-secondary);
  overflow: hidden;
  margin-bottom: 8px;
}
.meter-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: all 0.5s ease-out;
}
.meter-preview {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  display: block;
}
.meter-preview.filled {
  color: var(--accent-green);
}
</style>
