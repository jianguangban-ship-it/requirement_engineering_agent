export interface WebhookPayload {
  meta: {
    source: string
    timestamp: number
    action: 'analyze' | 'create' | 'coach' | 'preview'
  }
  data: {
    project_key: string
    project_name: string
    issue_type: string
    summary: string
    description: string
    assignee: string
    estimated_points: number
  }
}

export interface AIAgentResponse {
  ai_points?: number
  subtasks_created?: number
  [key: string]: unknown
}

export interface JiraResponse {
  key?: string
  id?: string
  self?: string
  [key: string]: unknown
}

export interface CoachResponse {
  status?: string
  comment?: string
  markdown_msg?: string
  team?: string
  assignee?: string
  jira_id?: string
  raw_content?: string
  message?: string
  output?: string
  content?: string
  text?: string
  [key: string]: unknown
}

export interface WebhookConfig {
  testUrl: string
  prodUrl: string
  timeout: number
}

export type ActionType = 'analyze' | 'create' | 'coach'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
  duration: number
}
