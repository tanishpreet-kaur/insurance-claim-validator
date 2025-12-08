import { GoogleGenAI, Type } from "@google/genai";
import { ClaimFile, AnalysisResult } from '../types';

// FIX: Per coding guidelines, the API key must be obtained exclusively from process.env.API_KEY.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // FIX: Updated error message to reflect the correct environment variable.
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        finalVerdict: {
            type: Type.STRING,
            description: "The final verdict for the claim. Must be one of: 'Valid', 'Invalid', or 'Suspicious'.",
            enum: ['Valid', 'Invalid', 'Suspicious'],
        },
        fraudScore: {
            type: Type.NUMBER,
            description: "A fraud probability score from 0 to 100.",
        },
        summary: {
            type: Type.STRING,
            description: "A concise summary of the findings and the reason for the final verdict. This summary should include any identified issues, inconsistencies, or missing documents.",
        },
        estimatedPayout: {
            type: Type.STRING,
            description: "The estimated payout amount, formatted as a currency string (e.g., '$45,000'). If invalid or fraudulent, this should be '$0'.",
        },
        policyChecks: {
            type: Type.OBJECT,
            properties: {
                policyActive: { type: Type.BOOLEAN, description: "Is the policy active?" },
                incidentCovered: { type: Type.BOOLEAN, description: "Is the incident type covered?" },
                timeLimitOk: { type: Type.BOOLEAN, description: "Was the claim filed within the time limit?" },
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
      You are an advanced AI Insurance Claim Validator system composed of a multi-agent team. Your task is to analyze the provided insurance claim documents and produce a detailed validation report in JSON format.

      Here are the agents and their responsibilities:
      1.  **OCR Extractor Agent**: Extract all key information from the documents (e.g., claimant name, policy number, incident date, claim amount, medical details, vehicle info, invoice details).
      2.  **Policy Rule Checker Agent**: Check the extracted data against these rules:
          - Policy must be active.
          - The claim must be filed within 90 days of the incident.
          - The incident type (e.g., auto accident, property damage) must be covered.
          - Personal details must match across documents.
      3.  **Fraud Pattern Analyzer Agent**: Analyze all data for common fraud patterns:
          - Mismatched dates between documents.
          - Unusually high claim amounts for the incident type.
          - Use of suspicious keywords.
          - Evidence of document tampering (analyze images).
          - Inconsistencies in the description of the incident.
      4.  **Decision & Report Agent**: Consolidate all findings into a final report. Calculate a fraud score (0-100), determine a final verdict, and write a clear summary.

      Analyze the provided documents and return a single JSON object that strictly adheres to the provided schema. Do not include any text outside of the JSON object.
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

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Basic validation to ensure the result matches the expected structure
    if (!result.finalVerdict || typeof result.fraudScore !== 'number') {
        throw new Error("AI response is malformed or missing required fields.");
    }

    return result as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("The analysis was blocked due to safety concerns with the uploaded content.");
    }
    throw new Error("Failed to get a valid response from the AI model.");
  }
};