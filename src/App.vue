<template>
  <div class="app">
    <AppHeader />

    <!-- Confirmation Modal -->
    <Transition name="modal">
      <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
        <div class="modal-content">
          <h3 class="modal-title">{{ t('modal.confirmTitle') }}</h3>
          <p class="modal-hint">{{ t('modal.confirmHint') }}</p>
          <div class="modal-payload">
            <JsonViewer :data="jsonPayload" :copyable="true" />
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="showConfirmModal = false">
              {{ t('modal.cancel') }}
            </button>
            <button class="btn btn-success" @click="confirmCreate">
              {{ t('modal.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <main class="app-main">
      <div class="grid-layout">
        <!-- LEFT: AI Coach -->
        <div class="col-left">
          <CoachPanel
            :response="coachResponse"
            :is-loading="isCoachLoading"
            :can-request="canSubmit"
            @request="handleCoachRequest"
            @apply-chip="applyCoachChip"
          />
        </div>

        <!-- CENTER: Task Form -->
        <div class="col-center">
          <TaskForm
            :form="form"
            :summary="summary"
            :component-history="componentHistory"
            :computed-summary="computedSummary"
            :quality-score="qualityScore"
            :quality-score-color="qualityScoreColor"
            :quality-score-label="qualityScoreLabel"
            :can-submit="canSubmit"
            :is-submitting="isSubmitting"
            :current-action="currentAction"
            :has-ai-response="!!aiAgentResponse"
            :error-message="errorMessage"
            @analyze="handleAnalyze"
            @create="handleCreateClick"
            @reset="handleReset"
            @project-change="onProjectChange"
            @clear-error="errorMessage = ''"
          />
        </div>

        <!-- RIGHT: AI Review + JIRA -->
        <div class="col-right">
          <AIReviewPanel
            :response="aiAgentResponse"
            :is-analyzing="isSubmitting && currentAction === 'analyze'"
            :has-error="!!errorMessage && currentAction === 'analyze'"
          />

          <JiraResponsePanel
            :response="jiraResponse"
            :is-creating="isSubmitting && currentAction === 'create'"
          />

          <ProcessingSummary
            :ai-response="aiAgentResponse"
            :jira-response="jiraResponse"
            :estimated-points="form.estimatedPoints"
          />

          <DevTools :payload="jsonPayload" />
        </div>
      </div>
    </main>

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { WebhookPayload } from '@/types/api'
import { useI18n } from '@/i18n'
import { useForm } from '@/composables/useForm'
import { useWebhook } from '@/composables/useWebhook'
import { useToast } from '@/composables/useToast'

import AppHeader from '@/components/layout/AppHeader.vue'
import TaskForm from '@/components/form/TaskForm.vue'
import CoachPanel from '@/components/panels/CoachPanel.vue'
import AIReviewPanel from '@/components/panels/AIReviewPanel.vue'
import JiraResponsePanel from '@/components/panels/JiraResponsePanel.vue'
import ProcessingSummary from '@/components/panels/ProcessingSummary.vue'
import DevTools from '@/components/dev/DevTools.vue'
import ToastContainer from '@/components/shared/ToastContainer.vue'
import JsonViewer from '@/components/shared/JsonViewer.vue'

const { t, isZh } = useI18n()
const { addToast } = useToast()

const {
  form, summary, componentHistory, computedSummary,
  canSubmit, qualityScore, qualityScoreColor, qualityScoreLabel,
  getProjectName, resetForm, addComponentToHistory, restoreDraft
} = useForm()

const {
  isSubmitting, currentAction,
  aiAgentResponse, jiraResponse, coachResponse, isCoachLoading,
  analyzeTask, createJiraTicket, requestCoach, clearResponses
} = useWebhook()

const errorMessage = ref('')
const showConfirmModal = ref(false)

// Build payload
function buildPayload(action: 'analyze' | 'create' | 'coach' | 'preview'): WebhookPayload {
  return {
    meta: {
      source: 'jira_agent_ui_v8.0',
      timestamp: Date.now(),
      action
    },
    data: {
      project_key: form.projectKey,
      project_name: getProjectName(),
      issue_type: form.issueType,
      summary: computedSummary.value,
      description: form.description,
      assignee: form.assignee,
      estimated_points: form.estimatedPoints
    }
  }
}

const jsonPayload = computed(() => JSON.stringify(buildPayload('preview'), null, 2))

// Handlers
async function handleAnalyze() {
  if (!canSubmit.value || isSubmitting.value) return
  errorMessage.value = ''
  const err = await analyzeTask(buildPayload('analyze'))
  if (err) {
    errorMessage.value = err
    addToast('error', err)
  } else {
    addToast('success', t('toast.analyzeSuccess'))
    addComponentToHistory(summary.component)
  }
}

function handleCreateClick() {
  showConfirmModal.value = true
}

async function confirmCreate() {
  showConfirmModal.value = false
  errorMessage.value = ''
  const err = await createJiraTicket(buildPayload('create'))
  if (err) {
    errorMessage.value = err
    addToast('error', err)
  } else {
    addToast('success', t('toast.createSuccess'))
  }
}

async function handleCoachRequest() {
  if (!canSubmit.value || isCoachLoading.value) return
  errorMessage.value = ''
  const err = await requestCoach(buildPayload('coach'))
  if (err) {
    errorMessage.value = err
    addToast('error', err)
  } else {
    addToast('success', t('toast.coachSuccess'))
  }
}

function handleReset() {
  resetForm()
  clearResponses()
  errorMessage.value = ''
  addToast('info', t('toast.draftCleared'))
}

function onProjectChange() {
  form.assignee = ''
}

// Coach chip templates
function applyCoachChip(chipKey: string) {
  const lang = isZh.value ? 'zh' : 'en'
  const templates: Record<string, Record<string, string>> = {
    template: {
      zh: '**背景信息**\n\n\n**前置需求**\n\n\n**设计思路**\n\n\n**验收标准 (AC)**\n- [ ] AC1: \n- [ ] AC2: \n- [ ] AC3: \n\n**备注**\n',
      en: '**Background**\n\n\n**Prerequisites**\n\n\n**Design Approach**\n\n\n**Acceptance Criteria (AC)**\n- [ ] AC1: \n- [ ] AC2: \n- [ ] AC3: \n\n**Notes**\n'
    },
    optimize: {
      zh: '请基于以下信息帮我优化任务描述：\n\n**当前问题/目标**\n\n\n**期望结果**\n\n\n**实现方案**\n\n\n**影响范围**\n',
      en: 'Please help optimize the task description based on:\n\n**Current Problem/Goal**\n\n\n**Expected Outcome**\n\n\n**Implementation Plan**\n\n\n**Impact Scope**\n'
    },
    bugReport: {
      zh: '**缺陷描述**\n\n\n**复现步骤**\n1. \n2. \n3. \n\n**期望行为**\n\n\n**实际行为**\n\n\n**环境信息**\n- 车型/平台: \n- 软件版本: \n- 硬件版本: \n',
      en: '**Bug Description**\n\n\n**Steps to Reproduce**\n1. \n2. \n3. \n\n**Expected Behavior**\n\n\n**Actual Behavior**\n\n\n**Environment**\n- Vehicle/Platform: \n- SW Version: \n- HW Version: \n'
    },
    changeReq: {
      zh: '**变更请求**\n\n**变更原因**\n\n\n**变更内容**\n\n\n**影响分析**\n- 功能影响: \n- 接口影响: \n- 测试影响: \n\n**验收标准**\n- [ ] \n',
      en: '**Change Request**\n\n**Reason for Change**\n\n\n**Change Content**\n\n\n**Impact Analysis**\n- Functional: \n- Interface: \n- Testing: \n\n**Acceptance Criteria**\n- [ ] \n'
    }
  }
  const tpl = templates[chipKey]?.[lang]
  if (tpl) form.description = tpl
}

// Keyboard shortcuts
function handleKeyboard(e: KeyboardEvent) {
  if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
    e.preventDefault()
    if (aiAgentResponse.value) handleCreateClick()
  } else if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault()
    handleAnalyze()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyboard)
  const hadDraft = restoreDraft()
  if (hadDraft) {
    addToast('info', t('toast.draftRestored'))
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard)
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-main {
  max-width: 2000px;
  margin: 0 auto;
  padding: 24px;
  flex: 1;
  width: 100%;
}
.grid-layout {
  display: grid;
  grid-template-columns: 3fr 3fr 2fr;
  gap: 20px;
}
.col-left,
.col-center {
  min-width: 0;
}
.col-right {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Confirmation Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5000;
  padding: 24px;
}
.modal-content {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: scaleIn 0.2s ease-out;
}
.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}
.modal-hint {
  font-size: 13px;
  color: var(--text-muted);
}
.modal-payload {
  padding: 12px;
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  max-height: 400px;
  overflow-y: auto;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Shared button styles */
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
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.btn-ghost:hover {
  background-color: var(--bg-tertiary);
}
.btn-success {
  background-color: var(--accent-green);
  color: white;
}
.btn-success:hover {
  opacity: 0.9;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 1024px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}
</style>
