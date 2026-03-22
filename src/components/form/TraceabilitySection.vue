<template>
  <div class="traceability-section">
    <h2 class="section-title">
      {{ t('traceability.title') }}
      <span class="section-subtitle">· {{ t('traceability.subtitle') }}</span>
    </h2>
    <div class="trace-fields">
      <div class="field">
        <label class="field-label" for="req-level">{{ t('traceability.level') }}</label>
        <select id="req-level" v-model="form.requirementLevel" class="input-base field-select">
          <option value="none">—</option>
          <option v-for="l in availableLevels" :key="l.id" :value="l.id">
            {{ isZh ? l.labelZh : l.labelEn }} ({{ l.aspiceId }})
          </option>
        </select>
      </div>
      <div class="field">
        <label class="field-label" for="parent-req">{{ t('traceability.parentReq') }}</label>
        <input
          id="parent-req"
          type="text"
          v-model="form.parentReqId"
          class="input-base field-input"
          :placeholder="t('traceability.parentPlaceholder')"
        />
      </div>
      <div class="field">
        <label class="field-label" for="verify-method">{{ t('traceability.verifyMethod') }}</label>
        <select id="verify-method" v-model="form.verificationMethod" class="input-base field-select">
          <option value="">—</option>
          <option v-for="m in verifyMethods" :key="m.value" :value="m.value">
            {{ isZh ? m.zh : m.en }}
          </option>
        </select>
      </div>
    </div>
    <div class="trace-actions" v-if="form.requirementLevel !== 'none'">
      <button class="suggest-btn" @click="$emit('suggestLinks')" :title="t('traceability.suggestHint')">
        <svg class="suggest-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
        </svg>
        {{ t('traceability.suggestBtn') }}
      </button>
      <button class="impact-btn" @click="$emit('impactAnalysis')" :title="t('traceability.impactHint')">
        <svg class="suggest-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        {{ t('traceability.impactBtn') }}
      </button>
    </div>
    <TransitionGroup name="gap-list" tag="div" class="trace-gaps" v-if="traceabilityGaps.length">
      <div
        v-for="g in traceabilityGaps"
        :key="g.id"
        class="trace-gap"
        :class="'gap-' + g.severity"
      >
        <svg class="gap-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
        </svg>
        <span class="gap-text">{{ isZh ? g.messageZh : g.messageEn }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormState } from '@/types/form'
import type { TraceabilityGap } from '@/config/domain'
import { REQUIREMENT_LEVELS, getLevelsForRole } from '@/config/domain'
import { currentRole } from '@/composables/useRole'
import { useI18n } from '@/i18n'

const props = defineProps<{
  form: FormState
  traceabilityGaps: TraceabilityGap[]
}>()

defineEmits<{
  suggestLinks: []
  impactAnalysis: []
}>()

const { t, isZh } = useI18n()

const availableLevels = computed(() => {
  // Show role-specific levels + all levels for flexibility
  const roleLevels = getLevelsForRole(currentRole.value)
  const roleIds = new Set(roleLevels.map(l => l.id))
  const others = REQUIREMENT_LEVELS.filter(l => !roleIds.has(l.id))
  return [...roleLevels, ...others]
})

const verifyMethods = [
  { value: 'test', en: 'Test', zh: '测试' },
  { value: 'analysis', en: 'Analysis', zh: '分析' },
  { value: 'review', en: 'Review', zh: '评审' },
  { value: 'simulation', en: 'Simulation', zh: '仿真' },
  { value: 'demonstration', en: 'Demonstration', zh: '演示' }
]
</script>

<style scoped>
.traceability-section {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}
.section-title {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.section-subtitle {
  font-weight: 400;
  text-transform: none;
}
.trace-fields {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.field-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.field-select,
.field-input {
  font-size: 12px;
  padding: 8px;
}
.trace-actions {
  margin-top: 8px;
  display: flex;
  gap: 6px;
}
.suggest-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
  background-color: var(--bg-tertiary);
  color: var(--accent-blue);
  border: 1px solid var(--blue-border, var(--border-color));
  cursor: pointer;
  transition: all 0.15s;
}
.suggest-btn:hover {
  background-color: var(--blue-subtle, rgba(96, 165, 250, 0.1));
  border-color: var(--accent-blue);
}
.impact-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
  background-color: var(--bg-tertiary);
  color: var(--accent-orange);
  border: 1px solid var(--orange-border, var(--border-color));
  cursor: pointer;
  transition: all 0.15s;
}
.impact-btn:hover {
  background-color: var(--orange-subtle, rgba(251, 191, 36, 0.1));
  border-color: var(--accent-orange);
}
.suggest-icon {
  width: 12px;
  height: 12px;
}
.trace-gaps {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 8px;
}
.trace-gap {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  line-height: 1.4;
}
.gap-warning {
  background-color: var(--orange-subtle, rgba(251, 191, 36, 0.08));
  color: var(--accent-orange);
}
.gap-info {
  background-color: var(--blue-subtle, rgba(96, 165, 250, 0.08));
  color: var(--accent-blue);
}
.gap-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.gap-list-enter-active,
.gap-list-leave-active {
  transition: all 0.25s ease;
}
.gap-list-enter-from,
.gap-list-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .trace-fields {
    grid-template-columns: 1fr;
  }
}
</style>
