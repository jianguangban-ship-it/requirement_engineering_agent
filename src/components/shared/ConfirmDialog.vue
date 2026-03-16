<template>
  <Transition name="modal">
    <div class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-content" role="alertdialog" aria-modal="true">
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="$emit('cancel')">{{ t('confirm.cancel') }}</button>
          <button class="btn btn-danger" @click="$emit('confirm')">{{ t('confirm.confirm') }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'
defineProps<{ title: string; message: string }>()
defineEmits<{ confirm: []; cancel: [] }>()
const { t } = useI18n()
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
  padding: var(--space-6);
}
.modal-content {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  padding: var(--space-6);
  max-width: clamp(300px, 25vw, 500px);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  animation: scaleIn 0.2s ease-out;
}
.modal-title {
  font-size: var(--font-xl);
  font-weight: 600;
  color: var(--text-primary);
}
.modal-message {
  font-size: var(--font-lg);
  color: var(--text-secondary);
  line-height: 1.5;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}
.btn {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--font-md);
  font-weight: 500;
  transition: all 0.15s;
  border: none;
}
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}
.btn-ghost:hover { background-color: var(--bg-tertiary); }
.btn-danger {
  background-color: var(--accent-red);
  color: white;
}
.btn-danger:hover { opacity: 0.9; }
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
