<template>
  <div class="description-editor">
    <h2 class="section-title">
      {{ t('form.taskDescription') }}
      <span class="required-tag">* {{ t('form.required') }}</span>
    </h2>
    <textarea
      ref="textareaRef"
      v-model="model"
      class="input-base desc-textarea"
      :placeholder="rolePlaceholder"
    ></textarea>
    <div class="desc-footer">
      <span class="desc-counter">{{ wordCount }} {{ t('form.descWords') }} · {{ sentenceCount }} {{ t('form.descSentences') }}</span>
    </div>
    <div v-if="aspiceSuggestions.length" class="aspice-suggestions">
      <span class="aspice-label">ASPICE</span>
      <span
        v-for="(s, i) in aspiceSuggestions"
        :key="i"
        class="aspice-field"
        :class="{ 'aspice-required': s.required }"
      >{{ isZh ? s.fieldZh : s.fieldEn }}{{ s.required ? ' *' : '' }}</span>
    </div>
    <TransitionGroup name="warn-list" tag="div" class="incose-violations" v-if="incoseViolations.length">
      <div
        v-for="v in incoseViolations"
        :key="v.ruleId"
        class="incose-item"
        :class="'incose-' + v.severity"
      >
        <span class="incose-tag">{{ isZh ? v.titleZh : v.titleEn }}</span>
        <span class="incose-msg">{{ isZh ? v.messageZh : v.messageEn }}</span>
      </div>
    </TransitionGroup>
    <TransitionGroup name="warn-list" tag="div" class="assumption-list" v-if="assumptions.length">
      <div
        v-for="a in assumptions"
        :key="a.id"
        class="assumption-item"
      >
        <span class="assumption-cat">{{ isZh ? a.categoryZh : a.categoryEn }}</span>
        <div class="assumption-body">
          <span class="assumption-msg">{{ isZh ? a.messageZh : a.messageEn }}</span>
          <span class="assumption-fix">{{ isZh ? a.suggestionZh : a.suggestionEn }}</span>
        </div>
      </div>
    </TransitionGroup>
    <TransitionGroup name="warn-list" tag="div" class="domain-warnings" v-if="domainWarnings.length">
      <div
        v-for="w in domainWarnings"
        :key="w.id"
        class="domain-warning"
        :class="'dw-' + w.severity"
      >
        <svg class="dw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path v-if="w.severity === 'warning'" stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-8.8 15.32A1 1 0 002.36 21h17.28a1 1 0 00.87-1.5l-8.6-15.32a1.04 1.04 0 00-1.82 0z"/>
          <path v-else stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
        </svg>
        <span class="dw-text">{{ isZh ? w.messageZh : w.messageEn }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useI18n } from '@/i18n'
import { getRolePlaceholder } from '@/composables/useRole'
import type { DomainWarning, AspiceSuggestion, IncoseViolation, Assumption } from '@/config/domain'

const props = defineProps<{
  domainWarnings: DomainWarning[]
  aspiceSuggestions: AspiceSuggestion[]
  incoseViolations: IncoseViolation[]
  assumptions: Assumption[]
}>()

const model = defineModel<string>({ required: true })
const { t, isZh } = useI18n()

const rolePlaceholder = computed(() => getRolePlaceholder(isZh.value ? 'zh' : 'en'))
const textareaRef = ref<HTMLTextAreaElement>()

function autoGrow() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

watch(model, () => nextTick(autoGrow))

const wordCount = computed(() =>
  model.value.trim() ? model.value.trim().split(/\s+/).filter(Boolean).length : 0
)

const sentenceCount = computed(() =>
  model.value.trim() ? model.value.split(/[.!?。！？]+/).filter(s => s.trim()).length : 0
)
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
  resize: none;
  font-size: 14px;
  overflow: hidden;
}
.desc-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}
.desc-counter {
  font-size: 11px;
  color: var(--text-muted);
  opacity: 0.7;
}

/* ASPICE suggestions */
.aspice-suggestions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
}
.aspice-label {
  font-size: 10px;
  font-family: var(--font-mono);
  font-weight: 600;
  padding: 1px 5px;
  border-radius: var(--radius-sm);
  background-color: var(--accent-blue);
  color: white;
  margin-right: 2px;
}
.aspice-field {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}
.aspice-field.aspice-required {
  border-color: var(--accent-orange);
  color: var(--accent-orange);
}

/* INCOSE violations */
.incose-violations {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 6px;
}
.incose-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  line-height: 1.4;
}
.incose-error {
  background-color: var(--red-subtle, rgba(239, 68, 68, 0.08));
}
.incose-warning {
  background-color: var(--orange-subtle, rgba(251, 191, 36, 0.06));
}
.incose-tag {
  font-size: 10px;
  font-family: var(--font-mono);
  font-weight: 600;
  padding: 0 4px;
  border-radius: 2px;
  white-space: nowrap;
  flex-shrink: 0;
}
.incose-error .incose-tag {
  background-color: var(--accent-red);
  color: white;
}
.incose-warning .incose-tag {
  background-color: var(--accent-orange);
  color: white;
}
.incose-msg {
  color: var(--text-secondary);
}

/* Assumption detector */
.assumption-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 6px;
}
.assumption-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  line-height: 1.4;
  background-color: var(--purple-subtle, rgba(167, 139, 250, 0.06));
}
.assumption-cat {
  font-size: 10px;
  font-family: var(--font-mono);
  font-weight: 600;
  padding: 0 4px;
  border-radius: 2px;
  white-space: nowrap;
  flex-shrink: 0;
  background-color: var(--accent-purple, #a78bfa);
  color: white;
}
.assumption-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.assumption-msg {
  color: var(--text-secondary);
}
.assumption-fix {
  color: var(--accent-purple, #a78bfa);
  font-style: italic;
  font-size: 10px;
}

/* Domain warnings */
.domain-warnings {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
}
.domain-warning {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  line-height: 1.4;
}
.dw-warning {
  background-color: var(--orange-subtle, rgba(251, 191, 36, 0.08));
  color: var(--accent-orange);
}
.dw-info {
  background-color: var(--blue-subtle, rgba(96, 165, 250, 0.08));
  color: var(--accent-blue);
}
.dw-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-top: 1px;
}
.dw-text {
  flex: 1;
}

/* Transition */
.warn-list-enter-active,
.warn-list-leave-active {
  transition: all 0.25s ease;
}
.warn-list-enter-from,
.warn-list-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
