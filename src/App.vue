<template>
  <div class="app-container" :class="{ 'night-mode': isDarkMode }">
    <header>
      <div class="logo-area">
        <a href="#" class="social-link telegram">
          <i class="fab fa-telegram-plane"></i>
          <span>Telegram</span>
        </a>
        <a href="#" class="social-link instagram">
          <i class="fab fa-instagram"></i>
          <span>Instagram</span>
        </a>
        <a href="#" class="social-link youtube">
          <i class="fab fa-youtube"></i>
          <span>YouTube</span>
        </a>
      </div>

      <div class="header-controls">
        <div class="timer" v-if="passageText">
          <span>{{ formattedTime }}</span>
          <div class="timer-controls">
            <button @click="handleStartTimer" :disabled="isTimerRunning">
              <i class="fas fa-play"></i>
            </button>
            <button @click="pauseTimer" :disabled="!isTimerRunning">
              <i class="fas fa-pause"></i>
            </button>
            <button @click="resetTimer">
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>

        <button class="mode-toggle" @click="toggleDarkMode">
          <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </button>
      </div>
    </header>

    <main>
      <!-- Upload Section -->
      <div v-if="!passageText" class="upload-section">
        <div
          class="upload-area"
          :class="{ dragover: isDragOver }"
          @drop="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @click="triggerFileInput"
        >
          <div class="upload-icon">
            <i class="fas fa-file-pdf"></i>
          </div>
          <h2>Upload IELTS Reading Passage</h2>
          <p>Drag and drop a PDF file here or click to select</p>
          <p class="instructions">Supported format: PDF</p>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept=".pdf"
          @change="handleFileSelect"
          style="display: none"
        />

        <div v-if="isProcessing" class="processing-indicator">
          <div class="spinner"></div>
          <span>Processing PDF...</span>
        </div>

        <div v-if="pdfError" class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ pdfError }}</span>
        </div>

        <div class="action-buttons">
          <button
            class="btn-primary"
            @click="triggerFileInput"
            :disabled="isProcessing"
          >
            <i class="fas fa-upload"></i>
            Choose PDF File
          </button>
        </div>
      </div>

      <!-- Reading Test Section -->
      <template v-if="passageText">
        <!-- Passage Container -->
        <div class="passage-container">
          <h2 class="passage-title">Reading Passage</h2>
          <div class="passage-text" v-html="passageText"></div>
        </div>

        <!-- Questions Container -->
        <div class="questions-container">
          <h2 class="questions-title">Questions</h2>

          <div class="progress-bar">
            <div
              v-for="question in questions"
              :key="question.id"
              class="progress-item"
              :class="{ completed: isQuestionAnswered(question.id) }"
            ></div>
          </div>

          <div
            v-for="question in questions"
            :key="question.id"
            class="question"
          >
            <div class="question-title">
              <span
                class="question-number"
                :class="{ completed: isQuestionAnswered(question.id) }"
              >
                {{ question.id }}
              </span>
              <div class="question-text" v-html="question.text"></div>
            </div>

            <!-- Multiple Choice Questions -->
            <div
              v-if="question.type === 'multiple-choice'"
              class="question-options"
            >
              <div
                v-for="(option, optionIndex) in question.options"
                :key="optionIndex"
                class="option"
              >
                <input
                  type="radio"
                  :name="`question-${question.id}`"
                  :value="option.value"
                  v-model="answers[question.id]"
                  :id="`q${question.id}-${optionIndex}`"
                />
                <label :for="`q${question.id}-${optionIndex}`">
                  {{ option.text }}
                </label>
              </div>
            </div>

            <!-- Fill in the Blank Questions -->
            <div v-if="question.type === 'fill-blank'" class="question-options">
              <input
                type="text"
                class="fill-in-blank"
                v-model="answers[question.id]"
                :placeholder="question.placeholder || 'Your answer'"
              />
              <div class="instructions" v-if="question.instructions">
                {{ question.instructions }}
              </div>
            </div>

            <!-- True/False Questions -->
            <div v-if="question.type === 'true-false'" class="question-options">
              <div class="option">
                <input
                  type="radio"
                  :name="`question-${question.id}`"
                  value="true"
                  v-model="answers[question.id]"
                  :id="`q${question.id}-true`"
                />
                <label :for="`q${question.id}-true`">True</label>
              </div>
              <div class="option">
                <input
                  type="radio"
                  :name="`question-${question.id}`"
                  value="false"
                  v-model="answers[question.id]"
                  :id="`q${question.id}-false`"
                />
                <label :for="`q${question.id}-false`">False</label>
              </div>
              <div class="option">
                <input
                  type="radio"
                  :name="`question-${question.id}`"
                  value="not-given"
                  v-model="answers[question.id]"
                  :id="`q${question.id}-not-given`"
                />
                <label :for="`q${question.id}-not-given`">Not Given</label>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn-secondary" @click="handleResetTest">
              <i class="fas fa-redo"></i>
              Reset Test
            </button>
            <button class="btn-primary" @click="handleSubmitAnswers">
              <i class="fas fa-check"></i>
              Submit Answers
            </button>
          </div>
        </div>
      </template>
    </main>

    <!-- Feedback Overlay -->
    <div
      class="feedback-overlay"
      v-if="showFeedback"
      @click="handleCloseFeedback"
    >
      <div class="feedback-container" @click.stop>
        <div class="feedback-header">
          <h2 class="feedback-title">
            Test Results - Score: {{ testResult?.score }}/{{
              testResult?.totalQuestions
            }}
          </h2>
          <button class="close-feedback" @click="handleCloseFeedback">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="feedback-body">
          <div
            v-for="question in questions"
            :key="question.id"
            class="feedback-item"
          >
            <div class="feedback-question">
              <span
                :class="isAnswerCorrect(question.id) ? 'correct' : 'incorrect'"
              >
                Question {{ question.id }}:
              </span>
              <i
                :class="
                  isAnswerCorrect(question.id)
                    ? 'fas fa-check correct'
                    : 'fas fa-times incorrect'
                "
              ></i>
            </div>

            <p><em v-html="question.text"></em></p>

            <div class="feedback-answer">
              <strong>Your answer:</strong>
              {{ answers[question.id] || "Not answered" }}<br />
              <template v-if="!isAnswerCorrect(question.id)">
                <strong>Correct answer:</strong> {{ question.correctAnswer }}
              </template>
            </div>

            <div class="feedback-explanation">
              <strong>Explanation:</strong> {{ question.explanation }}
            </div>

            <div class="feedback-passage" v-if="question.relevantText">
              <strong>Relevant passage:</strong> "{{ question.relevantText }}"
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useDarkMode } from "@/composables/useDarkMode";
import { useTimer } from "@/composables/useTimer";
import { usePDF } from "@/composables/usePDF";
import { useQuestions } from "@/composables/useQuestions";
import { renderLegacyUI } from "@/legacyRenderer";
import { useOpenRouter } from "@/composables/useOpenRouter";
import type { TestResult } from "@/types";

