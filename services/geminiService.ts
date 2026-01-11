
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getRandomWords(): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate 3 distinct, moderately difficult to guess objects or things for a 20-questions style game. Ensure they are common enough to be known but specific enough to be challenging. Return only the names as a JSON array.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const words = JSON.parse(response.text.trim());
    return Array.isArray(words) ? words : ["Elephant", "Spaceship", "Library"];
  } catch (error) {
    console.error("Error fetching words from Gemini:", error);
    return ["Guitar", "Volcano", "Sandwich"]; // Fallback words
  }
}
