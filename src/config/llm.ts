import { ref } from 'vue'
import type { CoachMode, AnalyzeMode } from '@/types/api'

export const GLM_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
export const GLM_DEFAULT_MODEL = 'glm-4.7-flash'

/** Preset model names grouped by provider, shown in the model name datalist */
export const LLM_MODEL_PRESETS: { group: string; models: string[] }[] = [
  {
    group: 'GLM (ZhipuAI)',
    models: ['glm-4.7-flash', 'glm-4-plus', 'glm-4-air', 'glm-z1-flash', 'glm-z1-airx']
  },
  {
    group: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  {
    group: 'Anthropic',
    models: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001']
  },
  {
    group: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-reasoner']
  },
  {
    group: 'Qwen (Alibaba)',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max']
  },
  {
    group: 'Mistral',
    models: ['mistral-large-latest', 'mistral-small-latest']
  }
]

const LS_KEY_PROVIDER_URL = 'provider-url'

export function getProviderUrl(): string {
  return localStorage.getItem(LS_KEY_PROVIDER_URL) || GLM_BASE_URL
}

export function setProviderUrl(url: string): void {
  if (url.trim()) {
    localStorage.setItem(LS_KEY_PROVIDER_URL, url.trim())
  } else {
    localStorage.removeItem(LS_KEY_PROVIDER_URL)
  }
}

const LS_KEY_API = 'glm-api-key'
const LS_KEY_MODEL = 'glm-model'
const LS_KEY_MODE = 'coach-mode'

export function getApiKey(): string {
  return localStorage.getItem(LS_KEY_API) ?? ''
}

export function setApiKey(key: string): void {
  localStorage.setItem(LS_KEY_API, key)
}

export function getModel(): string {
  return localStorage.getItem(LS_KEY_MODEL) || GLM_DEFAULT_MODEL
}

export function setModel(model: string): void {
  localStorage.setItem(LS_KEY_MODEL, model)
}

export function getCoachMode(): CoachMode {
  return (localStorage.getItem(LS_KEY_MODE) as CoachMode) || 'llm'
}

export function setCoachMode(mode: CoachMode): void {
  localStorage.setItem(LS_KEY_MODE, mode)
}

/** Reactive ref that mirrors localStorage coach mode */
export const coachMode = ref<CoachMode>(getCoachMode())

const LS_KEY_ANALYZE_MODE = 'analyze-mode'

export function getAnalyzeMode(): AnalyzeMode {
  return (localStorage.getItem(LS_KEY_ANALYZE_MODE) as AnalyzeMode) || 'webhook'
}

export function setAnalyzeMode(mode: AnalyzeMode): void {
  localStorage.setItem(LS_KEY_ANALYZE_MODE, mode)
}

/** Reactive ref that mirrors localStorage analyze mode */
export const analyzeMode = ref<AnalyzeMode>(getAnalyzeMode())
