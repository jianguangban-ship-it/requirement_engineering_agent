import type { UserRole } from '@/composables/useRole'

/**
 * Elicitation questions — structured questions the AI asks
 * to help users think through requirements before writing them.
 * Questions adapt based on selected role.
 */

export interface ElicitationQuestion {
  questionEn: string
  questionZh: string
  /** Why this question matters */
  hintEn: string
  hintZh: string
}

export interface ElicitationSet {
  titleEn: string
  titleZh: string
  questions: ElicitationQuestion[]
}

const COMMON_QUESTIONS: ElicitationQuestion[] = [
  {
    questionEn: 'What system-level function does this requirement support?',
    questionZh: '这条需求支持哪个系统级功能？',
    hintEn: 'Establishes traceability to higher-level requirements',
    hintZh: '建立与上级需求的追溯关系'
  },
  {
    questionEn: 'What happens if this requirement is not met? What is the impact?',
    questionZh: '如果不满足这条需求，会发生什么？影响是什么？',
    hintEn: 'Identifies safety relevance and priority',
    hintZh: '识别安全相关性和优先级'
  },
  {
    questionEn: 'How will you verify this? (test / analysis / review / demonstration)',
    questionZh: '如何验证这条需求？（测试/分析/评审/演示）',
    hintEn: 'Ensures requirement is verifiable',
    hintZh: '确保需求可验证'
  },
  {
    questionEn: 'Are there timing or performance constraints?',
    questionZh: '是否有时序或性能约束？',
    hintEn: 'Captures non-functional requirements',
    hintZh: '获取非功能需求'
  }
]

const ROLE_QUESTIONS: Record<UserRole, ElicitationQuestion[]> = {
  'system-architect': [
    {
      questionEn: 'Which subsystems or components are affected by this requirement?',
      questionZh: '哪些子系统或组件受此需求影响？',
      hintEn: 'Identifies decomposition scope',
      hintZh: '确定分解范围'
    },
    {
      questionEn: 'What is the ASIL level? Is ASIL decomposition needed between HW and SW?',
      questionZh: 'ASIL等级是什么？是否需要在硬件和软件之间进行ASIL分解？',
      hintEn: 'ISO 26262 safety classification',
      hintZh: 'ISO 26262 安全分级'
    },
    {
      questionEn: 'What interfaces does this requirement define or depend on?',
      questionZh: '这条需求定义或依赖哪些接口？',
      hintEn: 'Captures interface dependencies early',
      hintZh: '尽早获取接口依赖'
    },
    {
      questionEn: 'What are the environmental or operating conditions?',
      questionZh: '环境或运行条件是什么？',
      hintEn: 'Temperature, voltage, vehicle states',
      hintZh: '温度、电压、车辆状态'
    }
  ],
  'sw-developer': [
    {
      questionEn: 'What are the exact input/output specifications?',
      questionZh: '确切的输入/输出规格是什么？',
      hintEn: 'Precise I/O prevents ambiguity',
      hintZh: '精确的I/O防止歧义'
    },
    {
      questionEn: 'What error scenarios should be handled? What is the fallback behavior?',
      questionZh: '需要处理哪些错误场景？降级行为是什么？',
      hintEn: 'Defensive programming requirements',
      hintZh: '防御性编程需求'
    },
    {
      questionEn: 'What are the acceptance criteria (AC)? List specific pass/fail conditions.',
      questionZh: '验收标准（AC）是什么？列出具体的通过/失败条件。',
      hintEn: 'INCOSE verifiability',
      hintZh: 'INCOSE 可验证性'
    },
    {
      questionEn: 'Does this require an API contract change or new interface?',
      questionZh: '是否需要更改API契约或新增接口？',
      hintEn: 'Integration impact assessment',
      hintZh: '集成影响评估'
    }
  ],
  'hw-designer': [
    {
      questionEn: 'What are the electrical specifications? (voltage, current, frequency)',
      questionZh: '电气规格是什么？（电压、电流、频率）',
      hintEn: 'Quantitative HW constraints',
      hintZh: '量化硬件约束'
    },
    {
      questionEn: 'Which communication protocol is used? (CAN/LIN/SPI/Ethernet)',
      questionZh: '使用哪种通信协议？（CAN/LIN/SPI/以太网）',
      hintEn: 'Protocol-level requirements',
      hintZh: '协议层需求'
    },
    {
      questionEn: 'What are the resource constraints? (memory, CPU load, pin count)',
      questionZh: '资源约束是什么？（内存、CPU负载、引脚数）',
      hintEn: 'Hardware resource budgeting',
      hintZh: '硬件资源预算'
    },
    {
      questionEn: 'What diagnostic coverage is required for this HW function?',
      questionZh: '此硬件功能需要什么诊断覆盖率？',
      hintEn: 'ISO 26262 HW metrics (SPFM, LFM)',
      hintZh: 'ISO 26262 硬件指标（SPFM、LFM）'
    }
  ],
  'me-designer': [
    {
      questionEn: 'What are the mechanical packaging constraints? (dimensions, weight, mounting)',
      questionZh: '机械封装约束是什么？（尺寸、重量、安装方式）',
      hintEn: 'Physical design boundaries',
      hintZh: '物理设计边界'
    },
    {
      questionEn: 'What thermal requirements apply? (operating temp range, dissipation)',
      questionZh: '适用什么热管理需求？（工作温度范围、散热）',
      hintEn: 'Thermal design constraints',
      hintZh: '热设计约束'
    },
    {
      questionEn: 'What IP protection rating is required?',
      questionZh: '需要什么IP防护等级？',
      hintEn: 'Environmental protection',
      hintZh: '环境防护'
    },
    {
      questionEn: 'What vibration and shock resistance is needed?',
      questionZh: '需要什么抗振动和冲击能力？',
      hintEn: 'Mechanical durability',
      hintZh: '机械耐久性'
    }
  ],
  'vv-engineer': [
    {
      questionEn: 'What verification method will you use? (Test/Analysis/Review/Simulation/Demo)',
      questionZh: '将使用什么验证方法？（测试/分析/评审/仿真/演示）',
      hintEn: 'ISO 26262 verification methods',
      hintZh: 'ISO 26262 验证方法'
    },
    {
      questionEn: 'What test environment is needed? (HIL/SIL/MIL/bench/vehicle)',
      questionZh: '需要什么测试环境？（HIL/SIL/MIL/台架/实车）',
      hintEn: 'Test infrastructure planning',
      hintZh: '测试基础设施规划'
    },
    {
      questionEn: 'What are the exact pass/fail criteria with measurable thresholds?',
      questionZh: '带有可度量阈值的确切通过/失败标准是什么？',
      hintEn: 'INCOSE verifiability requirement',
      hintZh: 'INCOSE 可验证性要求'
    },
    {
      questionEn: 'What preconditions must be met before testing?',
      questionZh: '测试前必须满足什么前置条件？',
      hintEn: 'Test setup requirements',
      hintZh: '测试设置要求'
    }
  ]
}

