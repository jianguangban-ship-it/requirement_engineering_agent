<template>
  <Transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal-content">
        <h3 class="modal-title">{{ t('settings.title') }}</h3>

        <!-- Coach Mode Toggle -->
        <div class="field-group">
          <label class="field-label">{{ t('settings.coachMode') }}</label>
          <div class="toggle-group">
            <button
              class="toggle-btn"
              :class="{ active: localMode === 'llm' }"
              @click="localMode = 'llm'"
            >
              {{ t('settings.modeLLM') }}
            </button>
            <button
              class="toggle-btn"
              :class="{ active: localMode === 'webhook' }"
              @click="localMode = 'webhook'"
            >
              {{ t('settings.modeWebhook') }}
            </button>
          </div>
        </div>

        <!-- Analyze Mode Toggle -->
        <div class="field-group">
          <label class="field-label">{{ t('settings.analyzeMode') }}</label>
          <div class="toggle-group">
            <button
              class="toggle-btn"
              :class="{ active: localAnalyzeMode === 'llm' }"
              @click="localAnalyzeMode = 'llm'"
            >
              {{ t('settings.modeLLM') }}
            </button>
            <button
              class="toggle-btn"
              :class="{ active: localAnalyzeMode === 'webhook' }"
              @click="localAnalyzeMode = 'webhook'"
            >
              {{ t('settings.modeWebhook') }}
            </button>
          </div>
        </div>

        <!-- GLM API Key (only relevant in LLM mode) -->
        <div class="field-group" :class="{ dimmed: bothWebhook }">
          <label class="field-label">{{ t('settings.apiKey') }}</label>
          <div class="key-row">
            <input
              v-model="localApiKey"
              type="password"
              class="field-input"
              :placeholder="t('settings.apiKeyPlaceholder')"
              :disabled="bothWebhook"
            />
            <button
              class="btn-test"
              :disabled="bothWebhook || !localApiKey.trim() || validationState === 'testing'"
              @click="handleTestKey"
            >
              {{ validationState === 'testing' ? t('settings.testing') : t('settings.testKey') }}
            </button>
          </div>
          <div v-if="validationState === 'valid'" class="key-badge key-badge--valid">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {{ t('settings.keyValid') }}
          </div>
          <div v-else-if="validationState === 'invalid'" class="key-badge key-badge--invalid">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            {{ validationError }}
          </div>
        </div>

        <!-- Model Name -->
        <div class="field-group" :class="{ dimmed: bothWebhook }">
          <label class="field-label">{{ t('settings.model') }}</label>
          <input
            v-model="localModel"
            type="text"
            class="field-input"
            :placeholder="t('settings.modelPlaceholder')"
            :disabled="bothWebhook"
          />
        </div>

        <!-- Coach Skill Editor -->
        <div class="field-group" :class="{ dimmed: localMode === 'webhook' }">
          <div class="skill-header">
            <label class="field-label">{{ t('settings.coachSkill') }}</label>
            <button class="btn-reset" @click="handleResetCoach" :disabled="localMode === 'webhook'">
              {{ t('settings.skillReset') }}
            </button>
          </div>
          <textarea
            v-model="localCoachSkill"
            class="skill-textarea"
            :disabled="localMode === 'webhook'"
          />
          <div class="skill-footer">
            <p class="skill-hint">{{ t('settings.skillHint') }}</p>
            <span class="skill-counter">{{ localCoachSkill.length }} chars · ~{{ Math.floor(localCoachSkill.length / 4) }} tokens</span>
          </div>
        </div>

        <!-- Analyze Skill Editor -->
        <div class="field-group" :class="{ dimmed: localAnalyzeMode === 'webhook' }">
          <div class="skill-header">
            <label class="field-label">{{ t('settings.analyzeSkill') }}</label>
            <button class="btn-reset" @click="handleResetAnalyze" :disabled="localAnalyzeMode === 'webhook'">
              {{ t('settings.skillReset') }}
            </button>
          </div>
          <textarea
            v-model="localAnalyzeSkill"
            class="skill-textarea"
            :disabled="localAnalyzeMode === 'webhook'"
          />
          <div class="skill-footer">
            <p class="skill-hint">{{ t('settings.skillHint') }}</p>
            <span class="skill-counter">{{ localAnalyzeSkill.length }} chars · ~{{ Math.floor(localAnalyzeSkill.length / 4) }} tokens</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-ghost" @click="$emit('update:modelValue', false)">
            {{ t('settings.cancel') }}
          </button>
          <button class="btn btn-primary" @click="handleSave">
            {{ t('settings.save') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '@/i18n'
import {
  getApiKey, setApiKey, getModel, setModel,
  getCoachMode, setCoachMode, coachMode,
  getAnalyzeMode, setAnalyzeMode, analyzeMode,
  GLM_BASE_URL, GLM_DEFAULT_MODEL
} from '@/config/llm'
import {
  getCoachSkill, setCoachSkill, resetCoachSkill, coachSkillDefault,
  getAnalyzeSkill, setAnalyzeSkill, resetAnalyzeSkill, analyzeSkillDefault
} from '@/config/skills/index'
import type { CoachMode, AnalyzeMode } from '@/types/api'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const { t } = useI18n()

const localApiKey = ref(getApiKey())
const localModel = ref(getModel())
const localMode = ref<CoachMode>(getCoachMode())
const localAnalyzeMode = ref<AnalyzeMode>(getAnalyzeMode())
const localCoachSkill = ref(localStorage.getItem('coach-skill') || coachSkillDefault)
const localAnalyzeSkill = ref(localStorage.getItem('analyze-skill') || analyzeSkillDefault)

type ValidationState = 'idle' | 'testing' | 'valid' | 'invalid'
const validationState = ref<ValidationState>('idle')
const validationError = ref('')

// Dim API key / model fields only when both modes are webhook
const bothWebhook = computed(() => localMode.value === 'webhook' && localAnalyzeMode.value === 'webhook')

// Reset validation badge when key is edited
watch(localApiKey, () => {
  validationState.value = 'idle'
  validationError.value = ''
})

// Re-sync when modal opens
watch(() => props.modelValue, (open) => {
  if (open) {
    localApiKey.value = getApiKey()
    localModel.value = getModel()
    localMode.value = getCoachMode()
    localAnalyzeMode.value = getAnalyzeMode()
    localCoachSkill.value = localStorage.getItem('coach-skill') || coachSkillDefault
    localAnalyzeSkill.value = localStorage.getItem('analyze-skill') || analyzeSkillDefault
    validationState.value = 'idle'
    validationError.value = ''
  }
})

async function handleTestKey() {
  const key = localApiKey.value.trim()
  if (!key) return
  validationState.value = 'testing'
  validationError.value = ''
  try {
    const res = await fetch(GLM_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: localModel.value.trim() || GLM_DEFAULT_MODEL,
        stream: false,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1
      })
    })
    if (res.status === 401) {
      validationState.value = 'invalid'
      validationError.value = t('error.glm401')
    } else if (res.ok || res.status === 429) {
      // 429 = rate limited but key is valid
      validationState.value = 'valid'
    } else {
      validationState.value = 'invalid'
      validationError.value = `HTTP ${res.status}: ${res.statusText}`
    }
  } catch {
    validationState.value = 'invalid'
    validationError.value = t('error.connectionFailed')
  }
}

