import { ref } from 'vue'
import { setCoachSkillEnabled, setTaskCoachEnabled } from '@/composables/useLLM'

export type AppMode = 'explore' | 'design' | 'task'

const LS_KEY_MODE = 'app-mode'

const validModes: AppMode[] = ['explore', 'design', 'task']

/** Drive coachSkillEnabled + taskCoachEnabled from the current mode. */
export function applyModeFlags(mode: AppMode): void {
  if (mode === 'explore') {
    setCoachSkillEnabled(false)
    setTaskCoachEnabled(false)
  } else {
    // design + task: skill ON, task-coach ON
    setCoachSkillEnabled(true)
    setTaskCoachEnabled(true)
  }
}

const stored = localStorage.getItem(LS_KEY_MODE) as AppMode | null
const initial: AppMode = stored && validModes.includes(stored) ? stored : 'design'

export const appMode = ref<AppMode>(initial)

// Apply flags on startup so coachSkillEnabled/taskCoachEnabled match the restored mode
applyModeFlags(initial)

/**
 * Switch to a new mode. Sets appMode and drives skill flags.
 * Cleanup (resetForm, resetWorkflow, clearAnalyzeResponse) is handled
 * by a watch(appMode) in App.vue — those instances are owned there.
 */
export function setMode(mode: AppMode): void {
  appMode.value = mode
  localStorage.setItem(LS_KEY_MODE, mode)
  applyModeFlags(mode)
}
