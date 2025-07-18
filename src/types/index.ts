export interface QuestionOption {
  value: string
  text: string
}

export interface Question {
  id: number
  type: 'multiple-choice' | 'fill-blank' | 'true-false'
  text: string
  options?: QuestionOption[]
  placeholder?: string
  instructions?: string
  correctAnswer: string
  explanation: string
  relevantText?: string
}

export interface UserAnswers {
  [questionId: number]: string
}

export interface TestResult {
  score: number
  totalQuestions: number
  answers: UserAnswers
  isCorrect: (questionId: number) => boolean
}

export interface TimerState {
  timeLeft: number
  isRunning: boolean
  interval: number | null
}