function handleResetCoach() {
  localCoachSkill.value = coachSkillDefault
  resetCoachSkill()
}

function handleResetAnalyze() {
  localAnalyzeSkill.value = analyzeSkillDefault
  resetAnalyzeSkill()
}

function handleSave() {
  setApiKey(localApiKey.value.trim())
  setModel(localModel.value.trim() || 'glm-4.7-flash')
  setCoachMode(localMode.value)
  coachMode.value = localMode.value
  setAnalyzeMode(localAnalyzeMode.value)
  analyzeMode.value = localAnalyzeMode.value
  setCoachSkill(localCoachSkill.value)
  setAnalyzeSkill(localAnalyzeSkill.value)
  emit('saved')
  emit('update:modelValue', false)
}
</script>

<style scoped>
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
  max-width: 480px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: scaleIn 0.2s ease-out;
}
.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: opacity 0.2s;
}
.field-group.dimmed {
  opacity: 0.4;
}
.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}
.field-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}
.field-input:focus {
  border-color: var(--accent-blue);
}
.field-input:disabled {
  cursor: not-allowed;
}

.toggle-group {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
}
.toggle-btn {
  flex: 1;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  background: transparent;
  color: var(--text-muted);
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}
.toggle-btn.active {
  background-color: var(--accent-blue);
  color: white;
}
.toggle-btn:hover:not(.active) {
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
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
  cursor: pointer;
}
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.btn-ghost:hover {
  background-color: var(--bg-tertiary);
}
.btn-primary {
  background-color: var(--accent-blue);
  color: white;
}
.btn-primary:hover {
  opacity: 0.9;
}

.key-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.key-row .field-input {
  flex: 1;
}
.btn-test {
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-test:hover:not(:disabled) {
  border-color: var(--accent-blue);
  color: var(--accent-blue);
}
.btn-test:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.key-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
}
.key-badge--valid {
  color: var(--accent-green);
}
.key-badge--invalid {
  color: var(--accent-red, #f87171);
}

.skill-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.btn-reset {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}
.btn-reset:hover:not(:disabled) {
  color: var(--text-primary);
  background: var(--bg-tertiary);
}
.btn-reset:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
.skill-textarea {
  width: 100%;
  height: 160px;
  padding: 8px 12px;
  resize: vertical;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 12px;
  font-family: var(--font-mono);
  line-height: 1.6;
  outline: none;
  box-sizing: border-box;
}
.skill-textarea:focus {
  border-color: var(--accent-blue);
}
.skill-textarea:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.skill-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.skill-hint {
  font-size: 11px;
  color: var(--text-muted);
}
.skill-counter {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
