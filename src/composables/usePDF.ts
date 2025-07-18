import { ref } from "vue";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker using Vite asset URL
// Vite will bundle the worker file and provide a URL that the browser can fetch
// The `?url` suffix tells Vite to return the public URL to the asset instead of its contents.
// eslint-disable-next-line import/namespace
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export function usePDF() {
  const isProcessing = ref<boolean>(false);
  const error = ref<string | null>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    isProcessing.value = true;
    error.value = null;

    type Line = { text: string; fontSize: number; page: number };

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const lines: Line[] = [];

      for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex++) {
        const page = await pdf.getPage(pageIndex);
        const textContent = await page.getTextContent();

        interface WordItem {
          str: string;
          x: number;
          y: number;
          fontSize: number;
        }
        interface LineGroup {
          y: number;
          words: WordItem[];
        }

        // Convert each text item into a simpler structure with coordinates
        const items: WordItem[] = (textContent.items as any[]).map((item) => {
          const [a, b, , , e, f] = item.transform; // e = x, f = y in PDF units
          const fontSize = Math.hypot(a, b); // magnitude of scale gives font-size
          return {
            str: item.str as string,
            x: e as number,
            y: f as number,
            fontSize,
          };
        });

        // Sort by y (top→bottom) then x (left→right)
        items.sort((i1, i2) => {
          if (Math.abs(i2.y - i1.y) > 2) return i2.y - i1.y; // different rows
          return i1.x - i2.x;
        });

        // Group into lines: items with very similar y form a line
        const lineThreshold = 2; // PDF units
        let currentLine: LineGroup | null = null;
        items.forEach((it) => {
          if (!currentLine || Math.abs(currentLine.y - it.y) > lineThreshold) {
            // flush previous
            if (currentLine) {
              const text = currentLine.words.map((w) => w.str).join(" ");
              const maxFont = Math.max(
                ...currentLine.words.map((w) => w.fontSize)
              );
              lines.push({ text, fontSize: maxFont, page: pageIndex });
            }
            currentLine = { y: it.y, words: [it] };
          } else {
            currentLine.words.push(it);
          }
        });
        // push last line on page
        if (currentLine) {
          const text = currentLine.words.map((w) => w.str).join(" ");
          const maxFont = Math.max(...currentLine.words.map((w) => w.fontSize));
          lines.push({ text, fontSize: maxFont, page: pageIndex });
        }

        // Add blank line between pages to preserve spacing
        lines.push({ text: "\n", fontSize: 0, page: pageIndex });
      }

      // Build a plain text version (needed by question generator) – just concatenate texts with newline
      const plainText = lines.map((l) => l.text).join("\n");
      return plainText;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to process PDF";
      throw err;
    } finally {
      isProcessing.value = false;
    }
  };

  const formatPassageText = (raw: string): string => {
    // Remove everything after the Questions section so only the passage remains
    const [passageOnly] = raw.split(/\n+(?:Questions?|QUESTION[S]?)\b[\s\S]*/i);
    raw = passageOnly || raw;
    // We treat every line break as potential line while preserving headings (lines in ALL CAPS or short length)
    const lines = raw
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    return lines
      .map((l) => {
        // Simple heuristics: if line is <= 60 chars and mostly uppercase, treat as heading
        const upperRatio =
          l.replace(/[^A-Z]/g, "").length /
            l.replace(/[^A-Za-z]/g, "").length || 0;
        if (upperRatio > 0.6 || l.length < 60) {
          return `<h2>${escapeHtml(l)}</h2>`;
        }
        return `<p>${escapeHtml(l)}</p>`;
      })
      .join("");
  };

  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return {
    isProcessing,
    error,
    extractTextFromPDF,
    formatPassageText,
  };
}
