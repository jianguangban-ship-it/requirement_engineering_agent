import { ref } from 'vue'
import type { WebhookPayload, ActionType } from '@/types/api'
import { WEBHOOK_CONFIG, webhookUrl } from '@/config/webhook'
import { useI18n } from '@/i18n'

export function useWebhook() {
  const { t } = useI18n()

  const isSubmitting = ref(false)
  const currentAction = ref<ActionType | ''>('')
  const aiAgentResponse = ref<unknown>(null)
  const jiraResponse = ref<unknown>(null)
  const coachResponse = ref<unknown>(null)
  const isCoachLoading = ref(false)

  async function sendRequest(payload: WebhookPayload): Promise<unknown> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_CONFIG.timeout)

    try {
      const response = await fetch(webhookUrl.value, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseText = await response.text()
      if (!responseText || responseText.trim() === '') {
        throw new Error(t('error.emptyResponse'))
      }

      try {
        return JSON.parse(responseText)
      } catch {
        return { message: responseText }
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(t('error.timeout'))
        }
        if (error.message.includes('Failed to fetch')) {
          throw new Error(t('error.connectionFailed'))
        }
      }
      throw error
    }
  }

  async function analyzeTask(payload: WebhookPayload): Promise<string | null> {
    isSubmitting.value = true
    currentAction.value = 'analyze'
    aiAgentResponse.value = null
    jiraResponse.value = null

    try {
      const result = await sendRequest(payload)
      aiAgentResponse.value = result
      return null // no error
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('error.requestFailed')
      return msg
    } finally {
      isSubmitting.value = false
    }
  }

  async function createJiraTicket(payload: WebhookPayload): Promise<string | null> {
    isSubmitting.value = true
    currentAction.value = 'create'
    jiraResponse.value = null

    try {
      const result = await sendRequest(payload) as Record<string, unknown>
      jiraResponse.value = result.jira_result || result
      return null
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('error.requestFailed')
      return msg
    } finally {
      isSubmitting.value = false
    }
  }

  async function requestCoach(payload: WebhookPayload): Promise<string | null> {
    isCoachLoading.value = true
    coachResponse.value = null

    try {
      const result = await sendRequest(payload)
      coachResponse.value = result
      return null
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('error.requestFailed')
      return msg
    } finally {
      isCoachLoading.value = false
    }
  }

  function clearResponses() {
    aiAgentResponse.value = null
    jiraResponse.value = null
    coachResponse.value = null
    currentAction.value = ''
  }

  return {
    isSubmitting,
    currentAction,
    aiAgentResponse,
    jiraResponse,
    coachResponse,
    isCoachLoading,
    analyzeTask,
    createJiraTicket,
    requestCoach,
    clearResponses
  }
}
