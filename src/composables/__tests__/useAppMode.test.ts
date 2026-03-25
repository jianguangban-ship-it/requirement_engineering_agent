import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock only the named module-level exports that useAppMode actually imports
vi.mock('@/composables/useLLM', () => ({
  setCoachSkillEnabled: vi.fn(),
  setTaskCoachEnabled: vi.fn()
}))

const storage: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (k: string) => storage[k] ?? null,
  setItem: (k: string, v: string) => { storage[k] = v },
  removeItem: (k: string) => { delete storage[k] }
})

import { appMode, setMode, applyModeFlags } from '../useAppMode'
import { setCoachSkillEnabled, setTaskCoachEnabled } from '@/composables/useLLM'

describe('useAppMode', () => {
  beforeEach(() => {
    Object.keys(storage).forEach(k => delete storage[k])
    vi.clearAllMocks()
  })

  it('defaults to "design" when no localStorage value', () => {
    expect(['explore', 'design', 'task']).toContain(appMode.value)
  })

  it('setMode("explore") sets appMode and persists to localStorage', () => {
    setMode('explore')
    expect(appMode.value).toBe('explore')
    expect(storage['app-mode']).toBe('explore')
  })

  it('setMode("task") sets appMode and persists to localStorage', () => {
    setMode('task')
    expect(appMode.value).toBe('task')
    expect(storage['app-mode']).toBe('task')
  })

  it('setMode("design") sets appMode and persists to localStorage', () => {
    setMode('design')
    expect(appMode.value).toBe('design')
    expect(storage['app-mode']).toBe('design')
  })

  it('applyModeFlags explore → coachSkillEnabled=false, taskCoachEnabled=false', () => {
    applyModeFlags('explore')
    expect(setCoachSkillEnabled).toHaveBeenCalledWith(false)
    expect(setTaskCoachEnabled).toHaveBeenCalledWith(false)
  })

  it('applyModeFlags design → coachSkillEnabled=true, taskCoachEnabled=true', () => {
    applyModeFlags('design')
    expect(setCoachSkillEnabled).toHaveBeenCalledWith(true)
    expect(setTaskCoachEnabled).toHaveBeenCalledWith(true)
  })

  it('applyModeFlags task → coachSkillEnabled=true, taskCoachEnabled=true', () => {
    applyModeFlags('task')
    expect(setCoachSkillEnabled).toHaveBeenCalledWith(true)
    expect(setTaskCoachEnabled).toHaveBeenCalledWith(true)
  })

  it('setMode calls applyModeFlags (flags are set)', () => {
    setMode('explore')
    expect(setCoachSkillEnabled).toHaveBeenCalledWith(false)
    setMode('design')
    expect(setCoachSkillEnabled).toHaveBeenCalledWith(true)
  })
})
