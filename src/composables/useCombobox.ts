import { ref, computed } from 'vue'
import type { TeamMember } from '@/types/team'

export function useCombobox(getItems: () => TeamMember[]) {
  const searchTerm = ref('')
  const isOpen = ref(false)
  const highlightedIndex = ref(0)

  const filtered = computed(() => {
    const term = searchTerm.value.toLowerCase().trim()
    const items = getItems()
    if (!term) return items
    return items.filter(user => {
      return (
        user.name.toLowerCase().includes(term) ||
        user.id.toLowerCase().includes(term) ||
        (user.role?.toLowerCase().includes(term) ?? false)
      )
    })
  })

  function open() {
    isOpen.value = true
    searchTerm.value = ''
    highlightedIndex.value = 0
  }

  function close() {
    isOpen.value = false
    searchTerm.value = ''
  }

  function onInput() {
    if (!isOpen.value) isOpen.value = true
    highlightedIndex.value = 0
  }

  function onKeydown(event: KeyboardEvent, onSelect: (user: TeamMember) => void) {
    if (!isOpen.value) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        open()
        event.preventDefault()
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (highlightedIndex.value < filtered.value.length - 1) {
          highlightedIndex.value++
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (highlightedIndex.value > 0) {
          highlightedIndex.value--
        }
        break
      case 'Enter':
        event.preventDefault()
        if (filtered.value[highlightedIndex.value]) {
          onSelect(filtered.value[highlightedIndex.value])
          close()
        }
        break
      case 'Escape':
        close()
        break
    }
  }

  function highlightMatch(text: string, search: string): string {
    if (!search || !search.trim()) return escapeHtml(text)
    const escaped = escapeHtml(text)
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedSearch})`, 'gi')
    return escaped.replace(regex, '<span class="highlight-match">$1</span>')
  }

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  return {
    searchTerm,
    isOpen,
    highlightedIndex,
    filtered,
    open,
    close,
    onInput,
    onKeydown,
    highlightMatch
  }
}
