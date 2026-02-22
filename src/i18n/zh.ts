export default {
  header: {
    title: 'JIRA 智能任务工作站'
  },
  form: {
    basicInfo: '基本信息',
    projectName: '项目空间',
    assignee: '经办人',
    members: '人',
    searchAssignee: '搜索姓名或工号...',
    noResults: '未找到匹配',
    results: '个结果',
    taskType: '任务类型',
    storyPoints: '故事点估算',
    aiWillVerify: 'AI 将进行二次校验',
    taskSummary: '任务摘要',
    fivePartInput: '五段式结构化输入',
    vehicle: '车型',
    product: '产品',
    layer: '分层',
    component: '组件',
    componentPlaceholder: '组件名',
    taskDetail: '任务概括',
    taskDetailPlaceholder: '简要描述任务内容',
    livePreview: '实时预览',
    previewPlaceholder: '请填写上方字段...',
    taskDescription: '任务描述',
    required: '必填',
    descriptionPlaceholder: '请输入背景信息、前置需求、变更请求、缺陷描述、设计思路、验收标准 (AC) 或复现步骤...',
    reset: '重置',
    aiAnalyze: 'AI 智能分析',
    confirmCreate: '确认创建 (JIRA)',
    creating: '创建中...',
    analyzing: '分析中...',
    select: '选择'
  },
  panel: {
    aiAgentResponse: 'AI Agent 审核消息',
    jiraResponse: 'JIRA 创建结果',
    waitingAI: '等待 AI Agent 响应...',
    aiAnalyzing: 'AI 正在分析...',
    retryBtn: '重试',
    waitingJira: '等待 JIRA 创建结果...',
    summary: '处理摘要',
    aiCorrectedPoints: 'AI 修正点数',
    subtasks: '拆解子任务',
    items: '个'
  },
  status: {
    idle: '空闲',
    loading: '加载中',
    success: '成功',
    error: '错误',
    pending: '待处理',
    created: '已创建'
  },
  dev: {
    viewPayload: '查看请求 Payload',
    webhookConfig: 'Webhook 配置',
    currentMode: '当前模式',
    production: '生产环境',
    testing: '测试环境',
    configHint: '修改常量以更新配置：'
  },
  error: {
    timeout: '请求超时，请检查 n8n 服务是否运行',
    connectionFailed: '无法连接到 n8n 服务',
    requestFailed: '请求失败',
    emptyResponse: '服务器返回空响应，请检查 n8n 工作流中 Respond_to_Webhook 节点配置',
    glm401: 'API Key 无效，请点击 ⚙ 设置进行更新。',
    glm429: '请求频率超限，请稍候后重试。',
    glm5xx: 'GLM 服务暂时不可用，请稍后重试。'
  },
  urlMode: {
    testTooltip: '测试模式：需要在 n8n 编辑器中点击 "Listen" 按钮',
    prodTooltip: '生产模式：需要 n8n 工作流处于 Active 状态（绿色）'
  },
  coach: {
    title: 'AI 任务辅导信息',
    emptyHint: '获取 AI 辅导，写出更优质的任务描述',
    emptySubHint: '填写基本信息和描述后，点击下方按钮',
    analyzing: 'AI Coach 正在分析...',
    requestBtn: '获取写作指导',
    requesting: '请求中...',
    retryBtn: '重试',
    hint: 'Coach 将帮助提升您的描述质量',
    team: '所属团队',
    assignee: '经办人',
    reviewDetails: '审核详情'
  },
  quality: {
    excellent: '优秀',
    good: '良好',
    incomplete: '待完善',
    empty: '未填写'
  },
  modal: {
    confirmTitle: '确认创建 JIRA 工单',
    confirmHint: '请检查以下 Payload 后再创建工单。',
    cancel: '取消',
    confirm: '创建工单'
  },
  toast: {
    analyzeSuccess: 'AI 分析完成',
    createSuccess: 'JIRA 工单创建成功',
    coachSuccess: '已获取 Coach 指导',
    draftRestored: '已恢复上次未完成的草稿',
    draftCleared: '表单已重置，草稿已清除',
    copied: '已复制到剪贴板'
  },
  shortcuts: {
    analyze: 'Ctrl+Enter',
    create: 'Ctrl+Shift+Enter'
  },
  settings: {
    title: 'LLM 设置',
    coachMode: 'Coach 模式',
    modeLLM: 'GLM API（直连）',
    modeWebhook: 'n8n Webhook',
    apiKey: 'GLM API Key',
    apiKeyPlaceholder: '输入您的 ZhipuAI API Key',
    model: '模型名称',
    modelPlaceholder: 'glm-4.7-flash',
    analyzeMode: '分析模式',
    coachSkill: 'Coach 提示词',
    analyzeSkill: '分析提示词',
    skillReset: '恢复默认',
    skillHint: '编辑 AI 行为规则。{lang} 在运行时替换为当前语言（zh 或 en）。',
    testKey: '验证',
    testing: '验证中...',
    keyValid: 'Key 有效',
    save: '保存',
    cancel: '取消',
    saved: '设置已保存'
  }
} as const
