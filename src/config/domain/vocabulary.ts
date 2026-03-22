import type { UserRole } from '@/composables/useRole'

/**
 * Domain vocabulary — automotive engineering standard terms.
 * Used to inject domain context into LLM system prompts and
 * to detect missing domain terms in descriptions.
 */

export interface DomainTerm {
  term: string
  abbr?: string
  zh: string
  descEn: string
  descZh: string
  roles: UserRole[]
}

// ─── Core automotive terms ──────────────────────────────────────────────────

export const DOMAIN_VOCABULARY: DomainTerm[] = [
  // Safety & compliance
  {
    term: 'ASIL', abbr: 'ASIL',
    zh: '汽车安全完整性等级',
    descEn: 'Automotive Safety Integrity Level (A–D) per ISO 26262',
    descZh: '汽车安全完整性等级（A–D），依据 ISO 26262',
    roles: ['system-architect', 'sw-developer', 'hw-designer', 'vv-engineer']
  },
  {
    term: 'FMEA', abbr: 'FMEA',
    zh: '失效模式与影响分析',
    descEn: 'Failure Mode and Effects Analysis',
    descZh: '失效模式与影响分析',
    roles: ['system-architect', 'hw-designer', 'me-designer', 'vv-engineer']
  },
  {
    term: 'FTA', abbr: 'FTA',
    zh: '故障树分析',
    descEn: 'Fault Tree Analysis',
    descZh: '故障树分析',
    roles: ['system-architect', 'vv-engineer']
  },
  {
    term: 'SOTIF', abbr: 'SOTIF',
    zh: '预期功能安全',
    descEn: 'Safety Of The Intended Functionality (ISO 21448)',
    descZh: '预期功能安全（ISO 21448）',
    roles: ['system-architect', 'sw-developer', 'vv-engineer']
  },
  {
    term: 'HARA', abbr: 'HARA',
    zh: '危害分析与风险评估',
    descEn: 'Hazard Analysis and Risk Assessment',
    descZh: '危害分析与风险评估',
    roles: ['system-architect', 'vv-engineer']
  },
  // ECU / Hardware
  {
    term: 'ECU', abbr: 'ECU',
    zh: '电子控制单元',
    descEn: 'Electronic Control Unit',
    descZh: '电子控制单元',
    roles: ['system-architect', 'sw-developer', 'hw-designer', 'me-designer']
  },
  {
    term: 'MCU', abbr: 'MCU',
    zh: '微控制器',
    descEn: 'Microcontroller Unit',
    descZh: '微控制器',
    roles: ['sw-developer', 'hw-designer']
  },
  {
    term: 'SoC', abbr: 'SoC',
    zh: '片上系统',
    descEn: 'System on Chip',
    descZh: '片上系统',
    roles: ['sw-developer', 'hw-designer']
  },
  // Communication protocols
  {
    term: 'CAN', abbr: 'CAN',
    zh: '控制器局域网',
    descEn: 'Controller Area Network bus protocol',
    descZh: '控制器局域网总线协议',
    roles: ['system-architect', 'sw-developer', 'hw-designer']
  },
  {
    term: 'LIN', abbr: 'LIN',
    zh: '本地互联网络',
    descEn: 'Local Interconnect Network protocol',
    descZh: '本地互联网络协议',
    roles: ['system-architect', 'sw-developer', 'hw-designer']
  },
  {
    term: 'Ethernet', abbr: undefined,
    zh: '以太网',
    descEn: 'Automotive Ethernet (100BASE-T1 / 1000BASE-T1)',
    descZh: '车载以太网（100BASE-T1 / 1000BASE-T1）',
    roles: ['system-architect', 'sw-developer', 'hw-designer']
  },
  {
    term: 'SOME/IP', abbr: 'SOME/IP',
    zh: '可扩展面向服务的中间件',
    descEn: 'Scalable service-Oriented MiddlewarE over IP',
    descZh: '基于 IP 的可扩展面向服务中间件',
    roles: ['system-architect', 'sw-developer']
  },
  // Software architecture
  {
    term: 'AUTOSAR', abbr: 'AUTOSAR',
    zh: '汽车开放系统架构',
    descEn: 'AUTomotive Open System ARchitecture',
    descZh: '汽车开放系统架构',
    roles: ['system-architect', 'sw-developer']
  },
  {
    term: 'BSW', abbr: 'BSW',
    zh: '基础软件',
    descEn: 'Basic Software layer (AUTOSAR)',
    descZh: '基础软件层（AUTOSAR）',
    roles: ['sw-developer']
  },
  {
    term: 'SWC', abbr: 'SWC',
    zh: '软件组件',
    descEn: 'Software Component (AUTOSAR)',
    descZh: '软件组件（AUTOSAR）',
    roles: ['sw-developer']
  },
  {
    term: 'RTE', abbr: 'RTE',
    zh: '运行时环境',
    descEn: 'Runtime Environment (AUTOSAR)',
    descZh: '运行时环境（AUTOSAR）',
    roles: ['sw-developer']
  },
  // Testing & verification
  {
    term: 'HIL', abbr: 'HIL',
    zh: '硬件在环',
    descEn: 'Hardware-in-the-Loop testing',
    descZh: '硬件在环测试',
    roles: ['system-architect', 'sw-developer', 'vv-engineer']
  },
  {
    term: 'SIL', abbr: 'SIL',
    zh: '软件在环',
    descEn: 'Software-in-the-Loop testing',
    descZh: '软件在环测试',
    roles: ['sw-developer', 'vv-engineer']
  },
  {
    term: 'MIL', abbr: 'MIL',
    zh: '模型在环',
    descEn: 'Model-in-the-Loop testing',
    descZh: '模型在环测试',
    roles: ['system-architect', 'vv-engineer']
  },
  // Calibration & diagnostics
  {
    term: 'Calibration', abbr: undefined,
    zh: '标定',
    descEn: 'Parameter calibration / tuning of ECU software',
    descZh: 'ECU 软件参数标定/调优',
    roles: ['sw-developer', 'vv-engineer']
  },
  {
    term: 'UDS', abbr: 'UDS',
    zh: '统一诊断服务',
    descEn: 'Unified Diagnostic Services (ISO 14229)',
    descZh: '统一诊断服务（ISO 14229）',
    roles: ['sw-developer', 'vv-engineer']
  },
  {
    term: 'DTC', abbr: 'DTC',
    zh: '诊断故障码',
    descEn: 'Diagnostic Trouble Code',
    descZh: '诊断故障码',
    roles: ['sw-developer', 'vv-engineer']
  },
  {
    term: 'OBD', abbr: 'OBD',
    zh: '车载诊断',
    descEn: 'On-Board Diagnostics',
    descZh: '车载诊断',
    roles: ['sw-developer', 'vv-engineer']
  },
  // Mechanical / environmental
  {
    term: 'IP Rating', abbr: 'IP',
    zh: '防护等级',
    descEn: 'Ingress Protection rating (IEC 60529)',
    descZh: '防护等级（IEC 60529）',
    roles: ['hw-designer', 'me-designer']
  },
  {
    term: 'EMC', abbr: 'EMC',
    zh: '电磁兼容',
    descEn: 'Electromagnetic Compatibility',
    descZh: '电磁兼容',
    roles: ['hw-designer', 'me-designer']
  },
  {
    term: 'DFM', abbr: 'DFM',
    zh: '面向制造设计',
    descEn: 'Design for Manufacturing',
    descZh: '面向制造的设计',
    roles: ['me-designer']
  },
  {
    term: 'DFMEA', abbr: 'DFMEA',
    zh: '设计失效模式与影响分析',
    descEn: 'Design Failure Mode and Effects Analysis',
    descZh: '设计失效模式与影响分析',
    roles: ['me-designer', 'hw-designer']
  },
  // Process
  {
    term: 'SOP', abbr: 'SOP',
    zh: '量产启动',
    descEn: 'Start of Production',
    descZh: '量产启动',
    roles: ['system-architect', 'sw-developer', 'hw-designer', 'me-designer', 'vv-engineer']
  },
  {
    term: 'EOL', abbr: 'EOL',
    zh: '下线检测',
    descEn: 'End of Line testing',
    descZh: '下线检测',
    roles: ['hw-designer', 'vv-engineer']
  },
  {
    term: 'OTA', abbr: 'OTA',
    zh: '空中升级',
    descEn: 'Over-the-Air software update',
    descZh: '空中升级（远程软件更新）',
    roles: ['system-architect', 'sw-developer']
  }
]

/** Get domain terms relevant to a specific role */
export function getTermsForRole(role: UserRole): DomainTerm[] {
  return DOMAIN_VOCABULARY.filter(t => t.roles.includes(role))
}
