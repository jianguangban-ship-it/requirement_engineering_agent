<template>
  <div class="dev-tools">
    <details>
      <summary class="dev-summary"><strong>{{ t('dev.viewPayload') }}</strong></summary>
      <div class="dev-content">
        <JsonViewer :data="payload" />
      </div>
    </details>

    <details>
      <summary class="dev-summary"><strong>{{ t('dev.viewCoachPayload') }}</strong></summary>
      <div class="dev-content raw-coach">
        <template v-if="lastCoachRaw">
          <div class="jv-toolbar">
            <button class="jv-copy-btn" @click="copyCoachRaw" :title="t('toast.copied')">
              <svg class="jv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </button>
            <button class="jv-action-btn" @click="rawExpanded = true" :title="t('dev.expandAll')">
              <svg class="jv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <button class="jv-action-btn" @click="rawExpanded = false" :title="t('dev.collapseAll')">
              <svg class="jv-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </button>
          </div>
          <pre class="raw-pre" :class="{ 'raw-collapsed': !rawExpanded }">{{ lastCoachRaw }}</pre>
        </template>
        <p v-else class="raw-empty">{{ t('dev.noCoachResponse') }}</p>
      </div>
    </details>

    <details>
      <summary class="dev-summary"><strong>{{ ICONS.devWebhook }} {{ t('dev.activeWebhook') }}</strong></summary>
      <div class="dev-config">
        <div class="config-row">
          <span class="config-label">{{ t('dev.currentMode') }}:</span>
          <span :style="{ color: isProd ? 'var(--accent-green)' : 'var(--accent-orange)' }">
            {{ isProd ? t('dev.production') : t('dev.testing') }}
          </span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ t('dev.activeUrl') }}:</span>
          <code class="config-url">{{ activeUrl }}</code>
        </div>
        <div class="config-hint">
          {{ ICONS.devHint }} {{ t('dev.configHint') }} <code class="config-code">WEBHOOK_CONFIG</code>
        </div>
      </div>
    </details>

    <details>
      <summary class="dev-summary"><strong>{{ ICONS.devAgent }} {{ t('dev.agentState') }}</strong></summary>
      <div class="dev-config">
        <div class="config-row">
          <span class="config-label">{{ t('dev.model') }}:</span>
          <code class="config-url">{{ activeModel }}</code>
        </div>
        <div class="config-row">
          <span class="config-label">{{ t('dev.activeRole') }}:</span>
          <span style="color: var(--accent-blue); font-weight: 600">{{ currentRoleDefinition ? (isZh ? currentRoleDefinition.labelZh : currentRoleDefinition.labelEn) : '—' }}</span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ t('dev.activeSkill') }}:</span>
          <span :style="{ color: activeSkill ? 'var(--accent-purple)' : 'var(--text-muted)' }">
            {{ activeSkill ? activeSkill.name : '—' }}
          </span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ t('dev.coachSkill') }}:</span>
          <span :style="{ color: coachSkillModified ? 'var(--accent-orange)' : 'var(--text-muted)' }">
            {{ coachSkillModified ? t('settings.skillModified') : t('dev.no') }}
          </span>
        </div>
        <div class="config-row">
          <span class="config-label">Task Coach Skill:</span>
          <span :style="{ color: coachSkillTaskModified ? 'var(--accent-orange)' : 'var(--text-muted)' }">
            {{ coachSkillTaskModified ? t('settings.skillModified') : t('dev.no') }}
          </span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ t('dev.analyzeSkill') }}:</span>
          <span :style="{ color: analyzeSkillModified ? 'var(--accent-orange)' : 'var(--text-muted)' }">
            {{ analyzeSkillModified ? t('settings.skillModified') : t('dev.no') }}
          </span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ t('dev.customTemplates') }}:</span>
          <span :style="{ color: customTemplatesModified ? 'var(--accent-orange)' : 'var(--text-muted)' }">
            {{ customTemplatesModified ? t('settings.skillModified') : t('dev.no') }}
          </span>
        </div>
        <div class="state-divider" />
        <div class="config-row">
          <span class="config-label">{{ t('dev.coach') }} {{ t('dev.streaming') }}:</span>
          <span :style="{ color: isCoachLoading ? 'var(--accent-green)' : 'var(--text-muted)' }">
            {{ isCoachLoading ? t('dev.yes') : t('dev.no') }}
            <span v-if="isCoachLoading && coachStreamSpeed > 0" class="speed-badge">{{ coachStreamSpeed }} {{ t('dev.streamSpeed') }}</span>
          </span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ t('dev.analyze') }} {{ t('dev.streaming') }}:</span>
          <span :style="{ color: isAnalyzeLoading ? 'var(--accent-purple)' : 'var(--text-muted)' }">
            {{ isAnalyzeLoading ? t('dev.yes') : t('dev.no') }}
            <span v-if="isAnalyzeLoading && analyzeStreamSpeed > 0" class="speed-badge">{{ analyzeStreamSpeed }} {{ t('dev.streamSpeed') }}</span>
          </span>
        </div>
        <div v-if="coachBackoffSecs > 0 || analyzeBackoffSecs > 0" class="config-row">
          <span class="config-label">{{ t('dev.backoff') }}:</span>
          <span style="color: var(--accent-orange)">
            <span v-if="coachBackoffSecs > 0">{{ t('dev.coach') }} {{ coachBackoffSecs }}s</span>
            <span v-if="analyzeBackoffSecs > 0">{{ t('dev.analyze') }} {{ analyzeBackoffSecs }}s</span>
          </span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ t('dev.coachErrorCancel') }}:</span>
          <span :style="{ color: coachHadError ? 'var(--accent-red)' : coachWasCancelled ? 'var(--accent-orange)' : 'var(--text-muted)' }">
            {{ coachHadError ? t('dev.error') : coachWasCancelled ? t('dev.cancelled') : t('dev.no') }}
          </span>
        </div>
        <div class="config-row">
          <span class="config-label">{{ t('dev.analyzeErrorCancel') }}:</span>
          <span :style="{ color: analyzeHadError ? 'var(--accent-red)' : analyzeWasCancelled ? 'var(--accent-orange)' : 'var(--text-muted)' }">
            {{ analyzeHadError ? t('dev.error') : analyzeWasCancelled ? t('dev.cancelled') : t('dev.no') }}
          </span>
        </div>
      </div>
    </details>

    <details>
      <summary class="dev-summary"><strong>{{ ICONS.devAgent }} Task Coach Skill</strong></summary>
      <div class="dev-config">
        <div class="skill-header">
          <div class="skill-label-row">
            <span v-if="coachSkillTaskModified" class="skill-modified-badge">● {{ t('settings.skillModified') }}</span>
          </div>
          <div class="skill-actions">
            <button class="btn-reset" @click="handleResetTaskCoach">{{ t('settings.skillReset') }}</button>
          </div>
        </div>
        <textarea
          class="skill-textarea"
          :value="localTaskCoachSkill"
          @input="onTaskCoachSkillInput"
        />
        <div class="skill-footer">
          <span class="skill-counter">{{ localTaskCoachSkill.length }} chars · ~{{ Math.floor(localTaskCoachSkill.length / 4) }} tokens</span>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'
