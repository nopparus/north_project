import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getMinimumWage(province: string): Promise<number | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the current official daily minimum wage (THB) for the province of ${province} in Thailand? Provide only the number. If you are unsure, provide the most recent known value for 2024 or 2025.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            minWage: {
              type: Type.NUMBER,
              description: "The daily minimum wage in THB",
            },
          },
          required: ["minWage"],
        },
      },
    });

    const data = JSON.parse(response.text);
    return data.minWage || null;
  } catch (error) {
    console.error("Error fetching minimum wage:", error);
    return null;
  }
}
