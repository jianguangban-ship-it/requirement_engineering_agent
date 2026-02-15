<template>
  <div class="description-editor">
    <h2 class="section-title">
      {{ t('form.taskDescription') }}
      <span class="required-tag">* {{ t('form.required') }}</span>
    </h2>
    <textarea
      v-model="model"
      class="input-base desc-textarea"
      :placeholder="t('form.descriptionPlaceholder')"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'

const model = defineModel<string>({ required: true })
const { t } = useI18n()
</script>

<style scoped>
.description-editor {
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
.required-tag {
  font-weight: 400;
  text-transform: none;
  color: var(--accent-orange);
}
.desc-textarea {
  min-height: 160px;
  resize: vertical;
  font-size: 14px;
}
</style>
