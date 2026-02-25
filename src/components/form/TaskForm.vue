<template>
  <div class="task-form">
    <!-- Error Banner -->
    <Transition name="slide-fade">
      <div v-if="errorMessage" class="error-banner">
        <div class="error-content">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path stroke-linecap="round" d="M12 8v4m0 4h.01"/>
          </svg>
          <span class="error-text">{{ errorMessage }}</span>
        </div>
        <button class="error-close" @click="$emit('clearError')">
          <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </Transition>

    <div class="form-card">
      <BasicInfoSection
        :form="form"
        @project-change="$emit('projectChange')"
      />

      <SummaryBuilder
        :summary="summary"
        :component-history="componentHistory"
        :computed-summary="computedSummary"
        :quality-score="qualityScore"
        :quality-score-color="qualityScoreColor"
        :quality-score-label="qualityScoreLabel"
      />

      <DescriptionEditor v-model="form.description" />

      <!-- Action Buttons -->
      <div class="form-actions">
        <button class="btn btn-ghost" :disabled="isSubmitting" @click="$emit('reset')">
          {{ t('form.reset') }}
        </button>
        <div class="action-group">
          <Transition name="fade">
            <button
              v-if="hasAiResponse"
              @click="$emit('create')"
              :disabled="isSubmitting"
              class="btn btn-success"
            >
              <svg v-if="isSubmitting && currentAction === 'create'" class="btn-icon animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
                <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round" opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
              </svg>
              <svg v-else class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              <span>{{ isSubmitting && currentAction === 'create' ? t('form.creating') : t('form.confirmCreate') }}</span>
              <kbd class="shortcut-hint">{{ t('shortcuts.create') }}</kbd>
            </button>
          </Transition>
          <button
            @click="$emit('analyze')"
            :disabled="!canSubmit || isSubmitting"
            class="btn btn-primary"
            :class="{ dimmed: hasAiResponse }"
          >
            <svg v-if="isSubmitting && currentAction === 'analyze'" class="btn-icon animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
              <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round" opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            <svg v-else class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
            <span>{{ isSubmitting && currentAction === 'analyze' ? t('form.analyzing') : t('form.aiAnalyze') }}</span>
            <kbd class="shortcut-hint">{{ t('shortcuts.analyze') }}</kbd>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormState, SummaryState } from '@/types/form'
import { useI18n } from '@/i18n'
import BasicInfoSection from './BasicInfoSection.vue'
import SummaryBuilder from './SummaryBuilder.vue'
import DescriptionEditor from './DescriptionEditor.vue'

defineProps<{
  form: FormState
  summary: SummaryState
  componentHistory: string[]
  computedSummary: string
  qualityScore: number
  qualityScoreColor: string
  qualityScoreLabel: string
  canSubmit: boolean
  isSubmitting: boolean
  currentAction: string
  hasAiResponse: boolean
  errorMessage: string
}>()

defineEmits<{
  analyze: []
  create: []
  reset: []
  projectChange: []
  clearError: []
}>()

const { t } = useI18n()
</script>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.error-banner {
  padding: 12px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--accent-red);
  background-color: rgba(248, 81, 73, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
}
.error-icon {
  width: 16px;
  height: 16px;
  color: var(--accent-red);
  flex-shrink: 0;
}
.error-text {
  font-size: 14px;
  color: var(--accent-red);
}
.error-close {
  padding: 4px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  transition: background-color 0.15s;
}
.error-close:hover {
  background-color: rgba(255,255,255,0.1);
}
.close-icon {
  width: 16px;
  height: 16px;
}
.form-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  overflow: hidden;
}
.form-actions {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.action-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
}
.btn-icon {
  width: 16px;
  height: 16px;
}
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.btn-ghost:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
}
.btn-ghost:disabled {
  opacity: 0.5;
}
.btn-primary {
  background-color: var(--accent-blue);
  color: white;
}
.btn-primary:disabled {
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
}
.btn-primary.dimmed {
  opacity: 0.7;
}
.btn-success {
  background-color: var(--accent-green);
  color: white;
  animation: fadeIn 0.3s ease-out;
}
.shortcut-hint {
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 3px;
  background-color: rgba(255,255,255,0.15);
  font-family: var(--font-sans);
  opacity: 0.7;
}
</style>
