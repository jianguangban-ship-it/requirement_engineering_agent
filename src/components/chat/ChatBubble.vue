<template>
  <div class="chat-msg" :class="[`chat-${message.role}`]">
    <!-- Avatar -->
    <div class="msg-avatar-col">
      <img
        v-if="message.role === 'assistant'"
        :src="agentAvatar"
        class="msg-avatar"
        :class="{ 'avatar-thinking': message.isStreaming }"
        alt="Coach"
      />
      <div v-else class="msg-avatar-user">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
        </svg>
      </div>
    </div>

    <!-- Bubble -->
    <div class="msg-bubble" :class="[`bubble-${message.role}`]">
      <span class="msg-role-label" :class="[`role-${message.role}`]">
        {{ message.role === 'assistant' ? t('coach.agentLabel') : t('coach.userLabel') }}
        <span class="msg-time">{{ timeLabel }}</span>
      </span>
      <!-- Agent: formatted markdown -->
      <div
        v-if="message.role === 'assistant'"
        class="coach-response"
        v-html="formattedContent"
      />
      <!-- User: plain text -->
      <div v-else class="msg-user-text">
        {{ message.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import type { ChatMessage } from '@/types/api'
import { useI18n } from '@/i18n'
import { formatCoachResponse } from '@/utils/formatCoach'

const { t } = useI18n()
const agentAvatar = '/agent_avy.png'

const props = defineProps<{
  message: ChatMessage
}>()

// RAF-throttled formatting for streaming messages
const formattedContent = ref('')
let _rafId: number | null = null

watch(
  () => props.message.content,
  (val) => {
    if (!props.message.isStreaming) {
      formattedContent.value = formatCoachResponse({ message: val }, false)
      return
    }
    if (_rafId !== null) return
    _rafId = requestAnimationFrame(() => {
      formattedContent.value = formatCoachResponse({ message: props.message.content }, true)
      _rafId = null
    })
  },
  { immediate: true }
)

watch(
  () => props.message.isStreaming,
  (streaming) => {
    if (!streaming && props.message.content) {
      // Final render with streaming=false to ensure complete math is shown
      formattedContent.value = formatCoachResponse({ message: props.message.content }, false)
    }
  }
)

onUnmounted(() => {
  if (_rafId !== null) cancelAnimationFrame(_rafId)
})

const timeLabel = computed(() => {
  const d = new Date(props.message.timestamp)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})
</script>

<style scoped>
.chat-msg {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
}

/* User messages: avatar on the right */
.chat-user {
  flex-direction: row-reverse;
}

/* Avatar column */
.msg-avatar-col {
  flex-shrink: 0;
}
.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  background-color: var(--bg-tertiary);
}
.msg-avatar-user {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-blue);
  color: white;
}
.msg-avatar-user svg {
  width: 20px;
  height: 20px;
}

/* Breathing halo for streaming */
.avatar-thinking {
  animation: breathe 2s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { box-shadow: 0 0 0 0 var(--green-glow); }
  50% { box-shadow: 0 0 8px 4px var(--green-subtle); }
}

/* Bubble */
.msg-bubble {
  max-width: 85%;
  min-width: 60px;
  padding: 10px 14px;
  position: relative;
}

/* Agent bubble: transparent, no card */
.bubble-assistant {
  background: transparent;
}

/* User bubble: transparent */
.bubble-user {
  background: transparent;
}

/* Role label */
.msg-role-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.role-assistant {
  color: var(--accent-blue);
}
.role-user {
  color: var(--text-muted);
}
.msg-time {
  font-size: 10px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  opacity: 0.6;
}

/* Content */
.msg-user-text {
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-primary);
  font-size: 13px;
  line-height: 1.55;
  max-height: 200px;
  overflow-y: auto;
}

/* Coach response markdown styles are in src/styles/coach-response.css (global, unscoped) */
</style>
