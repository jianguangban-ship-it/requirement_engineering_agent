# JIRA AI-Powered Task Workstation — User Manual
# JIRA 智能任务工作站 — 用户手册

> Version / 版本: v8.23 | Language / 语言: English · 中文

---

## Table of Contents / 目录

1. [Overview / 概述](#1-overview--概述)
2. [Interface Layout / 界面布局](#2-interface-layout--界面布局)
3. [First-Time Setup / 初次配置](#3-first-time-setup--初次配置)
4. [Step-by-Step Workflow / 标准操作流程](#4-step-by-step-workflow--标准操作流程)
5. [Header Controls / 顶栏控件](#5-header-controls--顶栏控件)
6. [AI Coach Panel / AI 辅导面板](#6-ai-coach-panel--ai-辅导面板)
7. [Task Form / 任务表单](#7-task-form--任务表单)
8. [AI Smart Analysis / AI 智能分析](#8-ai-smart-analysis--ai-智能分析)
9. [Creating a JIRA Ticket / 创建 JIRA 工单](#9-creating-a-jira-ticket--创建-jira-工单)
10. [Ticket History / 工单历史](#10-ticket-history--工单历史)
11. [Settings / 设置](#11-settings--设置)
12. [Keyboard Shortcuts / 键盘快捷键](#12-keyboard-shortcuts--键盘快捷键)
13. [Tips & Troubleshooting / 使用技巧与常见问题](#13-tips--troubleshooting--使用技巧与常见问题)

---

## 1. Overview / 概述

The **JIRA AI-Powered Task Workstation** is a browser-based tool that helps software engineers write high-quality JIRA task requirements. It uses an AI Agent to review your task description, score it, suggest improvements, and then create the JIRA ticket on your behalf.

**JIRA 智能任务工作站**是一款面向软件工程师的浏览器工具，帮助用户撰写高质量的 JIRA 任务需求。AI Agent 将对任务描述进行审核、评分、提出修改建议，并代为创建 JIRA 工单。

**Key capabilities / 核心功能：**
- Structured 5-part task summary builder (Vehicle / Product / Layer / Component / Detail)
- AI writing coach with real-time quality guidance
- AI analysis with story point verification and subtask decomposition
- One-click JIRA ticket creation with payload preview
- Full English / Chinese interface with dark and light themes

---

## 2. Interface Layout / 界面布局

The app is divided into three columns plus a top header bar.
应用分为顶部标题栏和三列主体区域。

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Title | Language | Mode | Status | Theme | Settings │
├──────────────────┬──────────────────┬───────────────────────┤
│                  │                  │                       │
│  LEFT COLUMN     │  CENTER COLUMN   │  RIGHT COLUMN         │
│  AI Coach Panel  │  Task Form       │  AI Review Panel      │
│                  │  · Basic Info    │  JIRA Response Panel  │
│                  │  · Story Points  │  Ticket History       │
│                  │  · Summary       │  Dev Tools            │
│                  │  · Description   │                       │
│                  │  · Action Btns   │                       │
└──────────────────┴──────────────────┴───────────────────────┘
```

| Column | Purpose |
|--------|---------|
| **Left / 左列** | AI Coach provides writing guidance before you analyze |
| **Center / 中列** | Main task form where you fill in all task details |
| **Right / 右列** | AI review results, JIRA creation response, and history |

---

## 3. First-Time Setup / 初次配置

Before using the app, configure your LLM connection in **Settings**.
使用前，请先在**设置**中配置 LLM 连接。

### Step 1 — Open Settings / 打开设置

Click the **⚙** gear icon in the top-right corner of the header.
点击顶栏右侧的 **⚙** 图标。

### Step 2 — Choose a connection mode / 选择连接模式

| Mode | When to use |
|------|-------------|
| **GLM API (Direct)** | You have a ZhipuAI API Key. AI calls go directly from your browser to the GLM API. |
| **n8n Webhook** | Your team has an n8n workflow set up. All AI calls are routed through the webhook. |

### Step 3 — Enter your API Key (GLM mode only) / 输入 API Key（GLM 模式）

Paste your **ZhipuAI API Key** into the `GLM API Key` field.
Click **Test / 验证** to verify the key is valid before saving.

> 💡 You can optionally fill in a custom **Provider Base URL** if you use a proxy or an alternative OpenAI-compatible endpoint. Leave blank to use the default GLM API endpoint.

### Step 4 — Choose a model / 选择模型

The default model is `glm-4.7-flash`. You may enter any model name supported by your provider.
默认模型为 `glm-4.7-flash`，可填写任意提供商支持的模型名称。

### Step 5 — Save / 保存

Click **Save / 保存**. Settings are stored locally in your browser and persist across sessions.
点击**保存**，设置将保存在本地浏览器中，下次打开自动恢复。

---

## 4. Step-by-Step Workflow / 标准操作流程

The recommended workflow follows these steps every time you create a task:
推荐按以下步骤使用：

```
① Fill Basic Info  →  ② Build Summary  →  ③ Write Description
       ↓
④ (Optional) Get AI Coach Guidance
       ↓
⑤ Click "AI Smart Analysis"
       ↓
⑥ Review AI findings in the right panel
       ↓
⑦ Click "Confirm Create (JIRA)" → Preview payload → Confirm
       ↓
⑧ Ticket key appears in JIRA Response panel and Ticket History
```

---

## 5. Header Controls / 顶栏控件

The header bar sits at the top of every page and contains global controls.
顶栏位于页面顶部，包含全局控制选项。

### Language Toggle / 语言切换

Click **EN** or **中文** to switch the entire interface language.
点击 **EN** 或 **中文** 切换界面语言，即时生效。

### Test / Prod Mode Toggle / 测试/生产模式切换

| Mode | Color | Description |
|------|-------|-------------|
| **Test** | 🟠 Orange | Requires clicking "Listen" in the n8n editor to activate the webhook |
| **Prod** | 🟢 Green | Requires the n8n workflow to be in **Active** state |

> This toggle only affects the webhook URL used for n8n mode. It has no effect in GLM Direct mode.
> 该切换仅影响 n8n 模式下的 Webhook URL，在 GLM 直连模式下无效。

### Theme Toggle / 主题切换

Click the ☀️ / 🌙 button to switch between **Light** and **Dark** themes. Your preference is saved automatically.
点击 ☀️ / 🌙 按钮切换**浅色**和**深色**主题，偏好自动保存。

### Settings / 设置

Click **⚙** to open the LLM Settings modal. See [Section 11](#11-settings--设置) for details.

---

## 6. AI Coach Panel / AI 辅导面板

The **AI Coach** panel is on the **left column**. It provides writing guidance *before* you run the full AI analysis, helping you improve your task description quality upfront.

**AI 辅导**面板位于**左列**。在运行完整 AI 分析之前，Coach 提供写作指导，帮助你提前优化任务描述质量。

### Getting Guidance / 获取指导

1. Fill in at least the **Basic Info** and **Task Description** fields in the center form.
2. Click the **Get Writing Guidance / 获取写作指导** button at the bottom of the Coach panel.
3. The AI will analyze your draft and return structured feedback.

### Skill Toggle / 技能开关

In the panel header, you will see a **Skill ON / Skill OFF** toggle button (visible in GLM mode only).

| State | Behavior |
|-------|----------|
| **Skill ON** (default) | AI uses the JIRA coaching system prompt — focused, structured feedback |
| **Skill OFF** | No system prompt — AI responds freely; useful for general questions or brainstorming |

点击切换按钮可随时开启或关闭技能提示词，**关闭**后 AI 将自由回答，适合头脑风暴或非 JIRA 相关问题。

### Template Chips / 快捷模板

Below the empty-state hint, you will see a row of **template chips** — pre-defined prompt shortcuts. Click any chip to instantly send that template to the AI Coach.

模板芯片是预置的快捷提示词，点击即可直接发送给 AI Coach，无需手动输入。

**Importing Templates by Drag & Drop / 拖拽导入模板:**
1. Prepare a JSON file containing a `TemplateDefinition[]` array.
2. Drag the `.json` file and drop it directly onto the chips area.
3. New templates are merged in (duplicates are skipped). A toast notification confirms how many were imported.

### Copy Response / 复制回复

When the Coach returns a response, a **copy icon** appears in the panel header. Click it to copy the full response to your clipboard.

### Retry / 重试

If a request fails, a **Retry** button appears. Click it to resend the same request.

### Rate Limit (429) / 频率限制

If the GLM API returns a 429 rate-limit error, the panel shows an automatic countdown timer and retries after the wait period. You can click **Cancel auto-retry** to abort.

---

## 7. Task Form / 任务表单

The **center column** contains the main task form. Fill in all sections before running the AI analysis.
**中列**为主任务表单，请在运行 AI 分析前填写所有字段。

---

### 7.1 Basic Information / 基本信息

| Field | Description |
|-------|-------------|
| **Project Name / 项目空间** | Select the JIRA project from the dropdown |
| **Assignee / 经办人** | Search by name or employee ID using the combobox; supports fuzzy search |
| **Task Type / 任务类型** | Select the issue type (Story, Task, Bug, Sub-task, etc.) |
| **Story Points / 故事点** | Select from preset values **1 · 2 · 3 · 5 · 8**, or type any custom number in the free-input field after "8" |

> **Story Points note:** The AI will verify your story point estimate during analysis and may suggest a correction. The final value in the JIRA ticket reflects the AI's recommendation.
> AI 将在分析阶段校验故事点估算，并可能给出修正建议，最终工单以 AI 推荐值为准。

**Assignee Search / 经办人搜索:**
- Type 2+ characters to filter the list
- Results show avatar initials, full name, and employee ID
- The number of matches is shown in real time

---

### 7.2 Task Summary — Five-Part Structured Input / 任务摘要 — 五段式结构化输入

This section builds a standardised task title using five fields:
本节通过五个字段生成标准化任务标题：

| Field | Example | Limit |
|-------|---------|-------|
| **Vehicle / 车型** | GWM01, Tank500 | Select from dropdown |
| **Product / 产品** | IBC, EPS | Select from dropdown |
| **Layer / 分层** | BSW, ASW, SYS | Select from dropdown |
| **Component / 组件** | CAN Driver, NvM | Free text, max 50 chars |
| **Task Detail / 任务概括** | Add error handling for sensor timeout | Free text, max 100 chars |

**Live Preview / 实时预览:**
The assembled summary string is shown in the **Live Preview** box and updates as you type. This will become the JIRA ticket title.
五段组合后的摘要字符串实时显示在**预览框**中，将作为 JIRA 工单标题。

**Quality Meter / 质量评分:**
A progress bar below the summary shows the current quality score (Excellent / Good / Incomplete / Empty). Aim for **Good** or **Excellent** before analyzing.
摘要下方的进度条实时显示质量评分（优秀 / 良好 / 待完善 / 未填写），建议达到**良好**以上再提交分析。

**Copy Summary / 复制摘要:**
Click the copy icon in the Quality Meter header to copy the assembled summary to your clipboard.

---

### 7.3 Task Description / 任务描述

Write a detailed task description in the large text area. Include any relevant context:
在大文本区输入详细任务描述，可包含以下内容：

- Background information / 背景信息
- Prerequisites / 前置条件
- Change requests / 变更请求
- Defect description / 缺陷描述
- Design ideas / 设计思路
- Acceptance criteria (AC) / 验收标准
- Reproduction steps (for bugs) / 复现步骤

**Word & Sentence Counter / 字词统计:**
The counter below the text area shows real-time **word count** and **sentence count** to help you gauge description length.
文本区下方实时显示**词数**和**句数**，帮助控制描述详略程度。

> 💡 **Tip:** A description of at least 3–5 sentences covering background, goal, and acceptance criteria will score highest in the AI analysis.
> 建议至少填写 3–5 句涵盖背景、目标和验收标准的内容，以获得最高 AI 评分。

---

### 7.4 Action Buttons / 操作按钮

| Button | Shortcut | When available | Action |
|--------|----------|----------------|--------|
| **Reset / 重置** | — | Always | Clears the entire form and removes the draft from local storage |
| **AI Smart Analysis / AI 智能分析** | `Ctrl+Enter` | When required fields are filled | Sends the task to the AI Agent for review |
| **Confirm Create (JIRA) / 确认创建** | `Ctrl+Shift+Enter` | After AI analysis completes | Opens the payload preview modal |

> **Note:** The **Confirm Create** button only appears after a successful AI analysis. You must analyze before creating.
> **注意：**「确认创建」按钮仅在 AI 分析成功后出现，必须先分析再创建。

---

## 8. AI Smart Analysis / AI 智能分析

Click **AI Smart Analysis** (or press `Ctrl+Enter`) to send your task to the AI Agent.
点击 **AI 智能分析**（或按 `Ctrl+Enter`）将任务发送给 AI Agent 进行审核。

### What the AI reviews / AI 审核内容

- **Story point correctness** — compares your estimate to industry standards for the task type
- **Task description quality** — completeness, clarity, and structure
- **Subtask decomposition** — if the task is large, AI may propose splitting it into subtasks
- **Field consistency** — checks that summary and description are aligned

### Reading the AI Review Panel / 阅读 AI 审核面板

The **AI Agent Review Message** panel (right column, top) shows the analysis result.

| Element | Description |
|---------|-------------|
| **Processing Summary** | Score card: AI-corrected story points, number of subtasks proposed |
| **Detailed review** | Full markdown response with findings and recommendations |
| **Status badge** | `Success` (green), `Loading` (orange), `Error` (red) |

### Diff View / 差异对比视图

After running a **second** analysis, a **Diff** toggle button appears in the panel header.

- **Diff mode:** Shows word-level differences between the previous and current AI response (green = added, red = removed)
- **Normal mode:** Shows the latest response without highlighting

差异对比仅在第二次分析后出现，点击 **Diff** 按钮可查看两次 AI 回复之间的逐词差异。

### Copy & Retry / 复制与重试

- **Copy icon** — copies the full AI response to clipboard
- **Retry button** — resends the analysis if the request failed

---

## 9. Creating a JIRA Ticket / 创建 JIRA 工单

After reviewing the AI analysis, click **Confirm Create (JIRA)** to create the ticket.
AI 分析完成后，点击**确认创建 (JIRA)** 创建工单。

### Step 1 — Preview Modal / 预览弹窗

A modal opens showing the **full request payload** that will be sent to JIRA. Review it carefully:
弹窗展示即将发送至 JIRA 的完整请求 Payload，请仔细检查：

- Ticket summary (title)
- Assignee
- Task type
- Story points (AI-corrected value)
- Description text
- Subtasks (if any)

### Step 2 — Confirm or Cancel / 确认或取消

| Button | Action |
|--------|--------|
| **Create Ticket / 创建工单** | Submits the payload to JIRA and creates the ticket |
| **Cancel / 取消** | Closes the modal without creating anything |

### Step 3 — JIRA Response / JIRA 响应

After creation, the **JIRA Create Issue Response** panel (right column, middle) shows:
创建后，右列中部的 **JIRA 创建结果**面板显示：

- **Success:** The response JSON including the new ticket key (e.g., `PROJ-1234`)
- **In progress:** A spinner in JIRA blue while the request is processing
- **Error:** The error message if creation failed

> 💡 The ticket key in the response is a **clickable link** — click it to open the ticket directly in JIRA.

---

## 10. Ticket History / 工单历史

The **Ticket History** panel at the bottom of the right column keeps a log of the last **20 successfully created tickets**, persisted in your browser.

右列底部的**工单历史**面板保存最近 **20 条**成功创建的工单记录，数据存储在本地浏览器中。

### Reading history entries / 阅读历史记录

Each entry shows:
每条记录包含：

| Field | Description |
|-------|-------------|
| **Ticket Key** | Clickable link (e.g., `PROJ-1234`) — opens the ticket in JIRA in a new tab |
| **Summary** | Truncated task title |
| **Project + Type badge** | Project code and issue type |
| **Relative time** | How long ago the ticket was created (e.g., "5m ago", "2h ago") |

### Clearing history / 清空历史

Click the **Clear / 清空** button in the panel header to remove all history entries.

> ⚠️ This action cannot be undone.
> ⚠️ 此操作不可撤销。

---

## 11. Settings / 设置

Open Settings with the **⚙** button or press `Ctrl+,`.
点击 **⚙** 按钮或按 `Ctrl+,` 打开设置。

### LLM Connection / LLM 连接

| Setting | Description |
|---------|-------------|
| **Coach Mode** | GLM API (Direct) or n8n Webhook |
| **Provider Base URL** | Optional custom endpoint; leave blank for default GLM API |
| **GLM API Key** | Your ZhipuAI API key; click **Test** to validate |
| **Model Name** | Default: `glm-4.7-flash` |
| **Analyze Mode** | GLM API (Direct) or n8n Webhook |

### AI Skills / AI 技能提示词

Each mode (Coach / Analyze) has an editable **skill prompt** that defines how the AI behaves.

| Button | Action |
|--------|--------|
| **Reset to Default / 恢复默认** | Restores the built-in skill prompt for the current interface language |
| **modified** badge | Shown when the skill has been customised from the default |

> 💡 The skill prompt is language-aware. Switching the interface language and resetting will load the corresponding Chinese or English default prompt.

### Template Chips / 快捷模板管理

The Template Chips section lets you manage the quick-action chips shown in the Coach panel.
快捷模板管理允许你自定义显示在 Coach 面板中的模板芯片。

| Action | How |
|--------|-----|
| Add a chip | Click **Add Chip / 添加模板** and fill in the key and label |
| Remove a chip | Click the **×** on any chip |
| Reset to defaults | Click **Reset to Defaults / 恢复默认** |
| Import from file | Click **Import Templates / 导入模板** and select a `.json` file |

**Import file format:**
```json
[
  { "key": "unique_key", "label": "Button Label", "prompt": "The prompt text to send" }
]
```

### Export / Import Settings / 导出/导入设置

- **Export / 导出** — downloads all settings (API key, model, modes, skill overrides) as a JSON file
- **Import / 导入** — loads settings from a previously exported JSON file; useful for migrating to a new machine

---

## 12. Keyboard Shortcuts / 键盘快捷键

Press **`?`** anywhere (outside a text input) to open the shortcuts reference modal.
在非输入框区域按 **`?`** 键可随时打开快捷键速查弹窗。

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Run AI Smart Analysis / 运行 AI 分析 |
| `Ctrl+Shift+Enter` | Open Confirm Create JIRA modal / 打开确认创建弹窗 |
| `Ctrl+,` | Open Settings / 打开设置 |
| `Escape` | Close any open modal / 关闭当前弹窗 |
| `?` | Show this keyboard shortcuts cheat sheet / 显示快捷键列表 |

---

## 13. Tips & Troubleshooting / 使用技巧与常见问题

### Tips for better AI results / 获得更好 AI 结果的技巧

- **Be specific in the description.** Vague descriptions get low scores. Include who, what, why, and how to verify.
  **描述要具体。**模糊的描述会得到低分，建议包含：执行者、任务内容、原因以及验收方法。

- **Use the Coach first.** Running the AI Coach before the main analysis helps you improve the description quality upfront and reduces the need for rework.
  **先用 Coach 辅导。**在主分析前先请 Coach 审阅，可以提前优化描述质量，减少返工。

- **Match the description to the summary.** If your 5-part summary says "NvM driver configuration" but the description discusses a completely different topic, the AI will flag the inconsistency.
  **保持摘要与描述一致。**五段式摘要与描述内容不匹配会被 AI 标记为不一致。

- **Draft saved automatically.** Your form content is auto-saved to the browser as a draft. If you accidentally close the tab, reopen the app and your draft will be restored with a toast notification.
  **草稿自动保存。**表单内容会自动保存到浏览器，意外关闭标签页后重新打开可恢复草稿。

---

### Common Issues / 常见问题

#### App shows "Request timeout" / 提示「请求超时」

- GLM mode: Check your network connection and confirm the ZhipuAI API service is reachable.
- n8n mode: Confirm the n8n service is running and the workflow is active (Prod mode) or listening (Test mode).

#### "Invalid API Key" error / 提示「API Key 无效」

Open **Settings (⚙)**, re-enter your ZhipuAI API Key, click **Test / 验证**, then **Save / 保存**.

#### Rate limit — countdown timer appears / 出现频率限制倒计时

The GLM API has a rate limit. The app automatically waits and retries. You can click **Cancel auto-retry / 取消自动重试** to abort, or simply wait for the countdown to finish.

#### "Confirm Create" button not visible / 「确认创建」按钮不显示

This button only appears **after a successful AI analysis**. Run the analysis first by clicking **AI Smart Analysis** or pressing `Ctrl+Enter`.

#### Draft restored toast on startup / 启动时提示草稿已恢复

This is normal — the app found a previously unsaved draft and restored it. Click **Reset / 重置** if you want to start fresh.

#### Story points were changed by AI / AI 修改了故事点

The AI verifies your estimate. The corrected value is shown in the **Processing Summary** section of the AI Review panel. The JIRA ticket will use the AI-recommended value. If you disagree, note it in the task description before creating.

---

*For technical issues or feature requests, please contact your system administrator.*
*如有技术问题或功能建议，请联系系统管理员。*
