import { ref } from 'vue'

export interface TicketEntry {
  key: string
  summary: string
  project: string
  issueType: string
  date: string
}

const LS_KEY = 'ticket-history'
const MAX_ENTRIES = 20

function loadFromStorage(): TicketEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as TicketEntry[]) : []
  } catch {
    return []
  }
}

export const ticketHistory = ref<TicketEntry[]>(loadFromStorage())

export function addTicket(entry: TicketEntry): void {
  ticketHistory.value = [entry, ...ticketHistory.value].slice(0, MAX_ENTRIES)
  localStorage.setItem(LS_KEY, JSON.stringify(ticketHistory.value))
}

export function clearHistory(): void {
  ticketHistory.value = []
  localStorage.removeItem(LS_KEY)
}
