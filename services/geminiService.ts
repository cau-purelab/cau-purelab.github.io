
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client using a named parameter with process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askLabAssistant = async (query: string) => {
  try {
    // Generate content using the recommended model for text-based tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: `You are the SVIL (Security Visual Intelligence Lab) AI Assistant. 
        The lab is led by Prof. Seungmin Rho at Chung-Ang University. 
        Research areas include Machine Unlearning (Generative Models, LLMs), Secure Computer Vision, and Trustworthy AI.
        Language: English.
        Answer professionally, academic-focused, and concisely. 
        Highlight the lab's focus on privacy and AI security.
        If users ask about the PI, inform them he is Prof. Seungmin Rho (smrho@cau.ac.kr).`,
      },
    });
    // The .text property directly returns the generated string output
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The assistant is currently offline.";
  }
};
