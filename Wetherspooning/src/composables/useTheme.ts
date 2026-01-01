import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'

export function useTheme() {
  const mode = useColorMode({
    storageKey: 'wetherspooning-theme',
    modes: {
      light: 'light',
      dark: 'dark',
    },
  })

  const isDark = computed(() => mode.value === 'dark')

  const toggleTheme = () => {
    mode.value = mode.value === 'dark' ? 'light' : 'dark'
  }

  return {
    mode,
    isDark,
    toggleTheme,
  }
}
