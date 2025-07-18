import { ref, watch } from 'vue'

export function useDarkMode() {
  const isDarkMode = ref<boolean>(false)

  // Load saved preference from localStorage
  const savedMode = localStorage.getItem('darkMode')
  if (savedMode) {
    isDarkMode.value = JSON.parse(savedMode)
  }

  // Watch for changes and save to localStorage
  watch(isDarkMode, (newValue) => {
    localStorage.setItem('darkMode', JSON.stringify(newValue))
  })

  const toggleDarkMode = (): void => {
    isDarkMode.value = !isDarkMode.value
  }

  return {
    isDarkMode,
    toggleDarkMode
  }
}
