import { ref } from "vue";

// Types
export interface GeneratedQuestion {
  id: number;
  text: string;
  type: "multiple-choice" | "fill-blank" | "true-false";
  options?: { value: string; text: string }[];
  correctAnswer: string;
  explanation?: string;
  relevantText?: string;
}

export interface LLMResult {
  passageHtml: string;
  questions: GeneratedQuestion[];
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export function useOpenRouter() {
  const isCalling = ref(false);
  const error = ref<string | null>(null);

  const generatePassageAndQuestions = async (
    rawText: string
  ): Promise<LLMResult | null> => {
    isCalling.value = true;
    error.value = null;

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      error.value =
        "OpenRouter API key is missing. Add VITE_OPENROUTER_API_KEY to your .env file.";
      isCalling.value = false;
      return null;
    }

    // Construct chat prompt
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "You are an assistant that converts raw IELTS PDF text into structured HTML and question JSON.",
      },
      {
        role: "user",
        content: `You are an assistant that converts raw IELTS PDF text into structured JSON.\n\nInput (RAW TEXT):\n${rawText}\n\nReturn ONLY valid JSON matching this exact TypeScript interface:\ninterface Result {\n  passageHtml: string;            // HTML for the reading passage.
  // Requirements:
  // 1. First output the italic introductory description line in its own <p><i>...</i></p>, e.g. "You should spend about 20 minutes on Questions 1-16, which are based on Reading Passage 1 below." If such a line exists in the RAW TEXT, reuse it; otherwise synthesise the standard sentence.
  // 2. Immediately AFTER the intro line, detect the actual passage TITLE (the next non-empty line) and wrap it in <h2 style="text-align:center"><b>...</b></h2>. Do NOT invent generic titles like "Reading Passage 1"—use the real title present in the text.
  // 3. BUG CONTEXT: Previous outputs sometimes merged paragraphs together, producing long <p> blocks. To fix, you MUST treat every blank line in RAW TEXT as a paragraph break.
  //    If two or more consecutive newlines appear, that definitely indicates a new paragraph. Each resulting paragraph goes in its own <p> tag. Treat ANY blank line or multiple new-line sequence as a paragraph break. Wrap each paragraph in its own <p>...</p>.
  // 4. NEVER nest paragraphs or merge multiple paragraphs into a single <p>.
  // 5. Escape internal newlines inside <p> nodes as \\n.
\n  questions: {\n    id: number;\n    text: string;\n    type: \"multiple-choice\" | \"fill-blank\" | \"true-false\";\n    options?: { value: string; text: string }[];\n    correctAnswer: string;\n    explanation?: string;\n    relevantText?: string;\n  }[];\n}\n\nRules:\n1. Do NOT wrap the JSON in markdown fences or back-ticks.\n2. Escape every newline in passageHtml as \\n.\n3. Output must be compact single-line JSON starting with { and ending with }. Nothing before or after.`,
      },
    ];

    try {
      const res = await fetch(OPENROUTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages,
          temperature: 0.2,
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error(`OpenRouter API error ${res.status}`);
      }

      const data = await res.json();
      const content: string = data.choices?.[0]?.message?.content || "";

      // Extract JSON between ```json fences if present
      let jsonString = content.replace(/```json|```/gi, "").trim();

      // Replace back-ticks with double quotes (model sometimes wraps long strings)
      jsonString = jsonString.replace(/`/g, '"');

      // Fallback: grab text between first { and last }
      if (!jsonString.startsWith("{")) {
        const firstBrace = jsonString.indexOf("{");
        const lastBrace = jsonString.lastIndexOf("}");
        if (firstBrace >= 0 && lastBrace > firstBrace) {
          jsonString = jsonString.slice(firstBrace, lastBrace + 1);
        }
      }

      const parsed: LLMResult = JSON.parse(jsonString);
      return parsed;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to call OpenRouter";
      return null;
    } finally {
      isCalling.value = false;
    }
  };

  return {
    isCalling,
    error,
    generatePassageAndQuestions,
  };
}
