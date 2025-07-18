import { ref, computed, onUnmounted } from 'vue'
import type { TimerState } from '@/types'

export function useTimer(initialTime: number = 3600) {
  const timeLeft = ref<number>(initialTime)
  const isRunning = ref<boolean>(false)
  const interval = ref<number | null>(null)

  const formattedTime = computed(() => {
    const minutes = Math.floor(timeLeft.value / 60)
    const seconds = timeLeft.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const start = (onTimeUp?: () => void) => {
    if (!isRunning.value) {
      isRunning.value = true
      interval.value = window.setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--
        } else {
          pause()
          if (onTimeUp) {
            onTimeUp()
          }
        }
      }, 1000)
    }
  }

  const pause = () => {
    isRunning.value = false
    if (interval.value) {
      clearInterval(interval.value)
      interval.value = null
    }
  }

  const reset = () => {
    pause()
    timeLeft.value = initialTime
  }

  onUnmounted(() => {
    if (interval.value) {
      clearInterval(interval.value)
    }
  })

  return {
    timeLeft,
    isRunning,
    formattedTime,
    start,
    pause,
    reset
  }
}
