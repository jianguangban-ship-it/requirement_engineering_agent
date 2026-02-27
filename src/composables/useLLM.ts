import { ref } from 'vue'
import type { LLMRequestBody, LLMStreamChunk, WebhookPayload } from '@/types/api'
import { getProviderUrl, getApiKey, getModel, coachMode, analyzeMode } from '@/config/llm'
import { getCoachSkill, getAnalyzeSkill } from '@/config/skills/index'
import { webhookUrl, WEBHOOK_CONFIG } from '@/config/webhook'
import { useI18n } from '@/i18n'

const LS_KEY_COACH_SKILL_ENABLED = 'coach-skill-enabled'

/** Whether the coach system-prompt skill is active. Toggle from the UI for free-form chat. Persisted to localStorage. */
export const coachSkillEnabled = ref(localStorage.getItem(LS_KEY_COACH_SKILL_ENABLED) !== 'false')

export function setCoachSkillEnabled(val: boolean): void {
  coachSkillEnabled.value = val
  localStorage.setItem(LS_KEY_COACH_SKILL_ENABLED, String(val))
}

/** Tagged error class for HTTP 429 so callers can start backoff instead of showing an error */
class GLM429Error extends Error {
  constructor(msg: string) { super(msg); this.name = 'GLM429Error' }
}

