import coachSkillDefault from './coach-skill.md?raw'
import analyzeSkillDefault from './analyze-skill.md?raw'

const LS_KEY_COACH_SKILL = 'coach-skill'
const LS_KEY_ANALYZE_SKILL = 'analyze-skill'

function applyLang(raw: string, lang: 'zh' | 'en'): string {
  return raw.replace(/\{lang\}/g, lang)
}

export function getCoachSkill(lang: 'zh' | 'en'): string {
  return applyLang(localStorage.getItem(LS_KEY_COACH_SKILL) || coachSkillDefault, lang)
}

export function getAnalyzeSkill(lang: 'zh' | 'en'): string {
  return applyLang(localStorage.getItem(LS_KEY_ANALYZE_SKILL) || analyzeSkillDefault, lang)
}

export function setCoachSkill(content: string): void {
  localStorage.setItem(LS_KEY_COACH_SKILL, content)
}

export function setAnalyzeSkill(content: string): void {
  localStorage.setItem(LS_KEY_ANALYZE_SKILL, content)
}

export function resetCoachSkill(): void {
  localStorage.removeItem(LS_KEY_COACH_SKILL)
}

export function resetAnalyzeSkill(): void {
  localStorage.removeItem(LS_KEY_ANALYZE_SKILL)
}

export { coachSkillDefault, analyzeSkillDefault }
