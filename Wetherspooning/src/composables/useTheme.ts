import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'wetherspooning-theme'

// Shared reactive state
const theme = ref<Theme>('light')

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(newTheme: Theme) {
  if (typeof document === 'undefined') return
  
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  } catch (error) {
    console.warn('localStorage unavailable, using system theme')
  }
  return getSystemTheme()
}

function saveTheme(newTheme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  } catch (error) {
    console.warn('Failed to save theme to localStorage')
  }
}

export function useTheme() {
  // Initialize theme on first use
  const initTheme = () => {
    const initialTheme = loadTheme()
    theme.value = initialTheme
    applyTheme(initialTheme)
  }

  // Watch for theme changes and apply them
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
    saveTheme(newTheme)
  })

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    theme,
    toggleTheme,
    initTheme
  }
}
