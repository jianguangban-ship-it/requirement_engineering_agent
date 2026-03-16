<template>
  <Transition name="slide">
    <div class="detail-overlay" @click.self="$emit('close')">
      <aside class="detail-panel">
        <div class="detail-header">
          <button class="back-btn" @click="$emit('close')" :title="t('detail.back')">&#10094;</button>
          <h3 class="detail-title">#{{ defect.id }} {{ t('detail.title') }}</h3>
          <div class="detail-actions">
            <button class="action-btn" @click="$emit('edit', defect)">{{ t('detail.edit') }}</button>
            <button class="action-btn action-delete" @click="$emit('delete', defect)">{{ t('detail.delete') }}</button>
          </div>
        </div>

        <div class="detail-body">
          <!-- Title -->
          <h2 class="defect-title">{{ defect.title }}</h2>

          <!-- Badges -->
          <div class="badge-row">
            <SeverityBadge :severity="defect.severity" />
            <PriorityBadge :priority="defect.priority" />
            <DefectStatusBadge :status="defect.status" />
          </div>

          <!-- Basic Info -->
          <section class="detail-section">
            <h4 class="section-title">{{ t('detail.classification') }}</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ t('defect.category') }}</span>
                <span class="info-value">{{ defect.category }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('defect.detectedPhase') }}</span>
                <span class="info-value">{{ defect.detectedPhase }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('defect.vehicle') }}</span>
                <span class="info-value">{{ defect.vehicle || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('defect.product') }}</span>
                <span class="info-value">{{ defect.product || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('defect.layer') }}</span>
                <span class="info-value">{{ defect.layer || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('defect.component') }}</span>
                <span class="info-value">{{ defect.component || '-' }}</span>
              </div>
            </div>
          </section>

          <!-- People -->
          <section class="detail-section">
            <h4 class="section-title">{{ t('detail.people') }}</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ t('defect.reporter') }}</span>
                <span class="info-value">{{ defect.reporterName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('defect.assignee') }}</span>
                <span class="info-value">{{ defect.assigneeName || '-' }}</span>
              </div>
            </div>
          </section>

          <!-- Description -->
          <section v-if="defect.description" class="detail-section">
            <h4 class="section-title">{{ t('defect.description') }}</h4>
            <p class="detail-text">{{ defect.description }}</p>
          </section>

          <!-- Analysis -->
          <section class="detail-section">
            <h4 class="section-title">{{ t('detail.analysis') }}</h4>
            <div class="info-grid" style="grid-template-columns: 1fr">
              <div v-if="defect.rootCause" class="info-item">
                <span class="info-label">{{ t('defect.rootCause') }}</span>
                <p class="detail-text">{{ defect.rootCause }}</p>
              </div>
              <div v-if="defect.correctiveAction" class="info-item">
                <span class="info-label">{{ t('defect.correctiveAction') }}</span>
                <p class="detail-text">{{ defect.correctiveAction }}</p>
              </div>
              <p v-if="!defect.rootCause && !defect.correctiveAction" class="empty-text">-</p>
            </div>
          </section>

          <!-- Timeline -->
          <section class="detail-section">
            <h4 class="section-title">{{ t('detail.timeline') }}</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ t('defect.createdAt') }}</span>
                <span class="info-value">{{ formatDateTime(defect.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('defect.updatedAt') }}</span>
                <span class="info-value">{{ formatDateTime(defect.updatedAt) }}</span>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'
import type { Defect } from '@/types/api'
import SeverityBadge from './SeverityBadge.vue'
import PriorityBadge from './PriorityBadge.vue'
import DefectStatusBadge from './DefectStatusBadge.vue'

defineProps<{ defect: Defect }>()
defineEmits<{ close: []; edit: [defect: Defect]; delete: [defect: Defect] }>()

const { t } = useI18n()

function formatDateTime(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString()
}
</script>

<style scoped>
.detail-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 4000;
  display: flex;
  justify-content: flex-end;
}
.detail-panel {
  width: clamp(360px, 30vw, 620px);
  max-width: 90vw;
  height: 100%;
  background-color: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  box-shadow: var(--shadow-modal);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.25s ease-out;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
}
.back-btn {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  font-size: 14px;
  transition: all 0.15s;
  border: 1px solid var(--border-color);
}
.back-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
.detail-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.detail-actions {
  display: flex;
  gap: 6px;
}
.action-btn {
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  transition: all 0.15s;
}
.action-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
.action-delete:hover {
  color: var(--accent-red);
  border-color: var(--accent-red);
}
.detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.defect-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}
.badge-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info-label {
  font-size: 11px;
  color: var(--text-muted);
}
.info-value {
  font-size: 13px;
  color: var(--text-primary);
}
.detail-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
}
.empty-text {
  font-size: 13px;
  color: var(--text-muted);
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.slide-enter-active { transition: opacity 0.25s ease; }
.slide-leave-active { transition: opacity 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; }
</style>
