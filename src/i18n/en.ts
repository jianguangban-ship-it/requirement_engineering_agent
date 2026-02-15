export default {
  header: {
    title: 'JIRA AI-Powered Task Workstation'
  },
  form: {
    basicInfo: 'Basic Information',
    projectName: 'Project Name',
    assignee: 'Assignee',
    members: 'members',
    searchAssignee: 'Search assignee by name or ID...',
    noResults: 'No results for',
    results: 'results',
    taskType: 'Task Type',
    storyPoints: 'Story Points',
    aiWillVerify: 'AI will verify',
    taskSummary: 'Task Summary',
    fivePartInput: 'Five-Part Structured Input',
    vehicle: 'Vehicle',
    product: 'Product',
    layer: 'Layer',
    component: 'Component',
    componentPlaceholder: 'Component name',
    taskDetail: 'Task Detail',
    taskDetailPlaceholder: 'Brief task description',
    livePreview: 'Live Preview',
    previewPlaceholder: 'Please fill in the fields above...',
    taskDescription: 'Task Description',
    required: 'Required',
    descriptionPlaceholder: 'Enter background info, prerequisites, change requests, defect description, design thoughts, acceptance criteria (AC), or reproduction steps...',
    reset: 'Reset',
    aiAnalyze: 'AI Smart Analysis',
    confirmCreate: 'Confirm Create (JIRA)',
    creating: 'Creating...',
    analyzing: 'Analyzing...',
    select: 'Select'
  },
  panel: {
    aiAgentResponse: 'AI Agent Review Message',
    jiraResponse: 'JIRA Create Issue Response',
    waitingAI: 'Waiting for AI Agent response...',
    aiAnalyzing: 'AI is analyzing...',
    waitingJira: 'Waiting for JIRA creation result...',
    summary: 'Processing Summary',
    aiCorrectedPoints: 'AI Corrected Points',
    subtasks: 'Subtasks',
    items: 'items'
  },
  status: {
    idle: 'Idle',
    loading: 'Loading',
    success: 'Success',
    error: 'Error',
    pending: 'Pending',
    created: 'Created'
  },
  dev: {
    viewPayload: 'View Request Payload',
    webhookConfig: 'Webhook Configuration',
    currentMode: 'Current Mode',
    production: 'Production',
    testing: 'Testing',
    configHint: 'Modify constant to update config:'
  },
  error: {
    timeout: 'Request timeout, please check if n8n service is running',
    connectionFailed: 'Cannot connect to n8n service',
    requestFailed: 'Request failed',
    emptyResponse: 'Server returned empty response, please check n8n workflow configuration'
  },
  urlMode: {
    testTooltip: 'Test Mode: Requires clicking "Listen" in n8n editor',
    prodTooltip: 'Production Mode: Requires n8n workflow to be Active (green)'
  },
  coach: {
    title: 'AI Coach Guidance',
    emptyHint: 'Get AI guidance to write better task descriptions',
    emptySubHint: 'Fill in basic info and description, then click the button below',
    analyzing: 'AI Coach is analyzing...',
    requestBtn: 'Get Writing Guidance',
    requesting: 'Requesting...',
    hint: 'Coach will help improve your description quality',
    team: 'Team',
    assignee: 'Assignee',
    reviewDetails: 'Review Details'
  },
  quality: {
    excellent: 'Excellent',
    good: 'Good',
    incomplete: 'Incomplete',
    empty: 'Empty'
  },
  modal: {
    confirmTitle: 'Confirm JIRA Creation',
    confirmHint: 'Review the payload below before creating the JIRA ticket.',
    cancel: 'Cancel',
    confirm: 'Create Ticket'
  },
  toast: {
    analyzeSuccess: 'AI analysis completed',
    createSuccess: 'JIRA ticket created successfully',
    coachSuccess: 'Coach guidance received',
    draftRestored: 'Draft restored from previous session',
    draftCleared: 'Form reset and draft cleared',
    copied: 'Copied to clipboard'
  },
  shortcuts: {
    analyze: 'Ctrl+Enter',
    create: 'Ctrl+Shift+Enter'
  }
} as const
