import type { Question } from '@/types'

/**
 * Injects the extracted passage HTML and parsed questions into the static legacy HTML layout
 * (Diyorbeks IELTS LC.html) without touching its existing styles or other behaviours.
 *
 * The function assumes that the runtime page already contains the following IDs/classes:
 *   - #passage-text   (the <div> where passage paragraphs live)
 *   - #questions-container (the right-hand column where questions should be appended)
 *   - .progress-container (footer progress bar items)
 *
 * Any previous hard-coded passage or question markup will be cleared before new content
 * is injected.
 */
export function renderLegacyUI (passageHtml: string, questions: Question[]): void {
  // 1. Render passage
  const passageEl = document.getElementById('passage-text')
  if (passageEl) {
    passageEl.innerHTML = passageHtml
  }

  // 2. Render questions list
  const container = document.getElementById('questions-container')
  if (!container) return

  container.innerHTML = '' // Wipe any existing hard-coded questions

  // Helper to create radio option label/input pair
  const createRadio = (name: string, value: string, labelText: string): HTMLElement => {
    const label = document.createElement('label')
    label.className = 'option'

    const input = document.createElement('input')
    input.type = 'radio'
    input.name = name
    input.value = value

    label.appendChild(input)
    label.appendChild(document.createTextNode(' ' + labelText))
    return label
  }

  questions.forEach(q => {
    const qDiv = document.createElement('div')
    qDiv.className = 'question'
    qDiv.id = `q${q.id}`

    // --- title -----------------------------------------------------------
    const titleDiv = document.createElement('div')
    titleDiv.className = 'question-title'

    const numDiv = document.createElement('div')
    numDiv.className = 'question-number'
    numDiv.textContent = String(q.id)

    const textDiv = document.createElement('div')
    textDiv.className = 'question-text'
    textDiv.innerHTML = q.text

    titleDiv.appendChild(numDiv)
    titleDiv.appendChild(textDiv)
    qDiv.appendChild(titleDiv)

    // --- options / answers ----------------------------------------------
    if (q.type === 'true-false') {
      const opts = document.createElement('div')
      opts.className = 'options'
      opts.appendChild(createRadio(`q${q.id}`, 'TRUE', 'TRUE'))
      opts.appendChild(createRadio(`q${q.id}`, 'FALSE', 'FALSE'))
      opts.appendChild(createRadio(`q${q.id}`, 'NOT GIVEN', 'NOT GIVEN'))
      qDiv.appendChild(opts)
    } else if (q.type === 'multiple-choice' && q.options) {
      const opts = document.createElement('div')
      opts.className = 'options'
      q.options.forEach(opt => {
        opts.appendChild(createRadio(`q${q.id}`, opt.value, `${opt.value}. ${opt.text}`))
      })
      qDiv.appendChild(opts)
    } else {
      // fill-blank
      const qText = textDiv.innerHTML
      textDiv.innerHTML = '' // reset
      const input = document.createElement('input')
      input.type = 'text'
      input.name = `q${q.id}`
      input.className = 'fill-in-the-blank'
      textDiv.innerHTML = qText.replace(/\[\[blank\]\]/i, '')
      // Append at the end for simplicity
      textDiv.appendChild(document.createTextNode(' '))
      textDiv.appendChild(input)
    }

    container.appendChild(qDiv)
  })

  // 3. Rebuild progress bar in footer (if present)
  const progressContainer = document.getElementById('progress-container')
  if (progressContainer) {
    progressContainer.innerHTML = ''
    questions.forEach(q => {
      const item = document.createElement('div')
      item.className = 'progress-item'
      item.textContent = String(q.id)
      item.dataset.question = String(q.id)
      progressContainer.appendChild(item)

      // click scroll
      item.addEventListener('click', () => {
        const target = document.getElementById(`q${q.id}`)
        target?.scrollIntoView({ behavior: 'smooth' })
      })
    })
  }
}
