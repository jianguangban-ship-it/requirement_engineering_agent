import type { UserRole } from '@/composables/useRole'

export interface TemplateLabel { zh: string; en: string }
export interface TemplateContent { zh: string; en: string }
export interface TemplateDefinition {
  key: string
  icon: string
  label: TemplateLabel
  content: TemplateContent
  /** If set, chip is only shown for these roles. Omit or empty = shown for all roles. */
  roles?: UserRole[]
}
