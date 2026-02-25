import { ref } from 'vue'

const LS_KEY = 'theme'
const isDark = ref<boolean>(localStorage.getItem(LS_KEY) !== 'light')

function applyTheme(dark: boolean) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

// Apply on initial load
applyTheme(isDark.value)

export function useTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem(LS_KEY, isDark.value ? 'dark' : 'light')
    applyTheme(isDark.value)
  }

  return { isDark, toggleTheme }
}
