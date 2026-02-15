<template>
  <div class="summary-builder">
    <h2 class="section-title">
      {{ t('form.taskSummary') }}
      <span class="section-subtitle">· {{ t('form.fivePartInput') }}</span>
    </h2>
    <div class="fields-grid">
      <div class="field">
        <label class="field-label">{{ t('form.vehicle') }}</label>
        <select v-model="summary.vehicle" class="input-base field-select">
          <option value="">{{ t('form.select') }}</option>
          <option v-for="v in VEHICLE_OPTIONS" :key="v" :value="v">{{ v }}</option>
        </select>
      </div>
      <div class="field">
        <label class="field-label">{{ t('form.product') }}</label>
        <select v-model="summary.product" class="input-base field-select">
          <option value="">{{ t('form.select') }}</option>
          <option v-for="p in PRODUCT_OPTIONS" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <div class="field">
        <label class="field-label">{{ t('form.layer') }}</label>
        <select v-model="summary.layer" class="input-base field-select">
          <option value="">{{ t('form.select') }}</option>
          <option v-for="l in LAYER_OPTIONS" :key="l" :value="l">{{ l }}</option>
        </select>
      </div>
      <div class="field">
        <label class="field-label">{{ t('form.component') }}</label>
        <input
          type="text"
          v-model="summary.component"
          list="component-history"
          class="input-base field-input"
          :placeholder="t('form.componentPlaceholder')"
        />
        <datalist id="component-history">
          <option v-for="c in componentHistory" :key="c" :value="c"></option>
        </datalist>
      </div>
    </div>
    <div class="detail-field">
      <label class="field-label">{{ t('form.taskDetail') }}</label>
      <input
        type="text"
        v-model="summary.detail"
        class="input-base field-input"
        :placeholder="t('form.taskDetailPlaceholder')"
      />
    </div>
    <QualityMeter
      :label="t('form.livePreview')"
      :score="qualityScore"
      :score-color="qualityScoreColor"
      :quality-label="qualityScoreLabel"
      :preview="computedSummary"
      :placeholder="t('form.previewPlaceholder')"
    />
  </div>
</template>

<script setup lang="ts">
import type { SummaryState } from '@/types/form'
import { VEHICLE_OPTIONS, PRODUCT_OPTIONS, LAYER_OPTIONS } from '@/config/constants'
import { useI18n } from '@/i18n'
import QualityMeter from './QualityMeter.vue'

defineProps<{
  summary: SummaryState
  componentHistory: string[]
  computedSummary: string
  qualityScore: number
  qualityScoreColor: string
  qualityScoreLabel: string
}>()

const { t } = useI18n()
</script>

<style scoped>
.summary-builder {
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
.fields-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 8px;
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
.detail-field {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .fields-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