export function useLLM() {
  const { isZh, t } = useI18n()

  // ─── Coach state ───────────────────────────────────────────────────────────
  const isCoachLoading = ref(false)
  const coachResponse = ref<unknown>(null)
  const coachWasCancelled = ref(false)
  const coachHadError = ref(false)
  const coachStreamSpeed = ref(0)   // tokens/sec during streaming
  const coachBackoffSecs = ref(0)   // countdown before auto-retry after 429

  // ─── Analyze state ─────────────────────────────────────────────────────────
  const isAnalyzeLoading = ref(false)
  const analyzeResponse = ref<unknown>(null)
  const previousAnalyzeResponse = ref<unknown>(null)
  const analyzeWasCancelled = ref(false)
  const analyzeHadError = ref(false)
  const analyzeStreamSpeed = ref(0)
  const analyzeBackoffSecs = ref(0)

  // Plain vars — no reactivity needed
  let _coachAC: AbortController | null = null
  let _analyzeAC: AbortController | null = null
  let _lastCoachPayload: WebhookPayload | null = null
  let _lastAnalyzePayload: WebhookPayload | null = null
  let _coachBackoffTimer: number | null = null
  let _analyzeBackoffTimer: number | null = null

  // ─── Shared helpers ────────────────────────────────────────────────────────

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
    userMessage: string,
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
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user', content: userMessage }
      ]
    }

    // Normalize: if user entered a base URL (e.g. https://host/v1), append /chat/completions
    const rawUrl = getProviderUrl()
    const endpointUrl = rawUrl.endsWith('/chat/completions') ? rawUrl : rawUrl.replace(/\/$/, '') + '/chat/completions'

    const response = await fetch(endpointUrl, {
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
      if (response.status === 429) throw new GLM429Error(t('error.glm429'))
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
    coachStreamSpeed.value = 0
    coachBackoffSecs.value = 0
    isCoachLoading.value = true
    coachResponse.value = null
    _coachAC = new AbortController()

    try {
      if (coachMode.value === 'llm') {
        const lang = isZh.value ? 'zh' : 'en'
        let accumulated = ''
        let tokenCount = 0
        let streamStart = 0

        // Skill ON  → structured JIRA review request with system prompt
        // Skill OFF → free-form chat: send the description text as-is
        const skillOn = coachSkillEnabled.value
        const systemPrompt = skillOn ? getCoachSkill(lang) : ''
        const userMessage = skillOn
          ? buildUserMessage(payload)
          : (payload.data.description || payload.data.summary || '')

        await _callGLMStream(systemPrompt, userMessage, (chunk) => {
          if (tokenCount === 0) streamStart = Date.now()
          tokenCount++
          accumulated += chunk
          coachResponse.value = { markdown_msg: accumulated, message: accumulated }
          const elapsed = (Date.now() - streamStart) / 1000
          if (elapsed > 0) coachStreamSpeed.value = Math.round(tokenCount / elapsed)
        }, _coachAC.signal)
      } else {
        coachResponse.value = await _callWebhook(payload)
      }
      return null
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        coachWasCancelled.value = true
        coachStreamSpeed.value = 0
        return 'cancelled'
      }
      if (error instanceof GLM429Error) {
        coachBackoffSecs.value = 10
        _coachBackoffTimer = window.setInterval(async () => {
          coachBackoffSecs.value--
          if (coachBackoffSecs.value <= 0) {
            clearInterval(_coachBackoffTimer!)
            _coachBackoffTimer = null
            if (_lastCoachPayload) await requestCoach(_lastCoachPayload)
          }
        }, 1000)
        return null
      }
      coachStreamSpeed.value = 0
      coachHadError.value = true
      return error instanceof Error ? error.message : t('error.requestFailed')
    } finally {
      _coachAC = null
      isCoachLoading.value = false
    }
  }

  function cancelCoach() {
    _coachAC?.abort()
    if (_coachBackoffTimer !== null) {
      clearInterval(_coachBackoffTimer)
      _coachBackoffTimer = null
      coachBackoffSecs.value = 0
    }
  }

  async function retryCoach(): Promise<string | null> {
    if (!_lastCoachPayload) return null
    return requestCoach(_lastCoachPayload)
  }

  function clearCoachResponse() {
    coachResponse.value = null
    coachWasCancelled.value = false
    coachHadError.value = false
    coachStreamSpeed.value = 0
    coachBackoffSecs.value = 0
  }

  // ─── Analyze ──────────────────────────────────────────────────────────────

  async function requestAnalyze(payload: WebhookPayload): Promise<string | null> {
    _lastAnalyzePayload = payload
    analyzeWasCancelled.value = false
    analyzeHadError.value = false
    analyzeStreamSpeed.value = 0
    analyzeBackoffSecs.value = 0
    isAnalyzeLoading.value = true
    previousAnalyzeResponse.value = analyzeResponse.value
    analyzeResponse.value = null
    _analyzeAC = new AbortController()

    try {
      if (analyzeMode.value === 'llm') {
        const lang = isZh.value ? 'zh' : 'en'
        let accumulated = ''
        let tokenCount = 0
        let streamStart = 0

        await _callGLMStream(getAnalyzeSkill(lang), buildUserMessage(payload), (chunk) => {
          if (tokenCount === 0) streamStart = Date.now()
          tokenCount++
          accumulated += chunk
          analyzeResponse.value = { markdown_msg: accumulated, message: accumulated }
          const elapsed = (Date.now() - streamStart) / 1000
          if (elapsed > 0) analyzeStreamSpeed.value = Math.round(tokenCount / elapsed)
        }, _analyzeAC.signal)
      } else {
        analyzeResponse.value = await _callWebhook(payload)
      }
      return null
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        analyzeWasCancelled.value = true
        analyzeStreamSpeed.value = 0
        return 'cancelled'
      }
      if (error instanceof GLM429Error) {
        analyzeBackoffSecs.value = 10
        _analyzeBackoffTimer = window.setInterval(async () => {
          analyzeBackoffSecs.value--
          if (analyzeBackoffSecs.value <= 0) {
            clearInterval(_analyzeBackoffTimer!)
            _analyzeBackoffTimer = null
            if (_lastAnalyzePayload) await requestAnalyze(_lastAnalyzePayload)
          }
        }, 1000)
        return null
      }
      analyzeStreamSpeed.value = 0
      analyzeHadError.value = true
      return error instanceof Error ? error.message : t('error.requestFailed')
    } finally {
      _analyzeAC = null
      isAnalyzeLoading.value = false
    }
  }

  function cancelAnalyze() {
    _analyzeAC?.abort()
    if (_analyzeBackoffTimer !== null) {
      clearInterval(_analyzeBackoffTimer)
      _analyzeBackoffTimer = null
      analyzeBackoffSecs.value = 0
    }
  }

  async function retryAnalyze(): Promise<string | null> {
    if (!_lastAnalyzePayload) return null
    return requestAnalyze(_lastAnalyzePayload)
  }

  function clearAnalyzeResponse() {
    analyzeResponse.value = null
    previousAnalyzeResponse.value = null
    analyzeWasCancelled.value = false
    analyzeHadError.value = false
    analyzeStreamSpeed.value = 0
    analyzeBackoffSecs.value = 0
  }

  return {
    isCoachLoading, coachResponse, coachWasCancelled, coachHadError,
    coachStreamSpeed, coachBackoffSecs,
    requestCoach, cancelCoach, retryCoach, clearCoachResponse,
    isAnalyzeLoading, analyzeResponse, previousAnalyzeResponse, analyzeWasCancelled, analyzeHadError,
    analyzeStreamSpeed, analyzeBackoffSecs,
    requestAnalyze, cancelAnalyze, retryAnalyze, clearAnalyzeResponse
  }
}
