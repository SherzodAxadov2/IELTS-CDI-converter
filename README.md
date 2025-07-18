# IELTS Reading Comprehension Practice App (TypeScript)

A modern Vue 3 + TypeScript web application for IELTS reading comprehension practice with PDF upload functionality, built using Composition API and pnpm.

## 🚀 Features

### 🔥 Core Features
- **PDF Upload**: Drag & drop or click to upload PDF reading passages
- **Automatic Text Extraction**: Extracts text from PDF files using PDF.js
- **Question Generation**: Automatically generates various types of IELTS questions
- **Split Layout**: Reading passage on the left, questions on the right
- **Real-time Progress Tracking**: Visual indicators for completed questions
- **Instant Feedback**: Detailed results with explanations and relevant passages

### 🎨 UI/UX Features
- **Dark/Light Mode**: Toggle between day and night themes with localStorage persistence
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern Interface**: Clean, professional design inspired by IELTS standards
- **Smooth Animations**: Hover effects and transitions for better user experience

### ⏱️ Timer Features
- **60-minute Timer**: Standard IELTS reading test duration
- **Timer Controls**: Start, pause, and reset functionality
- **Auto-submit**: Automatically submits test when time runs out
- **Visual Timer**: Clear countdown display in the header

### 📝 Question Types
- **Multiple Choice**: A, B, C, D options with radio buttons
- **True/False/Not Given**: Standard IELTS true/false questions
- **Fill in the Blank**: Text input fields for short answers
- **Extensible**: Easy to add more question types

### 🔍 Answer Checking
- **Automatic Scoring**: Calculates score based on correct answers
- **Detailed Feedback**: Shows correct answers, explanations, and relevant passages
- **Progress Visualization**: Color-coded progress indicators
- **Answer Review**: Complete breakdown of all questions and answers

## 🛠️ Tech Stack

- **Vue 3**: Latest version with Composition API
- **TypeScript**: Full type safety and better developer experience
- **Vite**: Fast build tool and development server
- **pnpm**: Fast, disk space efficient package manager
- **PDF.js**: PDF parsing and text extraction
- **Font Awesome**: Icons and visual elements
- **CSS Variables**: Dynamic theming system

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- pnpm (install with `npm install -g pnpm`)

### Setup Steps

1. **Navigate to the project directory**:
   ```bash
   cd /Users/sherzodaxadov/CascadeProjects/ielts-reading-app-ts
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Additional Commands

- **Type checking**: `pnpm type-check`
- **Build for production**: `pnpm build`
- **Preview production build**: `pnpm preview`

## 🏗️ Project Structure

```
src/
├── components/           # Reusable Vue components
├── composables/         # Vue 3 Composition API composables
│   ├── useDarkMode.ts   # Dark mode functionality
│   ├── usePDF.ts        # PDF processing logic
│   ├── useQuestions.ts  # Question generation and management
│   └── useTimer.ts      # Timer functionality
├── types/               # TypeScript type definitions
│   └── index.ts         # Main type definitions
├── App.vue              # Main application component
├── main.ts              # Application entry point
└── style.css            # Global styles
```

## 🎯 Usage

### Getting Started
1. **Upload a PDF**: Click the upload area or drag & drop a PDF file
2. **Wait for Processing**: The app will extract text and generate questions
3. **Start the Timer**: Click the play button to begin the 60-minute countdown
4. **Answer Questions**: Complete all questions using the interface on the right
5. **Submit & Review**: Click "Submit Answers" to see your results

### Question Types Guide

#### Multiple Choice Questions
- Select one option from A, B, C, or D
- Click on the radio button or the text to select

#### True/False/Not Given Questions
- Choose from three options: True, False, or Not Given
- Follow standard IELTS guidelines for these question types

#### Fill in the Blank Questions
- Type your answer in the text field
- Follow the instructions (e.g., "ONE WORD only", "A NUMBER")
- Answers are case-insensitive

### Timer Usage
- **Start**: Begin the 60-minute countdown
- **Pause**: Temporarily stop the timer
- **Reset**: Reset timer back to 60 minutes
- **Auto-submit**: Test automatically submits when time reaches 0

### Dark Mode
- Click the moon/sun icon in the header to toggle between light and dark themes
- Your preference is automatically saved to localStorage

## 🔧 Customization

### Adding New Question Types
1. Update the `Question` interface in `src/types/index.ts`
2. Add the question type logic in `src/composables/useQuestions.ts`
3. Create the corresponding template in `src/App.vue`
4. Update the answer checking logic

### Modifying Timer Duration
Change the `initialTime` parameter in the `useTimer` composable call:
```typescript
const { formattedTime, isRunning, start, pause, reset } = useTimer(7200) // 2 hours
```

### Styling Customization
All styles use CSS variables defined in `src/style.css`. Modify the `:root` and `.night-mode` sections to customize colors and appearance.

## 🧩 Composables

### `useDarkMode()`
Manages dark/light mode state with localStorage persistence.

### `useTimer(initialTime)`
Handles countdown timer functionality with start, pause, and reset capabilities.

### `usePDF()`
Manages PDF file processing and text extraction using PDF.js.

### `useQuestions()`
Handles question generation, answer management, and scoring logic.

## 🔍 Type Safety

The application is fully typed with TypeScript, providing:
- **Compile-time error checking**
- **IntelliSense support**
- **Better refactoring capabilities**
- **Self-documenting code**

Key interfaces:
- `Question`: Defines the structure of test questions
- `UserAnswers`: Maps question IDs to user responses
- `TestResult`: Contains scoring and result information
- `TimerState`: Manages timer state

## 🌐 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

### File Support
- **PDF Files**: All standard PDF formats
- **Text Extraction**: Works with most PDF types (some scanned PDFs may not work)

## 🐛 Troubleshooting

### PDF Upload Issues
- Ensure the file is a valid PDF
- Check that the PDF contains extractable text (not just images)
- Try a different PDF file if extraction fails

### Timer Not Working
- Check browser console for JavaScript errors
- Ensure the component is properly mounted
- Verify that the timer interval is being set correctly

### TypeScript Errors
- Run `pnpm type-check` to see all type errors
- Ensure all dependencies are properly installed
- Check that all imports have correct paths

### Styling Issues
- Clear browser cache and reload
- Check that all CSS files are loading properly
- Verify that Font Awesome icons are loading

## 🚀 Future Enhancements

### Planned Features
- **AI-Powered Question Generation**: More sophisticated question creation
- **Multiple Passage Support**: Handle multiple reading passages
- **Score History**: Track performance over time
- **Export Results**: Download test results as PDF
- **Custom Question Templates**: User-defined question patterns
- **Audio Support**: Listening comprehension features

### Technical Improvements
- **Backend Integration**: Save results to database
- **User Authentication**: Personal accounts and progress tracking
- **Advanced PDF Processing**: Better text extraction algorithms
- **PWA Support**: Progressive Web App capabilities
- **Unit Testing**: Comprehensive test coverage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Run `pnpm type-check` to ensure no type errors
5. Test thoroughly
6. Submit a pull request

## 📄 License

MIT License - feel free to use this project for educational or commercial purposes.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the browser console for errors
3. Run `pnpm type-check` for TypeScript issues
4. Ensure all dependencies are properly installed
5. Verify that your PDF files contain extractable text

---

**Built with ❤️ using Vue 3, TypeScript, and pnpm**

**Happy practicing! 🎯**
