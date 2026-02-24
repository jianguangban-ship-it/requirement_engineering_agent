import { ref } from 'vue'
import coachSkillDefault from './coach-skill.md?raw'
import coachSkillZh from './coach-skill-zh.md?raw'
import coachSkillEn from './coach-skill-en.md?raw'
import analyzeSkillDefault from './analyze-skill.md?raw'
import analyzeSkillZh from './analyze-skill-zh.md?raw'
import analyzeSkillEn from './analyze-skill-en.md?raw'

const LS_KEY_COACH_SKILL = 'coach-skill'
const LS_KEY_ANALYZE_SKILL = 'analyze-skill'

/** Reactive flags — true when a localStorage override is active */
export const coachSkillModified = ref(localStorage.getItem(LS_KEY_COACH_SKILL) !== null)
export const analyzeSkillModified = ref(localStorage.getItem(LS_KEY_ANALYZE_SKILL) !== null)

/** Get lang-specific bundled default (no {lang} substitution needed) */
export function getCoachSkillDefault(lang: 'zh' | 'en'): string {
  return lang === 'zh' ? coachSkillZh : coachSkillEn
}

export function getAnalyzeSkillDefault(lang: 'zh' | 'en'): string {
  return lang === 'zh' ? analyzeSkillZh : analyzeSkillEn
}

/** Get effective skill — localStorage override first, then lang-specific bundled default */
export function getCoachSkill(lang: 'zh' | 'en'): string {
  return localStorage.getItem(LS_KEY_COACH_SKILL) ?? getCoachSkillDefault(lang)
}

export function getAnalyzeSkill(lang: 'zh' | 'en'): string {
  return localStorage.getItem(LS_KEY_ANALYZE_SKILL) ?? getAnalyzeSkillDefault(lang)
}

export function setCoachSkill(content: string): void {
  localStorage.setItem(LS_KEY_COACH_SKILL, content)
  coachSkillModified.value = true
}

export function setAnalyzeSkill(content: string): void {
  localStorage.setItem(LS_KEY_ANALYZE_SKILL, content)
  analyzeSkillModified.value = true
}

export function resetCoachSkill(): void {
  localStorage.removeItem(LS_KEY_COACH_SKILL)
  coachSkillModified.value = false
}

export function resetAnalyzeSkill(): void {
  localStorage.removeItem(LS_KEY_ANALYZE_SKILL)
  analyzeSkillModified.value = false
}

// Legacy exports kept for backward compatibility
export { coachSkillDefault, analyzeSkillDefault }
