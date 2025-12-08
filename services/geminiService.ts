import { GoogleGenAI, Type } from "@google/genai";
import { ClaimFile, AnalysisResult } from '../types';

// FIX: Ensure API key is loaded properly
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    finalVerdict: {
      type: Type.STRING,
      description: "The final verdict for the claim.",
      enum: ['Valid', 'Invalid', 'Suspicious']
    },
    fraudScore: {
      type: Type.NUMBER,
      description: "Fraud score from 0 to 100."
    },
    summary: {
      type: Type.STRING,
      description: "Summary of findings."
    },
    estimatedPayout: {
      type: Type.STRING,
      description: "Currency string or '$0'."
    },
    policyChecks: {
      type: Type.OBJECT,
      properties: {
        policyActive: { type: Type.BOOLEAN },
        incidentCovered: { type: Type.BOOLEAN },
        timeLimitOk: { type: Type.BOOLEAN }
      }
    }
  },
  required: ["finalVerdict", "fraudScore", "summary", "estimatedPayout", "policyChecks"]
};

export const analyzeDocuments = async (files: ClaimFile[]): Promise<AnalysisResult> => {
  const model = "gemini-flash-latest";

  const imageParts = files.map(file => ({
    inlineData: {
      mimeType: file.type,
      data: file.base64,
    },
  }));

  const textPart = {
    text: `
      You are an advanced AI Insurance Claim Validator system...
      (instructions omitted for brevity)
    `,
  };

  const contents = { parts: [textPart, ...imageParts] };

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    // FIX: Handle undefined response.text safely
    const jsonText = response?.text?.trim();
    if (!jsonText) {
      throw new Error("AI did not return any JSON text.");
    }

    let result: AnalysisResult;
    try {
      result = JSON.parse(jsonText);
    } catch {
      throw new Error("Failed to parse AI response as JSON.");
    }

    // Validate required fields
    if (!result.finalVerdict || typeof result.fraudScore !== "number") {
      throw new Error("AI response is malformed or missing required fields.");
    }

    return result;

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);

    if (error instanceof Error && error.message.includes("SAFETY")) {
      throw new Error("The analysis was blocked due to safety concerns with the uploaded content.");
    }

    throw new Error("Failed to get a valid response from the AI model.");
  }
};