// Composables
const { isDarkMode, toggleDarkMode } = useDarkMode();
const {
  formattedTime,
  isRunning: isTimerRunning,
  start: startTimer,
  pause: pauseTimer,
  reset: resetTimer,
} = useTimer();
const { isProcessing, error: pdfError, extractTextFromPDF } = usePDF();
const {
  isCalling: isLLMCalling,
  error: llmError,
  generatePassageAndQuestions,
} = useOpenRouter();
const {
  questions,
  answers,
  generateQuestions,
  isQuestionAnswered,
  isAnswerCorrect,
  calculateScore,
  resetQuestions,
} = useQuestions();

// Reactive state
const passageText = ref<string>("");
const isDragOver = ref<boolean>(false);
const showFeedback = ref<boolean>(false);
const testResult = ref<TestResult | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Methods
const triggerFileInput = (): void => {
  fileInputRef.value?.click();
};

const handleDragOver = (event: DragEvent): void => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (): void => {
  isDragOver.value = false;
};

const handleDrop = async (event: DragEvent): Promise<void> => {
  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer?.files;
  if (files && files.length > 0 && files[0].type === "application/pdf") {
    await processPDF(files[0]);
  } else {
    alert("Please upload a PDF file.");
  }
};

const handleFileSelect = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file && file.type === "application/pdf") {
    await processPDF(file);
  } else {
    alert("Please select a PDF file.");
  }
};

const processPDF = async (file: File): Promise<void> => {
  try {
    const extractedText = await extractTextFromPDF(file);
    // Call OpenRouter to format passage and generate questions
    const result = await generatePassageAndQuestions(extractedText);
    console.log("LLM result", result);
    if (!result) throw new Error(llmError.value || "LLM returned no result");

    passageText.value = result.passageHtml;
    questions.value = result.questions as any;

    // Inject into legacy static layout (if present)
    renderLegacyUI(passageText.value, questions.value);
  } catch (error) {
    console.error("Error processing PDF:", error);
    alert(
      "Error processing PDF file or LLM generation failed. Please try again."
    );
  }
};

const handleStartTimer = (): void => {
  startTimer(() => {
    alert("Time is up! Your test will be submitted automatically.");
    handleSubmitAnswers();
  });
};

const handleSubmitAnswers = (): void => {
  testResult.value = calculateScore();
  showFeedback.value = true;
  pauseTimer();
};

const handleCloseFeedback = (): void => {
  showFeedback.value = false;
};

const handleResetTest = (): void => {
  passageText.value = "";
  resetQuestions();
  showFeedback.value = false;
  testResult.value = null;
  resetTimer();
};
</script>
