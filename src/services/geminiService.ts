import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-pro" });
}

export const generateResponse = async (prompt: string): Promise<string> => {
  if (!model) {
    if (!API_KEY) {
      return "Error: API Key is missing. Please set VITE_GEMINI_API_KEY in your environment.";
    }
    return "Error: AI Model initialization failed.";
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but I encountered an error processing your request. Please try again later.";
  }
};