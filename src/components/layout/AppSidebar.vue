<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <span class="logo-icon">&#9670;</span>
      <span class="logo-text">SDM</span>
    </div>
    <nav class="sidebar-nav" role="navigation">
      <button
        v-for="item in navItems"
        :key="item.view"
        class="nav-btn"
        :class="{ active: modelValue === item.view }"
        @click="$emit('update:modelValue', item.view)"
        :title="item.label"
        :aria-current="modelValue === item.view ? 'page' : undefined"
      >
        <span class="nav-icon" v-html="item.icon"></span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import type { ViewType } from '@/types/form'

const { t } = useI18n()

defineProps<{ modelValue: ViewType }>()
defineEmits<{ 'update:modelValue': [view: ViewType] }>()

const navItems = computed(() => [
  { view: 'defects' as ViewType, label: t('nav.defects'), icon: '&#9888;' },
  { view: 'dashboard' as ViewType, label: t('nav.dashboard'), icon: '&#9632;' },
  { view: 'settings' as ViewType, label: t('nav.settings'), icon: '&#9881;' },
])
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: var(--space-3);
  gap: var(--space-2);
  flex-shrink: 0;
}
.sidebar-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-3);
}
.logo-icon {
  font-size: var(--icon-md);
  color: var(--accent-blue);
}
.logo-text {
  font-size: var(--font-xs);
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 1px;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
  padding: 0 var(--space-2);
}
.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-2) var(--space-1);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-muted);
  transition: all 0.2s;
  width: 100%;
}
.nav-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
.nav-btn.active {
  background-color: var(--blue-subtle);
  color: var(--accent-blue);
}
.nav-icon {
  font-size: var(--icon-sm);
  line-height: 1;
}
.nav-label {
  font-size: var(--font-xs);
  font-weight: 500;
  white-space: nowrap;
}
</style>
