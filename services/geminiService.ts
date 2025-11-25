import { GoogleGenAI } from "@google/genai";

// Reverted to Nano Banana (Flash Image)
const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Generates an image from a text prompt.
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1' 
        }
      }
    });

    return extractImageFromResponse(response);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Edits an image based on a prompt (e.g., Remove BG, Upscale, Add Object).
 */
export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Strip prefix if present (e.g., "data:image/png;base64,")
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png',
            },
          },
          { text: prompt },
        ],
      },
    });

    return extractImageFromResponse(response);
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

/**
 * Helper to extract image data from the Gemini response.
 */
const extractImageFromResponse = (response: any): string => {
  const parts = response.candidates?.[0]?.content?.parts;
  
  if (!parts) {
    throw new Error("No content received from model.");
  }

  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  // Fallback: If no image found, check if there's text explaining why
  const textPart = parts.find((p: any) => p.text);
  if (textPart) {
    throw new Error(`Model returned text instead of image: ${textPart.text}`);
  }

  throw new Error("No valid image data found in response.");
};