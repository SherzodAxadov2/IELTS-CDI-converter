import { ref, reactive, computed } from 'vue'
import type { Question, QuestionOption, UserAnswers, TestResult } from '@/types'

export function useQuestions() {
  const questions = ref<Question[]>([])
  const answers = reactive<UserAnswers>({})

  const generateQuestions = (text: string): void => {
    // Extract the part of the document that contains the questions (everything after the first "Questions" heading)
    const [, questionsBlockRaw] = text.split(/\n+(?:Questions?|QUESTION[S]?)\b[\s\S]*/i).length === 2
      ? text.match(/\n+(?:Questions?|QUESTION[S]?)\b[\s\S]*/i) || []
      : [undefined, '']

    const questionsText = questionsBlockRaw?.trim() || ''

    const detected: Question[] = []

    if (!questionsText) {
      // Fallback – no questions detected
      questions.value = []
      return
    }

    // Split into lines for easier parsing
    const lines = questionsText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

    let i = 0
    while (i < lines.length) {
      const numMatch = lines[i].match(/^(\d{1,2})[\).\s]+(.+)/)
      if (!numMatch) { i++; continue }

      const id = parseInt(numMatch[1])
      let qText = numMatch[2]
      i++

      // Gather subsequent lines that belong to this question until we hit next numbered line
      const bodyLines: string[] = []
      while (i < lines.length && !/^\d{1,2}[\).\s]+/.test(lines[i])) {
        bodyLines.push(lines[i])
        i++
      }
      const body = bodyLines.join(' ')
      qText = qText + (body ? ' ' + body : '')

      // Detect question type
      let type: Question['type'] = 'fill-blank'
      const options: QuestionOption[] = []

      // True/False/Not Given detection
      if (/\btrue\b.*\bfalse\b.*\bnot\s+given\b/i.test(qText)) {
        type = 'true-false'
      } else {
        // Look ahead for options like A. / B. etc within qText
        const optionRegex = /\b([A-H])[\).]\s*([^A-H]+)/g
        let optMatch
        while ((optMatch = optionRegex.exec(qText)) !== null) {
          options.push({ value: optMatch[1], text: optMatch[2].trim() })
        }
        if (options.length > 0) {
          type = 'multiple-choice'
        }
      }

      const question: Question = {
        id,
        type,
        text: qText.replace(/\b(?:TRUE|FALSE|NOT GIVEN)\b/gi, '').trim(),
        ...(options.length ? { options } : {}),
        correctAnswer: '',
        explanation: '',
      }
      detected.push(question)
    }

    questions.value = detected

    // reset answers
    Object.keys(answers).forEach(k => delete answers[parseInt(k)])
    detected.forEach(q => { answers[q.id] = '' })
  }

  const isQuestionAnswered = (questionId: number): boolean => {
    return typeof answers[questionId] === 'string' && (answers[questionId] as string).trim() !== ''
  }

  const isAnswerCorrect = (questionId: number): boolean => {
    const question = questions.value.find(q => q.id === questionId)
    if (!question) return false
    
    const userAnswer = answers[questionId]
    
    if (question.type === 'fill-blank') {
      return userAnswer?.toLowerCase().trim() === question.correctAnswer.toLowerCase()
    }
    
    return userAnswer === question.correctAnswer
  }

  const calculateScore = (): TestResult => {
    let correctCount = 0
    
    questions.value.forEach(question => {
      if (isAnswerCorrect(question.id)) {
        correctCount++
      }
    })
    
    return {
      score: correctCount,
      totalQuestions: questions.value.length,
      answers: { ...answers },
      isCorrect: isAnswerCorrect
    }
  }

  const resetQuestions = (): void => {
    questions.value = []
    Object.keys(answers).forEach(key => {
      delete answers[parseInt(key)]
    })
  }

  const completedCount = computed(() => {
    return questions.value.filter(q => isQuestionAnswered(q.id)).length
  })

  return {
    questions,
    answers,
    generateQuestions,
    isQuestionAnswered,
    isAnswerCorrect,
    calculateScore,
    resetQuestions,
    completedCount
  }
}
