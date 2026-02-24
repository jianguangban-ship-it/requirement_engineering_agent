import { ref } from 'vue'
import acTemplate from './ac-template.json'
import optimize from './optimize.json'
import bugReport from './bug-report.json'
import changeRequest from './change-request.json'
import type { TemplateDefinition } from '@/types/template'

/** Built-in templates from JSON files */
export const TEMPLATES: TemplateDefinition[] = [
  acTemplate as TemplateDefinition,
  optimize as TemplateDefinition,
  bugReport as TemplateDefinition,
  changeRequest as TemplateDefinition
]

const LS_KEY_CUSTOM_TEMPLATES = 'custom-templates'

function loadFromStorage(): TemplateDefinition[] | null {
  const raw = localStorage.getItem(LS_KEY_CUSTOM_TEMPLATES)
  if (!raw) return null
  try { return JSON.parse(raw) as TemplateDefinition[] } catch { return null }
}

/** Reactive modified flag */
export const customTemplatesModified = ref(localStorage.getItem(LS_KEY_CUSTOM_TEMPLATES) !== null)

/** Reactive effective templates — updates when custom templates are saved/reset */
export const effectiveTemplates = ref<TemplateDefinition[]>(loadFromStorage() ?? TEMPLATES)

export function setCustomTemplates(templates: TemplateDefinition[]): void {
  localStorage.setItem(LS_KEY_CUSTOM_TEMPLATES, JSON.stringify(templates))
  effectiveTemplates.value = templates
  customTemplatesModified.value = true
}

export function resetCustomTemplates(): void {
  localStorage.removeItem(LS_KEY_CUSTOM_TEMPLATES)
  effectiveTemplates.value = [...TEMPLATES]
  customTemplatesModified.value = false
}

export function getEffectiveTemplates(): TemplateDefinition[] {
  return effectiveTemplates.value
}

export function getTemplateContent(key: string, lang: 'zh' | 'en'): string | undefined {
  return effectiveTemplates.value.find(t => t.key === key)?.content[lang]
}