/** Get the full elicitation question set for a role */
export function getElicitationSet(role: UserRole, lang: 'zh' | 'en'): ElicitationSet {
  const roleQs = ROLE_QUESTIONS[role]
  const allQuestions = [...COMMON_QUESTIONS, ...roleQs]

  return {
    titleEn: 'Requirement Elicitation',
    titleZh: '需求引导',
    questions: allQuestions
  }
}

/** Build elicitation prompt text for the LLM */
export function buildElicitationPrompt(role: UserRole, lang: 'zh' | 'en'): string {
  const set = getElicitationSet(role, lang)
  const lines: string[] = []

  if (lang === 'zh') {
    lines.push('请作为需求引导教练，逐一向用户提出以下问题，帮助他们在开始撰写需求之前理清思路。每次只问一个问题，等待用户回答后再继续下一个。根据用户的回答，追问细节或跳过不相关的问题。最后，基于所有回答，帮助用户起草一条完整的需求描述。')
    lines.push('')
    lines.push('## 引导问题')
    for (let i = 0; i < set.questions.length; i++) {
      const q = set.questions[i]
      lines.push(`${i + 1}. ${q.questionZh}`)
      lines.push(`   _（${q.hintZh}）_`)
    }
    lines.push('')
    lines.push('先从第一个问题开始。保持友好专业的语气。')
  } else {
    lines.push('Act as a Requirement Elicitation Coach. Ask the user the following questions one at a time to help them clarify their thinking before writing the requirement. Wait for their answer before moving to the next question. Based on their answers, probe for details or skip irrelevant questions. At the end, help draft a complete requirement description based on all answers.')
    lines.push('')
    lines.push('## Elicitation Questions')
    for (let i = 0; i < set.questions.length; i++) {
      const q = set.questions[i]
      lines.push(`${i + 1}. ${q.questionEn}`)
      lines.push(`   _(${q.hintEn})_`)
    }
    lines.push('')
    lines.push('Start with the first question. Use a friendly, professional tone.')
  }

  return lines.join('\n')
}
