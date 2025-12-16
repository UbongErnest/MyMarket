
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize only if key is present.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateProductDescription = async (title: string, category: string, condition: string, features: string): Promise<string> => {
  // FALLBACK: If for some reason the key is missing or invalid in production
  if (!ai) {
    console.log("No API Key configured. Using smart template fallback.");
    return `Selling my ${title} (${category}).
    
Condition: ${condition}
    
${features ? `Note: ${features}` : `It is a great deal for students looking for ${category}.`}
    
Message me for more details or to negotiate!`;
  }

  try {
    const prompt = `
      You are an expert sales copywriter for a Student Marketplace app.
      Your goal is to write a short, punchy, and persuasive product description (max 100 words).
      
      Item Details:
      - Title: ${title}
      - Category: ${category}
      - Condition: ${condition}
      - User Notes / Features: "${features}"

      Instructions:
      1. If "User Notes" contains rough details (like "has crack, works fine"), polish them into professional sentences.
      2. If "User Notes" is generic, invent realistic student-focused benefits based on the Title.
      3. Use a friendly but professional tone suitable for university students.
      4. Do NOT use hashtags. Do NOT start with "Here is a description". Just start selling.
      5. Mention that it is available for campus pickup implicitly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Graceful fallback on error
    return `Selling my ${title}. It is in ${condition} condition.\n\n${features}\n\nGreat choice for students! Message me if interested.`;
  }
};
