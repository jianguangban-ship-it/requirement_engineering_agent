import { describe, it, expect } from 'vitest'
import { matchSkill } from '../skillMatcher'
import type { SkillEntry } from '@/config/skills/registry'

const coach: SkillEntry = {
  id: 'coach',
  name: 'Design Coach',
  keywords: ['review', 'improve', 'suggest', 'help', 'jira', 'ticket', 'description', '审阅', '改进', '建议'],
  systemPrompt: 'coach prompt'
}

const analyze: SkillEntry = {
  id: 'analyze',
  name: 'Task Analysis',
  keywords: ['analyze', 'analysis', 'evaluate', 'assess', 'score', 'quality', 'check', '分析', '评估', '质量'],
  systemPrompt: 'analyze prompt'
}

const uiux: SkillEntry = {
  id: 'ui-ux-pro-max',
  name: 'UI/UX Pro Max',
  keywords: ['ui', 'ux', 'component', 'button', 'modal', 'design', 'layout', 'style', 'color'],
  systemPrompt: 'uiux prompt'
}

const zhOnly: SkillEntry = {
  id: 'zh-skill',
  name: 'ZH Only',
  keywords: ['测试', '专属'],
  systemPrompt: 'zh prompt',
  lang: 'zh'
}

const registry = [coach, analyze, uiux, zhOnly]

describe('matchSkill', () => {
  it('matches skill with 3 keyword hits', () => {
    const result = matchSkill('help me review my jira ticket description', registry, 'en')
    expect(result).toBe(coach)
  })

  it('returns null when only 1 keyword matches (below threshold)', () => {
    const result = matchSkill('button', registry, 'en')
    expect(result).toBeNull()
  })

  it('returns null when no keywords match', () => {
    const result = matchSkill('what do you think?', registry, 'en')
    expect(result).toBeNull()
  })

  it('picks the highest scoring skill on tie-break (first in registry)', () => {
    // "help" hits coach, "check quality" hits analyze (2 each) — coach is first
    const result = matchSkill('help check quality', registry, 'en')
    // coach: help (1), analyze: check + quality (2) → analyze wins
    expect(result).toBe(analyze)
  })

  it('matches ui-ux skill with multiple UI keywords', () => {
    const result = matchSkill('help me design a UI button component', registry, 'en')
    // uiux: ui + component + button + design = 4
    expect(result).toBe(uiux)
  })

  it('matches Chinese message via substring scan', () => {
    const result = matchSkill('帮我审阅一下这个描述并给出改进建议', registry, 'zh')
    // coach: 审阅 + 改进 + 建议 = 3
    expect(result).toBe(coach)
  })

  it('matches Chinese analyze keywords', () => {
    const result = matchSkill('请分析一下质量评估结果', registry, 'zh')
    // analyze: 分析 + 质量 + 评估 = 3
    expect(result).toBe(analyze)
  })

  it('skips lang-filtered skill when lang does not match', () => {
    const result = matchSkill('测试专属功能', registry, 'en')
    // zhOnly has lang: 'zh', should be skipped for 'en'
    expect(result).toBeNull()
  })

  it('matches lang-filtered skill when lang matches', () => {
    const result = matchSkill('这是测试专属功能', registry, 'zh')
    expect(result).toBe(zhOnly)
  })

  it('is case insensitive', () => {
    const result = matchSkill('REVIEW my JIRA DESCRIPTION', registry, 'en')
    expect(result).toBe(coach)
  })

  it('returns null for empty message', () => {
    const result = matchSkill('', registry, 'en')
    expect(result).toBeNull()
  })
})
