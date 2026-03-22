# AGec v10.9 — Manual Verification Test Guide

> **Format**: Each test case follows **Input → Action → Expected Output**.
> **Prerequisites**: Run `npm run dev` and open the app in a browser.
> Mark each case ✅ PASS or ❌ FAIL as you go.

---

## TABLE OF CONTENTS

1. [App Launch & Layout](#1-app-launch--layout)
2. [Header Controls](#2-header-controls)
3. [Column Resizing](#3-column-resizing)
4. [Basic Info Section](#4-basic-info-section)
5. [Summary Builder (5-Part)](#5-summary-builder-5-part)
6. [Quality Meter](#6-quality-meter)
7. [Description Editor](#7-description-editor)
8. [Domain Warnings & Validation](#8-domain-warnings--validation)
9. [Traceability Section](#9-traceability-section)
10. [Review Status Bar (5-Stage Pipeline)](#10-review-status-bar-5-stage-pipeline)
11. [Coach Panel — Empty State & Chips](#11-coach-panel--empty-state--chips)
12. [Coach Panel — Chat Flow](#12-coach-panel--chat-flow)
13. [Coach Panel — Streaming & Rate Limit](#13-coach-panel--streaming--rate-limit)
14. [Coach History Tab](#14-coach-history-tab)
15. [AI Review Panel — Analyze](#15-ai-review-panel--analyze)
16. [AI Review Panel — Deep Review](#16-ai-review-panel--deep-review)
17. [Diff View](#17-diff-view)
18. [JIRA Creation Flow](#18-jira-creation-flow)
19. [JIRA Response Panel](#19-jira-response-panel)
20. [Processing Summary](#20-processing-summary)
21. [Ticket History Panel](#21-ticket-history-panel)
22. [JIRA Search Panel](#22-jira-search-panel)
23. [Batch Panel](#23-batch-panel)
24. [Review Dashboard](#24-review-dashboard)
25. [Export Functions](#25-export-functions)
26. [DevTools Panel](#26-devtools-panel)
27. [LLM Settings Modal](#27-llm-settings-modal)
28. [Hotkey Modal & Keyboard Shortcuts](#28-hotkey-modal--keyboard-shortcuts)
29. [Theme Toggle (Dark / Light)](#29-theme-toggle-dark--light)
30. [i18n — Bilingual (EN / ZH)](#30-i18n--bilingual-en--zh)
31. [Draft Persistence (localStorage)](#31-draft-persistence-localstorage)
32. [Form Reset](#32-form-reset)
33. [Skill Auto-Detection](#33-skill-auto-detection)
34. [Accessibility & Keyboard Nav](#34-accessibility--keyboard-nav)

---

## 1. App Launch & Layout

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 1.1 | Browser URL | Open `http://localhost:5173` | App loads with 3-column layout: Coach (left), Form (center), Review (right). Header shows "AGec" logo + "v10.9". No console errors. |
| 1.2 | Initial page load | Inspect the header | Three colored dots (red, orange, blue) on the left. Version badge "v10.9". Language, role, mode, theme, help, settings controls on the right. |
| 1.3 | Initial page load | Check center column | TaskForm visible with: ReviewStatusBar at top (Draft stage active), BasicInfoSection, SummaryBuilder, DescriptionEditor, action buttons at bottom. |
| 1.4 | Initial page load | Check left column | CoachPanel visible with empty state: help icon, guidance text, Elicitation chip, Conflict Check chip, and quick template chips. |
| 1.5 | Initial page load | Check right column | AIReviewPanel visible with empty state: "Waiting for AI Agent response…". Below it: JiraSearchPanel, BatchPanel, ReviewDashboard, TicketHistoryPanel, DevTools (collapsed sections). |

---

## 2. Header Controls

### 2a. Language Toggle

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 2a.1 | Language = EN | Click "中文" button | All UI labels switch to Chinese. Button "中文" becomes active (highlighted). Form placeholders, section titles, button labels all in Chinese. |
| 2a.2 | Language = ZH | Click "EN" button | All UI labels switch back to English. Button "EN" becomes active. |

### 2b. Role Selector

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 2b.1 | Any state | Click "SYS" role button | SYS button highlights teal. Description placeholder changes to system-level hint. Coach template chips may update to SYS-relevant set. |
| 2b.2 | Role = SYS | Click "SW" role button | SW button highlights green. SYS de-highlights. Quality score may recalculate (different role weights). ASPICE badge in QualityMeter may change. |
| 2b.3 | Repeat | Click "HW", "ME", "VV" one by one | Each button highlights with its own color (orange, gray, purple). Placeholder text, template chips, ASPICE context update per role. |

### 2c. URL Mode Toggle

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 2c.1 | Mode = TEST | Observe header | "TEST" button active with orange pulsing status dot. Tooltip: mentions n8n editor "Listen" requirement. |
| 2c.2 | Mode = TEST | Click "PROD" button | "PROD" button becomes active with green pulsing dot. "TEST" de-highlights. DevTools panel shows "Production" mode and production URL. |
| 2c.3 | Mode = PROD | Click "TEST" button | Reverts to test mode. DevTools shows "Testing" mode and test URL. |

### 2d. Help Button

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 2d.1 | Any state | Click the help button (? icon) | New browser tab opens to `https://wiki.gwm.cn/pages/viewpage.action?pageId=506263489#` |

### 2e. Settings Gear

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 2e.1 | Any state | Click the gear icon (⚙) | LLM Settings modal opens as full-screen overlay. See [Section 27](#27-llm-settings-modal) for modal tests. |

---

## 3. Column Resizing

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 3.1 | 3-column layout | Click and drag the left vertical divider rightward | Coach panel widens, Form panel narrows. Resize is smooth and real-time. |
| 3.2 | After dragging left handle | Release mouse | Columns stay at new size. Refresh the page → columns restore to the same saved proportions (localStorage persistence). |
| 3.3 | 3-column layout | Click and drag the right vertical divider leftward | Form panel widens, Review panel narrows. |
| 3.4 | Resize to extremes | Drag left handle far right | Columns have sensible minimum widths; content does not overflow or collapse entirely. |

---

## 4. Basic Info Section

### 4a. Project Selector

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 4a.1 | Empty form | Click the Project dropdown | Dropdown opens showing all projects in "Name (Team)" format. |
| 4a.2 | Dropdown open | Select a project (e.g., first option) | Dropdown closes. Selected project displayed. Assignee list filters to team members of that project. |
| 4a.3 | Project selected | Change to a different project | Assignee resets or filters to new team. Project key updates in form state. |

### 4b. Assignee Combobox

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 4b.1 | Project selected | Click the Assignee input field | Dropdown opens showing team members with avatar circles (initials), names, and IDs. |
| 4b.2 | Dropdown open | Type partial name (e.g., "zh") | List filters fuzzy-matching entries. Non-matching members hidden. |
| 4b.3 | Filtered list shown | Press ↓ arrow key twice, then Enter | Highlight moves down 2 items, then the highlighted member is selected. Dropdown closes. Selected name appears in input. |
| 4b.4 | Dropdown open | Click outside the combobox | Dropdown closes without changing selection. |
| 4b.5 | Assignee selected | Clear the input text and type a new name | Previous selection clears. New fuzzy results shown. |

### 4c. Task Type

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 4c.1 | Any state | Observe task type buttons | Buttons shown: Story, Task, Bug, Epic, Subtask — each with a colored dot. |
| 4c.2 | Default type | Click "Bug" | "Bug" button gets colored active background. Previous type de-highlights. `form.issueType` updates. |
| 4c.3 | Type = Bug | Click "Story" | "Story" highlights, "Bug" de-highlights. |

### 4d. Story Points Picker

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 4d.1 | Any state | Observe Fibonacci buttons | Buttons shown: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89 plus a custom input field. |
| 4d.2 | No points selected | Click "5" button | "5" button highlights. `form.estimatedPoints` = 5. "AI will verify" hint visible. |
| 4d.3 | Points = 5 | Click "13" button | "13" highlights, "5" de-highlights. |
| 4d.4 | Any state | Type "42" in custom input, press Enter or blur | Custom value "42" accepted. Fibonacci buttons all de-highlight. Points = 42. |
| 4d.5 | Custom input | Use arrow keys across Fibonacci buttons | Focus moves sequentially through buttons (roving tabindex). |

---

## 5. Summary Builder (5-Part)

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 5.1 | Empty summary fields | Observe live preview | Preview area shows placeholder or empty bracket notation `[—][—][—][—][—]`. Quality score = 0% / "Empty". |
| 5.2 | Empty | Select Vehicle dropdown → e.g., "L6006" | First bracket fills: `[L6006][—][—][—][—]`. Quality score increases. |
| 5.3 | Vehicle set | Select Product → e.g., "ADAS" | Preview: `[L6006][ADAS][—][—][—]`. Score increases further. |
| 5.4 | Vehicle + Product | Select Layer → e.g., "Application" | Preview updates to 3 of 5 filled. |
| 5.5 | 3 fields set | Type Component → "CameraModule" | Preview: `[L6006][ADAS][Application][CameraModule][—]`. Counter shows "12 / 50". |
| 5.6 | Component field | Type 50 chars | Counter turns red at "50 / 50". Cannot type beyond 50. |
| 5.7 | 4 fields set | Type Detail → "Add object detection for pedestrians" | All 5 brackets filled. Quality score rises significantly (may reach "Good" or "Excellent"). |
| 5.8 | Detail field | Type 100 chars | Counter turns red at "100 / 100". |
| 5.9 | Full preview | Click Copy button (clipboard icon) next to preview | Summary string copied to clipboard. Paste elsewhere to verify exact `[V][P][L][C][Detail]` format. |

---

## 6. Quality Meter

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 6.1 | Empty form | Observe quality meter | Score: "0%". Label: "Empty". Progress bar empty. Gray color. |
| 6.2 | Fill all 5 summary fields | Observe meter update | Score increases (e.g., 40–60%). Label changes to "Incomplete" or "Good". Bar fills proportionally. Color: orange. |
| 6.3 | Fill description (50+ words) | Observe meter update | Score increases more. Description adds bonus points. |
| 6.4 | Fill all form fields (project, assignee, type, points, summary, description) | Observe meter | Score approaches 80–100%. Label: "Good" or "Excellent". Bar green. |
| 6.5 | Add INCOSE violations (e.g., type "should" in description) | Observe meter | Score drops due to INCOSE penalty. Label may downgrade. |
| 6.6 | Different roles | Switch role from SYS to SW | Score recalculates with different role weights. Score may change even with same content. |

---

## 7. Description Editor

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 7.1 | Empty description | Observe textarea | Placeholder text visible (role-specific hint). Word/sentence counter: "0 words · 0 sentences". |
| 7.2 | Empty | Type "The system shall process sensor data within 10ms." | Text appears. Counter: "8 words · 1 sentence". Textarea auto-grows if needed. |
| 7.3 | Short text | Type 5 more sentences (varied length) | Counter updates in real-time: correct word and sentence counts. |
| 7.4 | Filled text | Select all text and delete | Returns to empty state. Counter: "0 words · 0 sentences". Placeholder reappears. |
| 7.5 | Switch role | Change role from SYS to HW | Placeholder text changes to HW-specific hint. |
| 7.6 | Switch language | Toggle EN → ZH | Placeholder updates to Chinese. Counter labels switch to Chinese. |

---

## 8. Domain Warnings & Validation

### 8a. INCOSE Violations

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 8a.1 | Empty description | Observe below textarea | No INCOSE violations displayed. |
| 8a.2 | Type: "The system should maybe handle errors" | Observe violations area | INCOSE violation appears: warning about ambiguous term "should" or "maybe". Tag shows "WARNING" (orange). |
| 8a.3 | Type more ambiguous terms: "approximately", "etc." | Observe | Additional violations appear with TransitionGroup animation (slide in). |
| 8a.4 | Remove ambiguous terms | Observe | Violations disappear with animation (slide out). |

### 8b. ASPICE Suggestions

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 8b.1 | Role = SW, type = Story | Leave description empty | ASPICE suggestions may appear showing recommended fields: "ASPICE" blue badge + field names with red asterisks for required ones. |
| 8b.2 | Change role | Switch to SYS | ASPICE suggestions update to SYS-specific process (e.g., SYS.1 fields). |

### 8c. Assumption Detection

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 8c.1 | Type: "Assuming the network is always available, the system shall sync data every 5 minutes." | Observe assumptions area | Assumption detected: purple badge + message about unstated assumption + suggestion to make it explicit. |
| 8c.2 | Remove the "Assuming…" clause | Observe | Assumption warning disappears. |

### 8d. Domain Warnings

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 8d.1 | Role = SW, type = Story | Type a description mentioning hardware terms inappropriately | Domain warning may appear with warning icon + bilingual message about out-of-scope terminology. |

---

## 9. Traceability Section

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 9.1 | Initial state | Observe section | Three fields: Requirement Level (default "—"), Parent Requirement (empty), Verification Method (default "—"). No action buttons. |
| 9.2 | Level = "—" | Select a level (e.g., "System Requirement") | Dropdown shows level options with ASPICE IDs. After selecting, "Suggest Links" and "Impact Analysis" buttons appear. |
| 9.3 | Level set | Type parent req ID: "SYS-REQ-042" | Text appears in input. |
| 9.4 | Level set | Select verification method → "Test" | Dropdown selects "Test". |
| 9.5 | Level set, Suggest Links visible | Click "Suggest Links" | Emits event → triggers AI traceability suggestion (results depend on LLM connectivity). Loading state should appear briefly. |
| 9.6 | Level set, Impact Analysis visible | Click "Impact Analysis" | Emits event → triggers AI impact analysis (results depend on LLM connectivity). |
| 9.7 | Level = "—" | Observe buttons | "Suggest Links" and "Impact Analysis" buttons should NOT be visible. |
| 9.8 | Level set but no parent req | Check traceability gaps | Gap warning may appear: "Missing parent requirement" with warning styling. |

---

## 10. Review Status Bar (5-Stage Pipeline)

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 10.1 | Initial state | Observe status bar | 5 circles connected by lines. "Draft" is active (glowing). Others are muted gray. |
| 10.2 | Run AI Analyze (after filling form) | Observe after analysis completes | "Draft" → completed (green checkmark). "AI Reviewed" becomes active (glowing). Connecting line turns green. |
| 10.3 | Status = AI Reviewed | Observe below status bar | Peer review checklist appears with checkbox items and progress percentage "0%". |
| 10.4 | Checklist visible | Check one checkbox item | Progress percentage updates (e.g., "33%"). Checked item shows checkmark. |
| 10.5 | Checklist partially checked | Check remaining items to 100% | "Approve" button appears (green). |
| 10.6 | All items checked | Click "Approve" | "Peer Reviewed" → completed. "Approved" becomes active. Checklist disappears. |
| 10.7 | After JIRA creation | Observe | "Created" becomes active/completed. Full pipeline green. |

---

## 11. Coach Panel — Empty State & Chips

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 11.1 | No chat messages | Observe coach panel | Empty state: help icon, title "Get AI guidance…", subtitle about filling form first. |
| 11.2 | Empty state | Observe template chips | "Requirement Elicitation" chip and "Conflict Check" chip visible. Quick template chips below (filtered by role). |
| 11.3 | Role = SYS | Observe chips | Template chips filtered for SYS role (may differ from SW chips). |
| 11.4 | Switch to SW | Observe chips | Template chip set may change to SW-relevant options. |
| 11.5 | Empty state | Click "Requirement Elicitation" chip | Emits `elicit` event → coach request sent with elicitation prompt. Chat view transitions to active. |
| 11.6 | Empty state | Click "Conflict Check" chip | Emits `conflictCheck` event → coach request sent with conflict check prompt. |
| 11.7 | Observe header | Check Skill and Task Skill toggles | "Skill ON" (blue) and "Task Skill ON" visible. Model badge shows current model name. |
| 11.8 | Skill = ON | Click "Skill ON" to turn OFF | Button changes to "Skill OFF" (muted). Right column (Review panels) hides entirely. Analyze and Deep Review buttons in TaskForm also hide. |
| 11.9 | Skill = OFF | Click "Skill OFF" to turn ON | Right column reappears. Analyze and Deep Review buttons reappear. |
| 11.10 | Skill = ON | Click "Task Skill ON" to turn OFF | Button changes to "Task Skill OFF". Coach prompts will no longer include full task fields context. |
| 11.11 | Skill = OFF | Try clicking "Task Skill" button | Button should be disabled/grayed when coach Skill is OFF. |

---

## 12. Coach Panel — Chat Flow

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 12.1 | Form filled with description | Click "Writing Guidance" button (⚡ lightning, orange) | Coach panel transitions from empty state to chat view. User message appears as a bubble. Typing indicator shows (avatar + three dots). |
| 12.2 | Typing indicator visible | Wait for response | Assistant message streams in token by token. Stream footer shows green pulsing cursor + "X tok/s". |
| 12.3 | Streaming complete | Observe chat | User bubble (right-aligned, blue) + Assistant bubble (left-aligned, green avatar). Markdown rendered with math support. Copy button appears in header. |
| 12.4 | Chat active | Fill description with new text and click "Writing Guidance" again | New user message appended. New assistant response streams. Chat scrolls to bottom. |
| 12.5 | Multiple messages | Scroll up in chat | Previous messages visible. Smooth scroll behavior. |
| 12.6 | Chat active | Click Copy button in Coach header | Last assistant message text copied to clipboard. |

---

## 13. Coach Panel — Streaming & Rate Limit

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 13.1 | Coach streaming | Click Reset button (square stop icon, red) | Stream cancels immediately. Partial response stays. "Retry" button appears with 2s cooldown. Reset icon changes from stop-square back to circular-arrow. |
| 13.2 | Retry visible | Wait 2 seconds for cooldown | Button text changes: "2s" → "1s" → "Retry". |
| 13.3 | Retry ready | Click "Retry" | Coach request re-sent. Typing indicator reappears. |
| 13.4 | Trigger 429 rate limit (send many rapid requests) | Observe | Backoff state appears: clock icon, "Rate limited — retrying in **10s**". Countdown ticks: 10, 9, 8… |
| 13.5 | Backoff active | Click "Cancel auto-retry" | Countdown stops. Retry button appears instead. |
| 13.6 | Backoff active | Let countdown reach 0 | Auto-retry fires. Request re-sent automatically. |

---

## 14. Coach History Tab

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 14.1 | After some coach conversations | Click "History" tab in Coach panel | History tab opens showing past messages. Each record: role badge (User blue / Coach green), timestamp, hash ID (#XXXXX), message preview (first 150 chars). |
| 14.2 | History visible | Type in search box "sensor" | List filters to records containing "sensor". Non-matching records hidden. |
| 14.3 | History visible | Change role filter dropdown to "User" | Only user messages shown. |
| 14.4 | History visible | Change role filter to "Coach" | Only coach messages shown. |
| 14.5 | History visible | Change role filter to "All" | All messages shown again. |
| 14.6 | History visible | Click checkbox on 2 records | Both records highlighted. "2 selected" count shown. Delete button appears. |
| 14.7 | 2 selected | Click "Select All" checkbox | All records selected. Count updates to total. |
| 14.8 | All selected | Click "Select All" again | All deselected. Count goes to 0. |
| 14.9 | 2 records selected | Click Delete button | ConfirmDialog appears: "Are you sure you want to delete 2 selected records?" with Confirm/Cancel. |
| 14.10 | Confirm dialog open | Click "Cancel" | Dialog closes. Records remain. |
| 14.11 | Confirm dialog open | Click "Confirm" | Dialog closes. 2 records removed from list. |
| 14.12 | History exists | Click Download button | DownloadModal opens: record count shown, format options (JSON / Markdown / Both). |
| 14.13 | Download modal open | Select "JSON" and confirm | `.json` file downloads with structured chat data. |
| 14.14 | Download modal open | Select "Markdown" and confirm | `.md` file downloads with human-readable chat transcript. |
| 14.15 | Download modal open | Select "Both" and confirm | Both `.json` and `.md` files download. |
| 14.16 | History exists | Click "Clear All" button | ConfirmDialog appears: "This will permanently delete all N history records. This cannot be undone." |
| 14.17 | Clear confirm open | Click "Confirm" | All history cleared. Empty state: "No history records yet". |
| 14.18 | User message in history | Click Replay button (↻ icon) on a user record | Message content loaded back into the coach input and re-sent. New conversation starts with that prompt. |

---

## 15. AI Review Panel — Analyze

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 15.1 | Form filled (project, assignee, type, points, summary, description) | Click "Analyze Task" button (💡 lightbulb, blue) | Button shows spinner. AIReviewPanel shows purple spinner + "AI is analyzing…" with cancel button. |
| 15.2 | Analysis streaming | Observe panel | Markdown content streams in. Stream footer: green cursor + "X tok/s". |
| 15.3 | Analysis streaming | Click Cancel button in review panel | Streaming stops. Partial response displayed. Retry button appears. |
| 15.4 | Analysis complete | Observe panel | Full markdown response rendered with: headings, bullet points, code blocks, math (if any). Model badge shows model name. Copy button visible. |
| 15.5 | Analysis complete | Click Copy button | Analysis text copied to clipboard. |
| 15.6 | Analysis complete | Observe TaskForm buttons | "Create JIRA" button appears (green, fade-in transition). "Analyze" and "Deep Review" buttons appear dimmed. |
| 15.7 | Analysis complete | Observe Review Status Bar | Stage advances from "Draft" to "AI Reviewed". Peer review checklist appears. |

---

## 16. AI Review Panel — Deep Review

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 16.1 | Form filled | Click "Deep Review" button (🛡 shield, purple) | Button shows spinner. AIReviewPanel shows loading state. |
| 16.2 | Deep review complete | Observe panel | Perspective tabs appear at top: "All Perspectives", "Safety", "Testability", "Implementability", "Completeness". Full markdown shown. |
| 16.3 | Tabs visible | Click "Safety" tab | Content filters to show only the Safety perspective section. Other sections hidden. |
| 16.4 | Safety tab active | Click "Testability" tab | Content switches to Testability section only. |
| 16.5 | Tab active | Click "All Perspectives" tab | Full content restored — all sections visible. |
| 16.6 | Deep review complete | Observe TaskForm | Same as Analyze: "Create JIRA" appears, status advances. |

---

## 17. Diff View

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 17.1 | Run Analyze once | Observe Diff toggle button | Diff button NOT visible (no previous response to compare). |
| 17.2 | Modify description | Run Analyze again (second time) | Analysis completes. "Diff" toggle button appears in AIReviewPanel header. |
| 17.3 | Diff button visible | Click "Diff" | View switches to diff mode: shows word-level differences between previous and current analysis. Added text highlighted green, removed red. |
| 17.4 | Diff mode active | Click "Normal" (or "Diff" toggle again) | View switches back to normal markdown rendering. |

---

## 18. JIRA Creation Flow

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 18.1 | AI analysis exists | Click "Create JIRA" button (✓ green) | Confirmation modal appears: title "Confirm JIRA Creation", JsonViewer showing the full webhook payload, Cancel and "Create Ticket" buttons. |
| 18.2 | Modal open | Inspect the JSON payload | Payload contains: projectKey, summary, description, issueType, assignee, estimatedPoints, AI analysis data. All values match form inputs. |
| 18.3 | Modal open | Click "Cancel" | Modal closes. No JIRA created. Button still available. |
| 18.4 | Modal open | Click "Create Ticket" | Modal closes. "Create JIRA" button shows spinner. Request sent to webhook (TEST or PROD depending on mode). |
| 18.5 | Modal open | Click the dark overlay behind the modal | Modal closes (same as Cancel). |
| 18.6 | JIRA creation succeeds | Observe | Toast notification: success message. JiraResponsePanel shows response JSON. ProcessingSummary shows score card. Review status advances to "Created". |
| 18.7 | JIRA creation fails | Observe | Toast notification: error message. Error banner appears at top of TaskForm with message. Close button (X) dismisses it. |

---

## 19. JIRA Response Panel

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 19.1 | No JIRA created yet | Observe panel | Empty state: document icon + "Waiting for JIRA creation result…" |
| 19.2 | JIRA creation in progress | Observe | Spinner + "Creating JIRA ticket…" |
| 19.3 | JIRA created successfully | Observe | JsonViewer displays full response JSON (expandable tree). Ticket key visible (e.g., "PROJ-123"). |

---

## 20. Processing Summary

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 20.1 | After successful JIRA creation | Observe | Score card showing: original estimated points (strikethrough) → AI-corrected points (green bold). Subtask count. Clickable JIRA ticket link. |
| 20.2 | Ticket link visible | Click the ticket link | Opens `https://jira.gwm.cn/browse/TICKET-XXX` in a new browser tab. |

---

## 21. Ticket History Panel

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 21.1 | No tickets created | Observe panel | "No tickets created yet" empty state. |
| 21.2 | After creating a JIRA ticket | Observe | New entry appears: blue monospace JIRA key (clickable link), summary (truncated 40 chars), project badge, type badge, relative timestamp ("just now"). |
| 21.3 | Multiple tickets created | Observe | Most recent at top. Up to 20 entries. Older entries show relative times (5m ago, 2h ago, etc.). |
| 21.4 | Ticket entry visible | Click the JIRA key link | Opens ticket in JIRA in new tab. |
| 21.5 | History exists | Click Clear button | All history entries removed. Empty state returns. |

---

## 22. JIRA Search Panel

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 22.1 | Initial state | Observe panel | Search input with placeholder. Search button (magnifying glass). Three quick-action buttons: Duplicates (orange), Parent Reqs (blue), Sprint (green). |
| 22.2 | Empty search input | Click Search button | Button disabled (nothing happens). |
| 22.3 | Type "camera" in search input | Press Enter or click Search | Spinner on button. Search request sent to JIRA webhook. Results appear as cards: key, status, summary, assignee. |
| 22.4 | Search results visible | Click a result card | Emits `selectResult` event (may populate form or show detail). |
| 22.5 | Form has summary filled | Click "Duplicates" quick button | Duplicate check runs against current summary. Results show similarity % badges. High similarity (>70%) highlighted orange with warning. |
| 22.6 | Duplicates found (>70%) | Observe | Orange warning banner: "Potential duplicate tickets detected" with animated appearance. |
| 22.7 | Form has data | Click "Parent Reqs" quick button | Searches for parent requirement candidates. Results shown. |
| 22.8 | Any state | Click "Sprint" quick button | Fetches current sprint/release context. Badge appears: "Sprint: NAME · Release: NAME". |
| 22.9 | Search fails | Observe | Error message displayed below search input. |

---

## 23. Batch Panel

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 23.1 | Initial state | Observe panel | "Batch Operations" header. Count badge "0". Import button (↑), Add Current (+), Clear (×). |
| 23.2 | Form filled | Click "Add Current" (+) button | Current form state snapshotted into batch. Count badge "1". Item card appears: level badge, type, quality score (color-coded), summary text. |
| 23.3 | 1 item in batch | Click "Add Current" again (with modified form) | Count "2". New item card appears. |
| 23.4 | Items in batch | Click Import button (↑) | CSV import area expands: textarea, file picker, Import button. |
| 23.5 | Import area open | Paste CSV: `Summary,Description,Type\n"Fix login bug","User cannot login",Bug` | Text appears in textarea. Import button enabled. |
| 23.6 | CSV pasted | Click "Import" button | Items parsed and added to batch list. Count increases. Toast: "Imported N items". |
| 23.7 | Import area open | Click "Choose File" and select a .csv file | File contents loaded into textarea. |
| 23.8 | Items in batch | Click checkbox on first item | Item selected (highlighted). "1 selected" shown. "Bulk Analyze" button appears. |
| 23.9 | Items in batch | Click "Select All" checkbox | All items selected. Count shows total. |
| 23.10 | Items selected | Click "Bulk Analyze" | First selected item loaded into form, analyze triggered. |
| 23.11 | Item card visible | Click remove button (×) on an item | Item removed from batch. Count decreases. |
| 23.12 | Items in batch | Click Clear (×) in header | All items removed. Count "0". |

---

## 24. Review Dashboard

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 24.1 | No reviews done | Observe panel | Stats: Total Reviews = 0, Approval Rate = 0%, Avg Quality Score = 0. No bar chart. |
| 24.2 | After several AI analyses + approvals | Observe | Total Reviews count updated. Approval rate calculated. Avg quality score shown. Color coding: green ≥80%, orange ≥50%, red <50%. |
| 24.3 | Multiple reviews with failed checks | Observe bar chart | "Top Failed Checks" section: horizontal bars showing most common failure reasons. Bar width proportional to frequency. |
| 24.4 | Stats visible | Click "Clear" button | All stats reset to 0. Bar chart disappears. |

---

## 25. Export Functions

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 25.1 | Form filled (all fields) | Observe Export dropdown button | Gray export icon button visible next to Reset button. |
| 25.2 | Export button | Click the Export button | Dropdown menu appears: "Markdown", "ReqIF", "Excel CSV". |
| 25.3 | Menu open | Click "Markdown" | `.md` file downloads. Open it: contains structured requirement in markdown format with all form fields. |
| 25.4 | Menu open | Click "ReqIF" | `.reqif` (XML) file downloads. Open it: valid OMG ReqIF XML with requirement data. |
| 25.5 | Menu open | Click "Excel CSV" | `.csv` file downloads. Open in Excel/editor: 18 columns covering all form fields, summary parts, traceability, quality score. |
| 25.6 | Form not submittable (missing required fields) | Observe Export button | Export button should NOT be visible (`canSubmit = false`). |

---

## 26. DevTools Panel

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 26.1 | Initial state | Observe DevTools | Multiple collapsible `<details>` sections. All collapsed by default. |
| 26.2 | Expand "Request Payload" | Click section header | JSON tree of last webhook/API request. If no request made yet, may be empty. |
| 26.3 | After coach interaction | Expand "Coach Response (Raw)" | Raw text of last assistant message. Copy button, Expand All / Collapse All buttons. |
| 26.4 | Raw response visible | Click Copy button | Raw text copied to clipboard. |
| 26.5 | Expand "Active Webhook Config" | Observe | Mode indicator: "Production" (green) or "Testing" (orange). Active URL shown in monospace. Config hint text. |
| 26.6 | Toggle TEST → PROD in header | Check DevTools webhook section | URL and mode label update immediately. |
| 26.7 | Expand "Agent State" | Observe | Model name, active role (with color), active skill, skill modified status (Yes/No), streaming status, backoff timers, error state. |
| 26.8 | During coach streaming | Check Agent State | "Coach Streaming: Yes" with tok/s speed. |
| 26.9 | After role change | Check Agent State | "Active Role" updates to new role with correct color. |

---

## 27. LLM Settings Modal

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 27.1 | Any state | Click gear icon in header | Full-screen modal opens with: Provider URL, API Key, Model Name, Coach Skill editor, Analyze Skill editor, Response Format, Template Chips editor, Export/Import. |
| 27.2 | Modal open | Press Escape | Modal closes. |

### 27a. API Configuration

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 27a.1 | Provider URL field | Type "https://my-proxy.com/v1" | URL entered. |
| 27a.2 | API Key field | Type an API key | Password input shows dots. |
| 27a.3 | API Key entered | Click "Test" button | Button changes to "Testing…" (disabled). After response: "Key valid" (green badge + ✓) or "Key invalid" (red badge + ✗ + error message). |
| 27a.4 | Model Name field | Click the input | Datalist dropdown shows model presets (e.g., glm-4.7-flash, gpt-4o, etc.). |
| 27a.5 | Model field | Type "gpt-4o" | Value accepted. |

### 27b. Skill Editors

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 27b.1 | Coach Skill section | Observe | Large textarea with current system prompt. Character + token counter at bottom. |
| 27b.2 | Textarea | Edit the prompt text | "modified" badge appears in section header. Counter updates. |
| 27b.3 | Modified | Click "Reset to Default" | Prompt reverts to built-in default. "modified" badge disappears. |
| 27b.4 | Textarea | Click "Export .md" | `.md` file downloads containing the skill prompt text. |
| 27b.5 | Any state | Click "Import .md" and select a .md file | File content loaded into textarea. |
| 27b.6 | Repeat | Test same for Analyze Skill section | Same behavior: edit, modified badge, reset, import, export. |

### 27c. Response Format

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 27c.1 | Response Format section | Observe | Textarea (160px tall) with current format instructions. Reset button. |
| 27c.2 | Edit text | Modify content | "modified" badge appears. Counter updates. |
| 27c.3 | Modified | Click "Reset" | Reverts to default. |

### 27d. Template Chip Editor

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 27d.1 | Template section | Observe | List of template chips. Each row: icon, bilingual labels, move up/down/delete buttons. |
| 27d.2 | Template row | Click move-up arrow | Template moves up one position. |
| 27d.3 | Template row | Click move-down arrow | Template moves down one position. |
| 27d.4 | Template row | Click delete (×) | Template removed from list. |
| 27d.5 | Template row | Click the row to expand | Edit form appears: icon input, label ZH, label EN, content ZH textarea, content EN textarea. |
| 27d.6 | Edit form open | Modify label and content | Changes reflected in preview. |
| 27d.7 | Bottom of list | Click "+ Add Chip" | New empty template row added at bottom with edit form expanded. |
| 27d.8 | Templates | Click "Export .json" | `.json` file downloads with template definitions. |
| 27d.9 | Templates | Click "Import .json" and select file | Templates loaded from file, replacing current list. |
| 27d.10 | Modified templates | Click "Reset to Defaults" | All templates revert to built-in defaults. |

### 27e. Settings Export / Import

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 27e.1 | Settings configured | Click "Export Settings" | `.json` file downloads with all settings (URL, key, model, skills, templates). |
| 27e.2 | Fresh state | Click "Import Settings" and select the exported file | All settings restored from file. Fields populate. |

### 27f. Save / Cancel

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 27f.1 | Changes made | Click "Save" | Modal closes. Settings persisted to localStorage. LLM calls use new config. |
| 27f.2 | Changes made | Click "Cancel" | Modal closes. Changes discarded. Previous settings remain. |

---

## 28. Hotkey Modal & Keyboard Shortcuts

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 28.1 | Any state (no modal open) | Press `?` key | Hotkey modal opens showing keyboard shortcut table. |
| 28.2 | Modal open | Read table | Shortcuts listed: Ctrl+Enter, Ctrl+Shift+Enter, Ctrl+Shift+C, Ctrl+,, Escape, ?. |
| 28.3 | Modal open | Press Escape | Modal closes. |
| 28.4 | Form filled, no modal | Press Ctrl+Enter | "Writing Guidance" (Coach) triggered — same as clicking the orange button. |
| 28.5 | Form filled, no modal | Press Ctrl+Shift+Enter | "Analyze Task" triggered — same as clicking the blue button. |
| 28.6 | AI analysis exists, no modal | Press Ctrl+Shift+C | "Create JIRA" confirmation modal opens. |
| 28.7 | Any state, no modal | Press Ctrl+, (comma) | LLM Settings modal opens. |

---

## 29. Theme Toggle (Dark / Light)

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 29.1 | Default (dark theme) | Observe | Dark background (#0d1117 range), light text. Moon icon in header. |
| 29.2 | Dark theme | Click theme toggle button (moon → sun) | Entire UI switches to light theme: white/light gray backgrounds, dark text. All panels, modals, dropdowns respect light colors. Button icon changes to sun. |
| 29.3 | Light theme | Click theme toggle (sun → moon) | Reverts to dark theme. |
| 29.4 | Set to light theme | Refresh the page | Theme persists as light (localStorage). |

---

## 30. i18n — Bilingual (EN / ZH)

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 30.1 | Language = EN | Inspect all major UI elements | All labels in English: "Writing Guidance", "Analyze Task", "Deep Review", "Create JIRA", "Quality Score", "Requirement Level", etc. |
| 30.2 | Switch to ZH | Inspect all major UI elements | All labels in Chinese: buttons, section titles, placeholders, tooltips, quality labels, INCOSE messages, ASPICE suggestions. |
| 30.3 | ZH mode | Fill form with Chinese text: "横向加速度$a_y$的估计值" | Description renders correctly. Math delimiters work adjacent to Chinese characters (no space needed). INCOSE checks work on Chinese text. |
| 30.4 | ZH mode | Run Coach | Coach response in Chinese. Markdown + math render correctly with Chinese text. |
| 30.5 | ZH mode | Run Analyze | Analysis response rendered. Chinese headings, bullets, code blocks all display correctly. |
| 30.6 | ZH mode | Check domain warnings | Warnings display in Chinese. |
| 30.7 | ZH mode | Check traceability gaps | Gap messages in Chinese. |
| 30.8 | Switch back to EN mid-session | Observe | All labels switch to English. Existing chat messages stay in their original language (content doesn't change, only UI chrome). |

---

## 31. Draft Persistence (localStorage)

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 31.1 | Empty form | Fill in: project, assignee, type, 5 summary parts, description, points | All fields populated. |
| 31.2 | Form filled | Close the browser tab | — |
| 31.3 | — | Open the app again (`localhost:5173`) | All previously entered values restored: project, assignee, type, summary fields, description, points. Quality score recalculated. |
| 31.4 | Restored form | Click Reset button (circular arrow) | All fields cleared. Fresh empty state. |
| 31.5 | After reset | Refresh the page | Form stays empty (reset clears localStorage draft). |

---

## 32. Form Reset

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 32.1 | Form fully filled, analysis done | Click Reset button (↻ circular arrow, red) | All form fields cleared: project, assignee, type, summary parts, description, points. Quality score = 0%. Review status back to "Draft". AI response cleared. "Create JIRA" button disappears. |
| 32.2 | During coach streaming | Observe Reset button | Icon changes to stop-square with pulsing animation. |
| 32.3 | Coach streaming | Click Reset (stop icon) | Coach stream cancelled. Partial response preserved. Icon reverts to circular arrow. |

---

## 33. Skill Auto-Detection

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 33.1 | Coach Skill = ON | Type a description related to a specific skill keyword | When triggering Coach, an "Active Skill" chip may appear in Coach panel header showing the matched skill name with colored background. |
| 33.2 | Skill chip visible | Click dismiss (×) on the chip | Chip disappears. `ignoredSkillId` set — that skill won't auto-match again until chat is cleared. |
| 33.3 | Different description | Trigger Coach with different content | Different skill may auto-match, or no skill if no keywords match. |

---

## 34. Accessibility & Keyboard Nav

| # | Input | Action | Expected Output |
|---|-------|--------|-----------------|
| 34.1 | Any state | Press Tab repeatedly | Focus moves through interactive elements in logical order. Focus ring visible on each element. |
| 34.2 | LLM Settings modal open | Press Tab | Focus stays trapped within the modal (does not escape to background elements). |
| 34.3 | Hotkey modal open | Press Tab | Focus trapped within modal. |
| 34.4 | Assignee combobox open | Press ↑↓ arrow keys | Highlighted item moves up/down. |
| 34.5 | Assignee combobox | Press Enter | Highlighted item selected. Dropdown closes. |
| 34.6 | Story points buttons | Press ← → arrow keys | Focus moves between Fibonacci buttons (roving tabindex). |
| 34.7 | Role selector buttons | Press ← → arrow keys | Focus moves between role buttons. |
| 34.8 | ConfirmDialog open | Press Escape | Dialog closes (Cancel action). |

---

## Quick Smoke Test Checklist

For a fast end-to-end pass, complete these steps in order:

| Step | Action | Pass? |
|------|--------|-------|
| 1 | Launch app, verify 3-column layout loads | ☐ |
| 2 | Switch language EN → ZH → EN | ☐ |
| 3 | Switch role SYS → SW → VV | ☐ |
| 4 | Toggle theme dark → light → dark | ☐ |
| 5 | Select project, assignee, type, points | ☐ |
| 6 | Fill all 5 summary fields, verify preview | ☐ |
| 7 | Type description (50+ words), verify counters | ☐ |
| 8 | Verify quality score > 60% | ☐ |
| 9 | Set requirement level, parent, verification | ☐ |
| 10 | Click "Writing Guidance" → coach streams | ☐ |
| 11 | Click "Analyze Task" → analysis streams | ☐ |
| 12 | Complete peer review checklist → Approve | ☐ |
| 13 | Click "Create JIRA" → confirm → success | ☐ |
| 14 | Verify ticket in Ticket History panel | ☐ |
| 15 | Export as Markdown | ☐ |
| 16 | Open Settings (Ctrl+,) → verify fields → Cancel | ☐ |
| 17 | Press ? → hotkey modal opens → Escape closes | ☐ |
| 18 | Refresh page → draft restored | ☐ |
| 19 | Reset form → all fields cleared | ☐ |
| 20 | Check DevTools → Agent State is accurate | ☐ |

---

*Generated for AGec v10.9 — 2026-03-22*
