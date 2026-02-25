import { ref } from 'vue'
import type { Toast, ToastType } from '@/types/api'

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
  function addToast(type: ToastType, message: string, duration = 5000) {
    const id = nextId++
    toasts.value.push({ id, type, message, duration })

    if (toasts.value.length > 5) {
      toasts.value.shift()
    }

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  function removeToast(id: number) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return { toasts, addToast, removeToast }
}
