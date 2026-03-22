import { ref, computed } from 'vue'
import acTemplate from './ac-template.json'
import optimize from './optimize.json'
import bugReport from './bug-report.json'
import changeRequest from './change-request.json'
import sysDecomposition from './sys-decomposition.json'
import sysInterface from './sys-interface.json'
import sweAcceptance from './swe-acceptance.json'
import sweApiContract from './swe-api-contract.json'
import hweInterface from './hwe-interface.json'
import hweResource from './hwe-resource.json'
import mePackaging from './me-packaging.json'
import meThermal from './me-thermal.json'
import vvTestCase from './vv-test-case.json'
import vvCoverage from './vv-coverage.json'
import type { TemplateDefinition } from '@/types/template'
import { currentRole } from '@/composables/useRole'

/** Built-in templates from JSON files — common (no roles) + role-specific */
export const TEMPLATES: TemplateDefinition[] = [
  // Common templates (shown for all roles)
  acTemplate as TemplateDefinition,
  optimize as TemplateDefinition,
  bugReport as TemplateDefinition,
  changeRequest as TemplateDefinition,
  // Role-specific templates
  sysDecomposition as unknown as TemplateDefinition,
  sysInterface as unknown as TemplateDefinition,
  sweAcceptance as unknown as TemplateDefinition,
  sweApiContract as unknown as TemplateDefinition,
  hweInterface as unknown as TemplateDefinition,
  hweResource as unknown as TemplateDefinition,
  mePackaging as unknown as TemplateDefinition,
  meThermal as unknown as TemplateDefinition,
  vvTestCase as unknown as TemplateDefinition,
  vvCoverage as unknown as TemplateDefinition
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

/** Role-filtered templates — shows common templates (no roles field) + templates matching current role */
export const roleFilteredTemplates = computed(() =>
  effectiveTemplates.value.filter(t =>
    !t.roles || t.roles.length === 0 || t.roles.includes(currentRole.value)
  )
)

export function getTemplateContent(key: string, lang: 'zh' | 'en'): string | undefined {
  return effectiveTemplates.value.find(t => t.key === key)?.content[lang]
}
