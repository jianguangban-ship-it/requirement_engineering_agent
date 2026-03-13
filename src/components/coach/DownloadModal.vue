<template>
  <Transition name="modal">
    <div class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-content" role="dialog" aria-modal="true">
        <h3 class="modal-title">
          {{ t('coach.downloadTitle').replace('{n}', String(recordCount)) }}
        </h3>
        <p class="modal-subtitle">{{ t('coach.downloadChooseFormat') }}</p>

        <div class="format-options">
          <button class="format-option" @click="$emit('select', 'json')">
            <span class="format-icon format-json">{ }</span>
            <div class="format-info">
              <span class="format-name">{{ t('coach.downloadJson') }}</span>
              <span class="format-desc">{{ t('coach.downloadJsonDesc') }}</span>
            </div>
          </button>

          <button class="format-option" @click="$emit('select', 'markdown')">
            <span class="format-icon format-md">MD</span>
            <div class="format-info">
              <span class="format-name">{{ t('coach.downloadMarkdown') }}</span>
              <span class="format-desc">{{ t('coach.downloadMarkdownDesc') }}</span>
            </div>
          </button>

          <button class="format-option" @click="$emit('select', 'both')">
            <span class="format-icon format-both">&darr;&darr;</span>
            <div class="format-info">
              <span class="format-name">{{ t('coach.downloadBoth') }}</span>
              <span class="format-desc">JSON + Markdown</span>
            </div>
          </button>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="$emit('cancel')">{{ t('coach.downloadCancel') }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'
const { t } = useI18n()
defineProps<{ recordCount: number }>()
defineEmits<{ select: [format: 'json' | 'markdown' | 'both']; cancel: [] }>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6000;
  padding: 24px;
}
.modal-content {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  padding: 20px;
  max-width: 300px;
  width: 100%;
  animation: scaleIn 0.2s ease-out;
}
.modal-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}
.modal-subtitle {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 14px;
}
.format-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.format-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: var(--bg-tertiary);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.format-option:hover {
  border-color: var(--accent-blue);
  background-color: var(--blue-wash, var(--bg-secondary));
}
.format-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.format-json {
  background-color: var(--blue-subtle);
  color: var(--accent-blue);
}
.format-md {
  background-color: var(--purple-subtle, #2a1a3a);
  color: var(--accent-purple, #a78bfa);
}
.format-both {
  background-color: var(--green-subtle);
  color: var(--accent-green);
}
.format-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.format-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}
.format-desc {
  font-size: 10px;
  color: var(--text-muted);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
.btn-cancel {
  font-size: 12px;
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
}
.btn-cancel:hover {
  color: var(--text-secondary);
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
/* Transition */
.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
