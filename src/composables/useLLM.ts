import { ref } from 'vue'
import type { LLMRequestBody, LLMStreamChunk, WebhookPayload } from '@/types/api'
import { GLM_BASE_URL, getApiKey, getModel, coachMode, analyzeMode } from '@/config/llm'
import { getCoachSkill, getAnalyzeSkill } from '@/config/skills/index'
import { webhookUrl, WEBHOOK_CONFIG } from '@/config/webhook'
import { useI18n } from '@/i18n'

export function useLLM() {
  const { isZh, t } = useI18n()

  // ─── Shared state ─────────────────────────────────────────────────────────

  const isCoachLoading = ref(false)
  const coachResponse = ref<unknown>(null)
  const coachWasCancelled = ref(false)
  const coachHadError = ref(false)
  const isAnalyzeLoading = ref(false)
  const analyzeResponse = ref<unknown>(null)
  const analyzeWasCancelled = ref(false)
  const analyzeHadError = ref(false)

  // AbortControllers and last payloads — plain variables, no reactivity needed
  let _coachAC: AbortController | null = null
  let _analyzeAC: AbortController | null = null
  let _lastCoachPayload: WebhookPayload | null = null
  let _lastAnalyzePayload: WebhookPayload | null = null

  // ─── Shared GLM helpers ───────────────────────────────────────────────────

  function buildUserMessage(payload: WebhookPayload): string {
    const d = payload.data
    if (isZh.value) {
      return `请帮我审阅以下 JIRA 任务描述并给出改进建议：

**项目**: ${d.project_name}
**任务类型**: ${d.issue_type}
**摘要**: ${d.summary}
**描述**:
${d.description || '（未填写）'}
**经办人**: ${d.assignee || '（未分配）'}
**故事点**: ${d.estimated_points}`
    }
    return `Please review the following JIRA task description and provide improvement suggestions:

**Project**: ${d.project_name}
**Issue Type**: ${d.issue_type}
**Summary**: ${d.summary}
**Description**:
${d.description || '(empty)'}
**Assignee**: ${d.assignee || '(unassigned)'}
**Story Points**: ${d.estimated_points}`
  }

  async function _callGLMStream(
    systemPrompt: string,
    payload: WebhookPayload,
    onChunk: (text: string) => void,
    signal: AbortSignal
  ): Promise<void> {
    const apiKey = getApiKey()
    if (!apiKey) {
      throw new Error(
        isZh.value
          ? 'GLM API Key 未配置，请点击右上角 ⚙ 进行设置。'
          : 'GLM API Key not set. Please click ⚙ in the header to configure it.'
      )
    }

    const body: LLMRequestBody & { stream: true } = {
      model: getModel(),
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: buildUserMessage(payload) }
      ]
    }

    const response = await fetch(GLM_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body),
      signal
    })

    if (!response.ok) {
      if (response.status === 401) throw new Error(t('error.glm401'))
      if (response.status === 429) throw new Error(t('error.glm429'))
      if (response.status >= 500) throw new Error(t('error.glm5xx'))
      const errText = await response.text().catch(() => '')
      throw new Error(`GLM API ${response.status}: ${errText || response.statusText}`)
    }

    if (!response.body) throw new Error('Response body is not readable')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        if (signal.aborted) break
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)
          if (data === '[DONE]') return
          try {
            const chunk = JSON.parse(data) as LLMStreamChunk
            const content = chunk.choices?.[0]?.delta?.content
            if (content) onChunk(content)
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  async function _callWebhook(payload: WebhookPayload): Promise<unknown> {
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
        if (error.name === 'AbortError') throw new Error(t('error.timeout'))
        if (error.message.includes('Failed to fetch')) throw new Error(t('error.connectionFailed'))
      }
      throw error
    }
  }

  // ─── Coach ────────────────────────────────────────────────────────────────

  async function requestCoach(payload: WebhookPayload): Promise<string | null> {
    _lastCoachPayload = payload
    coachWasCancelled.value = false
    coachHadError.value = false
    isCoachLoading.value = true
    coachResponse.value = null
    _coachAC = new AbortController()

    try {
      if (coachMode.value === 'llm') {
        const lang = isZh.value ? 'zh' : 'en'
        let accumulated = ''
        await _callGLMStream(getCoachSkill(lang), payload, (chunk) => {
          accumulated += chunk
          coachResponse.value = { markdown_msg: accumulated, message: accumulated }
        }, _coachAC.signal)
      } else {
        coachResponse.value = await _callWebhook(payload)
      }
      return null
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        coachWasCancelled.value = true
        return 'cancelled'
      }
      coachHadError.value = true
      return error instanceof Error ? error.message : t('error.requestFailed')
    } finally {
      _coachAC = null
      isCoachLoading.value = false
    }
  }

  function cancelCoach() { _coachAC?.abort() }

  async function retryCoach(): Promise<string | null> {
    if (!_lastCoachPayload) return null
    return requestCoach(_lastCoachPayload)
  }

  function clearCoachResponse() {
    coachResponse.value = null
    coachWasCancelled.value = false
    coachHadError.value = false
  }

  // ─── Analyze ──────────────────────────────────────────────────────────────

  async function requestAnalyze(payload: WebhookPayload): Promise<string | null> {
    _lastAnalyzePayload = payload
    analyzeWasCancelled.value = false
    analyzeHadError.value = false
    isAnalyzeLoading.value = true
    analyzeResponse.value = null
    _analyzeAC = new AbortController()

    try {
      if (analyzeMode.value === 'llm') {
        const lang = isZh.value ? 'zh' : 'en'
        let accumulated = ''
        await _callGLMStream(getAnalyzeSkill(lang), payload, (chunk) => {
          accumulated += chunk
          analyzeResponse.value = { markdown_msg: accumulated, message: accumulated }
        }, _analyzeAC.signal)
      } else {
        analyzeResponse.value = await _callWebhook(payload)
      }
      return null
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        analyzeWasCancelled.value = true
        return 'cancelled'
      }
      analyzeHadError.value = true
      return error instanceof Error ? error.message : t('error.requestFailed')
    } finally {
      _analyzeAC = null
      isAnalyzeLoading.value = false
    }
  }

  function cancelAnalyze() { _analyzeAC?.abort() }

  async function retryAnalyze(): Promise<string | null> {
    if (!_lastAnalyzePayload) return null
    return requestAnalyze(_lastAnalyzePayload)
  }

  function clearAnalyzeResponse() {
    analyzeResponse.value = null
    analyzeWasCancelled.value = false
    analyzeHadError.value = false
  }

  return {
    isCoachLoading,
    coachResponse,
    coachWasCancelled,
    coachHadError,
    requestCoach,
    cancelCoach,
    retryCoach,
    clearCoachResponse,
    isAnalyzeLoading,
    analyzeResponse,
    analyzeWasCancelled,
    analyzeHadError,
    requestAnalyze,
    cancelAnalyze,
    retryAnalyze,
    clearAnalyzeResponse
  }
}
