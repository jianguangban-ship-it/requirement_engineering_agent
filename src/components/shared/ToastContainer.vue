<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id"
           class="toast-item" :class="'toast-' + toast.type"
           @click="removeToast(toast.id)">
        <svg v-if="toast.type === 'success'" class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        <svg v-else-if="toast.type === 'error'" class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path stroke-linecap="round" d="M12 8v4m0 4h.01"/>
        </svg>
        <svg v-else-if="toast.type === 'warning'" class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <svg v-else class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path stroke-linecap="round" d="M12 16v-4m0-4h.01"/>
        </svg>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click.stop="removeToast(toast.id)">
          <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  pointer-events: none;
}
.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  cursor: pointer;
  min-width: 280px;
  max-width: 420px;
}
.toast-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.toast-message {
  font-size: 13px;
  color: var(--text-primary);
  flex: 1;
}
.toast-close {
  padding: 2px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  transition: color 0.15s;
}
.toast-close:hover {
  color: var(--text-primary);
}
.close-icon {
  width: 14px;
  height: 14px;
}

.toast-success {
  border-color: rgba(63, 185, 80, 0.3);
}
.toast-success .toast-icon {
  color: var(--accent-green);
}
.toast-error {
  border-color: rgba(248, 81, 73, 0.3);
}
.toast-error .toast-icon {
  color: var(--accent-red);
}
.toast-warning {
  border-color: rgba(210, 153, 34, 0.3);
}
.toast-warning .toast-icon {
  color: var(--accent-orange);
}
.toast-info {
  border-color: rgba(88, 166, 255, 0.3);
}
.toast-info .toast-icon {
  color: var(--accent-blue);
}
</style>
