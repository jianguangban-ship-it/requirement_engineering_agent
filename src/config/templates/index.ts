import acTemplate from './ac-template.json'
import optimize from './optimize.json'
import bugReport from './bug-report.json'
import changeRequest from './change-request.json'
import type { TemplateDefinition } from '@/types/template'

export const TEMPLATES: TemplateDefinition[] = [
  acTemplate as TemplateDefinition,
  optimize as TemplateDefinition,
  bugReport as TemplateDefinition,
  changeRequest as TemplateDefinition
]

export function getTemplateContent(key: string, lang: 'zh' | 'en'): string | undefined {
  return TEMPLATES.find(t => t.key === key)?.content[lang]
}
