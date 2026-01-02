import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Converts a File object to a Base64 string.
 */
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Translates the provided document using Gemini with streaming.
 */
export const translateDocumentStream = async (
  file: File,
  targetLanguage: string,
  onContentUpdate: (html: string) => void,
  onStatusUpdate: (status: string) => void
): Promise<void> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure your environment.");
  }

  try {
    onStatusUpdate("Processing file...");
    const base64Data = await fileToGenerativePart(file);

    onStatusUpdate("Initializing Gemini AI stream...");

    // We use gemini-3-flash-preview for efficiency with documents
    const model = "gemini-3-flash-preview";

    const prompt = `
      You are a professional document translator and layout reconstruction expert. 
      Task: Translate the attached document into ${targetLanguage} while STRICTLY PRESERVING the original visual structure, layout, and formatting.
      
      CRITICAL INSTRUCTIONS:
      1. LAYOUT & COLUMNS: If the original is multi-column (e.g., 2 columns), you MUST use HTML/CSS to replicate this (e.g., <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">).
      2. EXACT POSITIONING: Titles, patent numbers, dates, and metadata must remain in their exact visual locations (e.g., top-right, centered). Match font weights (bold) and styles (italic).
      3. NO EXTERNAL IMAGES: Do NOT generate <img> tags with external URLs. This causes loading errors.
      4. IMAGE PLACEHOLDERS: Wherever an image, diagram, barcode, or figure appears, strictly use this placeholder: 
         <div style="background:#f8fafc; border: 1px dashed #cbd5e1; padding:2rem; text-align:center; margin: 1rem 0; color: #64748b; border-radius: 4px;">[Original Image/Figure]</div>
      5. TABLES: Replicate tables using HTML <table> tags with borders and padding that match the original.
      6. OUTPUT: Return ONLY the raw HTML string inside a container. Use inline CSS for styling. Do not use markdown blocks.
      
      Translate all text accurately.
    `;

    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    onStatusUpdate("Translating...");
    
    let accumulatedText = "";

    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        accumulatedText += c.text;
        // Clean markdown fencing on the fly if it exists
        const cleanHtml = accumulatedText.replace(/^```html\s*/, '').replace(/\s*```$/, '');
        onContentUpdate(cleanHtml);
      }
    }

  } catch (error: any) {
    console.error("Translation Error:", error);
    throw new Error(error.message || "Failed to translate document.");
  }
};