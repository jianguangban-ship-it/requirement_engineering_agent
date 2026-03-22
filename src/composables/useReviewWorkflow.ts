import { ref, computed } from 'vue'
import type { ReviewStatus } from '@/config/domain/review-workflow'
import { REVIEW_STEPS, getReviewChecklist } from '@/config/domain/review-workflow'
import { currentRole } from '@/composables/useRole'

const reviewStatus = ref<ReviewStatus>('draft')
const checkedItems = ref<Set<string>>(new Set())

export function useReviewWorkflow() {
  const currentStepIndex = computed(() =>
    REVIEW_STEPS.findIndex(s => s.id === reviewStatus.value)
  )

  const checklist = computed(() => getReviewChecklist(currentRole.value))

  const allChecked = computed(() =>
    checklist.value.every(item => checkedItems.value.has(item.id))
  )

  const checkProgress = computed(() => {
    if (checklist.value.length === 0) return 0
    return Math.round((checkedItems.value.size / checklist.value.length) * 100)
  })

  function advanceTo(status: ReviewStatus) {
    reviewStatus.value = status
  }

  function toggleCheck(itemId: string) {
    const next = new Set(checkedItems.value)
    if (next.has(itemId)) {
      next.delete(itemId)
    } else {
      next.add(itemId)
    }
    checkedItems.value = next
  }

  function resetWorkflow() {
    reviewStatus.value = 'draft'
    checkedItems.value = new Set()
  }

  return {
    reviewStatus,
    currentStepIndex,
    checklist,
    checkedItems,
    allChecked,
    checkProgress,
    advanceTo,
    toggleCheck,
    resetWorkflow,
    REVIEW_STEPS
  }
}
