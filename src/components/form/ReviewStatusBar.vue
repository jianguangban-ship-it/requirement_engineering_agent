<template>
  <div class="review-status-bar">
    <!-- Step pipeline -->
    <div class="status-pipeline">
      <div
        v-for="(step, i) in REVIEW_STEPS"
        :key="step.id"
        class="pipeline-step"
        :class="{
          'step-done': i < currentStepIndex,
          'step-active': i === currentStepIndex,
          'step-future': i > currentStepIndex
        }"
      >
        <div class="step-dot" :style="i <= currentStepIndex ? { backgroundColor: step.iconColor } : {}">
          <svg v-if="i < currentStepIndex" class="step-check" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          <span v-else class="step-num">{{ i + 1 }}</span>
        </div>
        <span class="step-label">{{ isZh ? step.labelZh : step.labelEn }}</span>
        <div v-if="i < REVIEW_STEPS.length - 1" class="step-line" :class="{ 'line-done': i < currentStepIndex }" />
      </div>
    </div>

    <!-- Peer review checklist (visible at ai-reviewed stage) -->
    <Transition name="slide-fade">
      <div v-if="reviewStatus === 'ai-reviewed'" class="checklist-section">
        <h3 class="checklist-title">
          {{ isZh ? '同行评审清单' : 'Peer Review Checklist' }}
          <span class="check-progress" :class="allChecked ? 'progress-done' : ''">{{ checkProgress }}%</span>
        </h3>
        <div class="checklist-items">
          <label
            v-for="item in checklist"
            :key="item.id"
            class="checklist-item"
            :class="{ checked: checkedItems.has(item.id) }"
          >
            <input
              type="checkbox"
              :checked="checkedItems.has(item.id)"
              @change="$emit('toggleCheck', item.id)"
              class="check-input"
            />
            <span class="check-label">{{ isZh ? item.labelZh : item.labelEn }}</span>
          </label>
        </div>
        <button
          v-if="allChecked"
          class="approve-btn"
          @click="$emit('approve')"
        >
          <svg class="approve-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          {{ isZh ? '批准' : 'Approve' }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { ReviewStatus } from '@/config/domain/review-workflow'
import { REVIEW_STEPS } from '@/config/domain/review-workflow'
import { useI18n } from '@/i18n'

defineProps<{
  reviewStatus: ReviewStatus
  currentStepIndex: number
  checklist: { id: string; labelEn: string; labelZh: string }[]
  checkedItems: Set<string>
  allChecked: boolean
  checkProgress: number
}>()

defineEmits<{
  approve: []
  toggleCheck: [itemId: string]
}>()

const { isZh } = useI18n()
</script>

<style scoped>
.review-status-bar {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

/* Pipeline */
.status-pipeline {
  display: flex;
  align-items: flex-start;
}
.pipeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 0;
}
.step-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid var(--border-color);
  background-color: var(--bg-tertiary);
  color: var(--text-muted);
  z-index: 1;
  transition: all 0.3s;
}
.step-active .step-dot {
  border-color: transparent;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
}
.step-done .step-dot {
  border-color: transparent;
}
.step-check {
  width: 12px;
  height: 12px;
}
.step-num {
  font-size: 10px;
}
.step-label {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 4px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.step-active .step-label {
  color: var(--text-primary);
  font-weight: 600;
}
.step-line {
  position: absolute;
  top: 11px;
  left: calc(50% + 14px);
  right: calc(-50% + 14px);
  height: 2px;
  background-color: var(--border-color);
  z-index: 0;
}
.line-done {
  background-color: var(--accent-green);
}

/* Checklist */
.checklist-section {
  margin-top: 10px;
  padding: 10px;
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
}
.checklist-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.check-progress {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-orange);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background-color: var(--orange-subtle);
}
.check-progress.progress-done {
  color: var(--accent-green);
  background-color: var(--green-subtle);
}
.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.checklist-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s;
  font-size: 11px;
  color: var(--text-secondary);
}
.checklist-item:hover {
  background-color: var(--bg-secondary);
}
.checklist-item.checked {
  color: var(--text-muted);
  text-decoration: line-through;
}
.check-input {
  accent-color: var(--accent-green);
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.approve-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  padding: 5px 14px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  background-color: var(--accent-green);
  color: white;
  border: none;
  cursor: pointer;
  transition: filter 0.15s;
}
.approve-btn:hover {
  filter: brightness(1.15);
}
.approve-icon {
  width: 12px;
  height: 12px;
}

/* Slide fade transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
