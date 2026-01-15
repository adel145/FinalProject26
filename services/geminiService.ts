import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini
// Note: In a production React App, this key would be proxied through a backend to protect it.
// For this demo, we assume it's available in the environment or user input (handled in UI via placeholder).
const getAiClient = () => {
    const apiKey = process.env.API_KEY || ''; 
    if (!apiKey) {
        console.warn("No API Key found. AI features will respond with mock data.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const generateAIResponse = async (
    history: { role: string; parts: string }[],
    imageParts?: { inlineData: { data: string; mimeType: string } }[]
): Promise<string> => {
    const ai = getAiClient();
    
    // Fallback for demo if no key
    if (!ai) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("I'm the Miktsoan AI (Demo Mode). Since there is no API Key configured, I can't analyze your request deeply, but I'd suggest checking out our top rated Plumbers or Electricians via the search tab!");
            }, 1000);
        });
    }

    try {
        const model = ai.models;
        const systemInstruction = `
            You are "Miktsoan AI", a helpful home service expert assistant.
            Your goal is to help users diagnose home maintenance issues and recommend professionals.
            
            Rules:
            1. Be concise, friendly, and professional.
            2. If the user uploads an image, analyze it for damage (water leak, burnt outlet, etc.) and estimate severity (Low/Medium/High).
            3. Suggest a category of professional (Plumber, Electrician, etc.) based on the problem.
            4. Provide a rough price range estimate in NIS (New Israeli Shekels) if possible based on standard market rates.
            5. Ask clarifying questions if the problem is unclear.
        `;

        const contents = [];
        
        // Add history (simplified for this stateless call, normally we'd use ai.chats)
        // We will just send the last message + image for this stateless MVP wrapper
        const lastMsg = history[history.length - 1];
        
        const messageParts: any[] = [{ text: lastMsg.parts }];
        if (imageParts && imageParts.length > 0) {
            messageParts.push(imageParts[0]); // Attach image to the current prompt
        }

        const response: GenerateContentResponse = await model.generateContent({
            model: 'gemini-2.5-flash-image', // Good for both text and image
            contents: {
                parts: messageParts
            },
            config: {
                systemInstruction: systemInstruction,
                maxOutputTokens: 500,
            }
        });

        return response.text || "I couldn't generate a response. Please try again.";

    } catch (error) {
        console.error("AI Error:", error);
        return "I'm having trouble connecting to the brain right now. Please try again later.";
    }
};