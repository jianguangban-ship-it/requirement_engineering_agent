import { reactive, ref, computed, watch } from 'vue'
import type { FormState, SummaryState } from '@/types/form'
import type { ProjectKey } from '@/types/team'
import { PROJECT_CONFIG } from '@/config/projects'
import { DEFAULT_COMPONENT_HISTORY } from '@/config/constants'
import { useI18n } from '@/i18n'
import { currentRole, setRole } from '@/composables/useRole'
import type { UserRole } from '@/composables/useRole'
import { checkDomainWarnings, getAspiceProfile, checkIncoseRules, incoseScorePenalty, detectAssumptions, getDefaultLevel, checkTraceabilityGaps } from '@/config/domain'
import type { DomainWarning, AspiceProfile, IncoseViolation, Assumption, TraceabilityGap } from '@/config/domain'

const DRAFT_KEY = 'jira-workstation-draft'

export function useForm() {
  const { t, isZh } = useI18n()

  const form = reactive<FormState>({
    projectKey: '',
    issueType: '',
    assignee: '',
    estimatedPoints: 0,
    description: '',
    requirementLevel: 'none',
    parentReqId: '',
    verificationMethod: ''
  })

  const summary = reactive<SummaryState>({
    vehicle: '',
    product: '',
    layer: '',
    component: '',
    detail: ''
  })

  const componentHistory = ref<string[]>([...DEFAULT_COMPONENT_HISTORY])

  // Computed summary string
  const computedSummary = computed(() => {
    const parts = [
      summary.vehicle,
      summary.product,
      summary.layer,
      summary.component,
      summary.detail
    ]
    const filled = parts.filter(p => p)
    if (filled.length === 0) return ''
    return parts.map(p => `[${p || '...'}]`).join('')
  })

  // Can submit check
  const canSubmit = computed(() => {
    return !!(
      form.projectKey &&
      form.issueType &&
      form.assignee &&
      form.estimatedPoints &&
      form.description.trim() &&
      summary.vehicle &&
      summary.product &&
      summary.layer &&
      summary.component &&
      summary.detail
    )
  })

  // Quality score — role-specific weights
  //
  // SYS: completeness + traceability (description heavily weighted)
  // SWE: acceptance criteria + unambiguity (detail + description)
  // HWE: measurability + constraints (component + description)
  // ME:  packaging specs + constraints (component + description)
  // V&V: testability + verification method (description dominant)

  const ROLE_WEIGHTS: Record<UserRole, Record<string, number>> = {
    '': {
      projectKey: 10, issueType: 10, assignee: 5, estimatedPoints: 5,
      vehicle: 5, product: 5, layer: 5, component: 5, detail: 10,
      descriptionPresent: 15, descriptionLength: 25
    },
    'system-architect': {
      projectKey: 6, issueType: 6, assignee: 4, estimatedPoints: 2,
      vehicle: 8, product: 8, layer: 8, component: 8, detail: 8,
      descriptionPresent: 14, descriptionLength: 28
    },
    'sw-developer': {
      projectKey: 8, issueType: 8, assignee: 8, estimatedPoints: 6,
      vehicle: 6, product: 6, layer: 6, component: 8, detail: 12,
      descriptionPresent: 12, descriptionLength: 20
    },
    'hw-designer': {
      projectKey: 6, issueType: 6, assignee: 6, estimatedPoints: 4,
      vehicle: 8, product: 8, layer: 8, component: 10, detail: 10,
      descriptionPresent: 12, descriptionLength: 22
    },
    'me-designer': {
      projectKey: 6, issueType: 6, assignee: 6, estimatedPoints: 4,
      vehicle: 8, product: 8, layer: 8, component: 10, detail: 10,
      descriptionPresent: 12, descriptionLength: 22
    },
    'vv-engineer': {
      projectKey: 6, issueType: 6, assignee: 4, estimatedPoints: 2,
      vehicle: 6, product: 6, layer: 6, component: 6, detail: 8,
      descriptionPresent: 16, descriptionLength: 34
    }
  }

  const qualityScore = computed(() => {
    let score = 0
    const weights = ROLE_WEIGHTS[currentRole.value]

    if (form.projectKey) score += weights.projectKey
    if (form.issueType) score += weights.issueType
    if (form.assignee) score += weights.assignee
    if (form.estimatedPoints) score += weights.estimatedPoints
    if (summary.vehicle) score += weights.vehicle
    if (summary.product) score += weights.product
    if (summary.layer) score += weights.layer
    if (summary.component) score += weights.component
    if (summary.detail) score += weights.detail

    const desc = form.description.trim()
    if (desc) {
      score += weights.descriptionPresent
      score += Math.min(
        Math.floor(desc.length / 200 * weights.descriptionLength),
        weights.descriptionLength
      )
    }
    // Apply INCOSE quality penalty (only when description is present)
    if (desc) {
      score -= incoseScorePenalty(incoseViolations.value)
    }
    return Math.max(0, Math.min(score, 100))
  })

  const qualityScoreColor = computed(() => {
    const s = qualityScore.value
    if (s >= 80) return 'var(--accent-green)'
    if (s >= 50) return 'var(--accent-orange)'
    if (s > 0) return 'var(--accent-red)'
    return 'var(--text-muted)'
  })

  const qualityScoreLabel = computed(() => {
    const s = qualityScore.value
    if (s >= 80) return t('quality.excellent')
    if (s >= 50) return t('quality.good')
    if (s > 0) return t('quality.incomplete')
    return t('quality.empty')
  })

  // Domain-specific validation warnings
  const domainWarnings = computed<DomainWarning[]>(() =>
    currentRole.value ? checkDomainWarnings(currentRole.value, form.description, form.issueType) : []
  )

  // INCOSE requirement quality checks
  const incoseViolations = computed<IncoseViolation[]>(() =>
    checkIncoseRules(form.description)
  )

  // Assumption detection
  const assumptions = computed<Assumption[]>(() =>
    currentRole.value ? detectAssumptions(currentRole.value, form.description) : []
  )

  // Traceability gaps
  const traceabilityGaps = computed<TraceabilityGap[]>(() =>
    checkTraceabilityGaps(form.requirementLevel, form.parentReqId, form.verificationMethod)
  )

  // Auto-update requirement level when role is selected (not on initial empty state)
  watch(currentRole, (newRole) => {
    if (newRole) form.requirementLevel = getDefaultLevel(newRole)
  })

  // ASPICE process mapping
  const aspiceProfile = computed<AspiceProfile | null>(() =>
    currentRole.value && form.issueType ? getAspiceProfile(currentRole.value, form.issueType as 'Story' | 'Task' | 'Bug') : null
  )

  // Get current project name
  function getProjectName(): string {
    return PROJECT_CONFIG.find(p => p.key === form.projectKey)?.name || ''
  }

  // Reset form
  function resetForm() {
    form.projectKey = ''
    form.issueType = ''
    form.estimatedPoints = 0
    form.description = ''
    form.assignee = ''
    form.requirementLevel = 'none'
    form.parentReqId = ''
    form.verificationMethod = ''
    summary.vehicle = ''
    summary.product = ''
    summary.layer = ''
    summary.component = ''
    summary.detail = ''
    setRole('')
    localStorage.removeItem(DRAFT_KEY)
  }

  // Add component to history
  function addComponentToHistory(comp: string) {
    if (comp && !componentHistory.value.includes(comp)) {
      componentHistory.value.unshift(comp)
    }
  }

  // Auto-save draft
  function saveDraft() {
    const draft = { form: { ...form }, summary: { ...summary } }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }

  // Restore draft — returns true if a draft was found
  function restoreDraft(): boolean {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (!saved) return false
    try {
      const draft = JSON.parse(saved)
      if (draft.form) {
        Object.assign(form, draft.form)
      }
      if (draft.summary) {
        Object.assign(summary, draft.summary)
      }
      return true
    } catch {
      return false
    }
  }

  // Watch for changes and auto-save (debounced to avoid localStorage thrashing)
  let _draftTimer: ReturnType<typeof setTimeout> | null = null
  watch([form, summary], () => {
    if (_draftTimer) clearTimeout(_draftTimer)
    _draftTimer = setTimeout(saveDraft, 300)
  }, { deep: true })

  return {
    form,
    summary,
    componentHistory,
    computedSummary,
    canSubmit,
    qualityScore,
    qualityScoreColor,
    qualityScoreLabel,
    domainWarnings,
    incoseViolations,
    assumptions,
    traceabilityGaps,
    aspiceProfile,
    getProjectName,
    resetForm,
    addComponentToHistory,
    restoreDraft
  }
}