import { WEBHOOK_CONFIG, useProductionMode } from '@/config/webhook'
import { ICONS } from '@/config/icons'
import { computed, ref } from 'vue'
import type { ChatMessage } from '@/types/api'
import { useToast } from '@/composables/useToast'
import { currentRoleDefinition } from '@/composables/useRole'
import { activeSkill } from '@/composables/useLLM'
import JsonViewer from '@/components/shared/JsonViewer.vue'
import {
  getCoachSkillTaskRaw, setCoachSkillTask, resetCoachSkillTask,
  coachSkillTaskModified, getCoachSkillTaskDefault
} from '@/config/skills/index'

const props = defineProps<{
  payload: string
  coachMessages: ChatMessage[]
  activeModel: string
  coachSkillModified: boolean
  analyzeSkillModified: boolean
  customTemplatesModified: boolean
  isCoachLoading: boolean
  isAnalyzeLoading: boolean
  coachHadError: boolean
  analyzeHadError: boolean
  coachWasCancelled: boolean
  analyzeWasCancelled: boolean
  coachStreamSpeed: number
  analyzeStreamSpeed: number
  coachBackoffSecs: number
  analyzeBackoffSecs: number
}>()

const { t, isZh } = useI18n()
const { addToast } = useToast()

// Last assistant message raw content (for debugging LaTeX/rendering)
const lastCoachRaw = computed(() => {
  const msgs = props.coachMessages
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].role === 'assistant' && msgs[i].content) return msgs[i].content
  }
  return ''
})

