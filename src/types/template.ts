export interface TemplateLabel { zh: string; en: string }
export interface TemplateContent { zh: string; en: string }
export interface TemplateDefinition {
  key: string
  icon: string
  label: TemplateLabel
  content: TemplateContent
}
