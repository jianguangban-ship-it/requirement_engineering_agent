import type { SkillEntry } from '@/config/skills/registry'

const MATCH_THRESHOLD = 2

/**
 * Match a user message to the best skill in the registry.
 * Returns null if no skill scores >= threshold (2 keyword hits).
 * Pure substring scan — works for both EN and ZH without tokenization.
 */
export function matchSkill(
  message: string,
  registry: SkillEntry[],
  lang: 'zh' | 'en'
): SkillEntry | null {
  const lower = message.toLowerCase()
  let best: SkillEntry | null = null
  let bestScore = MATCH_THRESHOLD - 1 // must beat threshold

  for (const skill of registry) {
    if (skill.lang && skill.lang !== 'both' && skill.lang !== lang) continue
    const score = skill.keywords.filter(kw => lower.includes(kw)).length
    if (score > bestScore) {
      best = skill
      bestScore = score
    }
  }

  return best
}