const rawExpanded = ref(true)

function copyCoachRaw() {
  navigator.clipboard.writeText(lastCoachRaw.value).then(() => {
    addToast('success', t('toast.copied'))
  })
}

const isProd = useProductionMode

const activeUrl = computed(() =>
  isProd.value ? WEBHOOK_CONFIG.prodUrl : WEBHOOK_CONFIG.testUrl
)

// ─── Task Coach Skill editing ─────────────────────────────────────────────
function currentLang(): 'zh' | 'en' { return isZh.value ? 'zh' : 'en' }

const localTaskCoachSkill = ref(getCoachSkillTaskRaw(currentLang()))

function onTaskCoachSkillInput(e: Event) {
  const val = (e.target as HTMLTextAreaElement).value
  localTaskCoachSkill.value = val
  setCoachSkillTask(val)
}

function handleResetTaskCoach() {
  resetCoachSkillTask()
  localTaskCoachSkill.value = getCoachSkillTaskDefault(currentLang())
}
</script>

<style scoped>
.dev-tools {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dev-summary {
  cursor: pointer;
  font-size: 12px;
  padding: 4px 0;
  color: var(--text-muted);
}
.dev-content {
  margin-top: 8px;
  padding: 12px;
  border-radius: var(--radius-lg);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  overflow-x: auto;
}
.dev-config {
  margin-top: 8px;
  padding: 16px;
  border-radius: var(--radius-lg);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 12px;
}
.config-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.config-label {
  color: var(--text-muted);
  min-width: 120px;
  flex-shrink: 0;
}
.config-url {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  background-color: var(--bg-tertiary);
  color: var(--accent-blue);
  font-family: var(--font-mono);
  font-size: 11px;
}
.config-hint {
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
}
.config-code {
  color: var(--accent-green);
}
.state-divider {
  border-top: 1px dashed var(--border-color);
  margin: 2px 0;
}
.mode-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
}
.badge-llm {
  background-color: var(--blue-subtle);
  color: var(--accent-blue);
  border: 1px solid var(--blue-border);
}
.badge-n8n {
  background-color: var(--orange-subtle);
  color: var(--accent-orange);
  border: 1px solid var(--orange-border);
}
.speed-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  margin-left: 6px;
  opacity: 0.8;
}
.raw-coach {
  position: relative;
  max-height: 400px;
  overflow-y: auto;
}
.raw-pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0;
}
.raw-collapsed {
  max-height: 80px;
  overflow: hidden;
}
.raw-empty {
  color: var(--text-muted);
  font-size: 11px;
  font-style: italic;
  margin: 0;
}
/* Toolbar — same styles as JsonViewer .jv-toolbar */
.jv-toolbar {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 1;
  display: flex;
  gap: 2px;
}
.jv-copy-btn,
.jv-action-btn {
  padding: 3px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.jv-copy-btn:hover,
.jv-action-btn:hover {
  color: var(--accent-blue);
  border-color: var(--accent-blue);
}
.jv-icon {
  width: 13px;
  height: 13px;
}
/* Skill editing section */
.skill-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; }
.skill-label-row { display: flex; align-items: center; gap: 8px; }
.skill-actions { display: flex; align-items: center; gap: 6px; }
.skill-modified-badge { font-size: 10px; font-weight: 600; color: var(--accent-orange); }
.btn-reset {
  font-size: 11px; padding: 3px 8px; border-radius: var(--radius-sm);
  border: 1px solid var(--border-color); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s;
}
.btn-reset:hover:not(:disabled) { color: var(--text-primary); background: var(--bg-tertiary); }
.skill-textarea {
  width: 100%; height: 200px; padding: var(--space-2) var(--space-3); resize: vertical;
  border-radius: var(--radius-md); border: 1px solid var(--border-color);
  background-color: var(--bg-tertiary); color: var(--text-primary);
  font-size: var(--font-base); font-family: var(--font-mono); line-height: 1.6; outline: none; box-sizing: border-box;
}
.skill-textarea:focus { border-color: var(--accent-blue); }
.skill-footer { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 4px; }
.skill-counter { font-size: var(--font-sm); color: var(--text-muted); white-space: nowrap; }
</style>
