
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeKBeauty = async (
  userImageBase64: string,
  celebImageBase64: string,
  isSensitive: boolean
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are the Senior AI Stylist for K-Mirror, a global K-Beauty laboratory specializing in ethnic-inclusive aesthetics.
    Your mission is to analyze the user's portrait and a K-Celeb inspiration photo to generate a high-end "Professional Stylist Report."
    
    Strictly follow this 5-stage analysis logic:
    1. [Visual Analysis]: Use the Fitzpatrick scale (1-6) for melanin, determine undertone, facial proportions (Upper/Mid/Lower), and eye geometry (Cat/Droopy/Doe).
    2. [Identity Preservation]: CELEBRATE the user's natural skin tone. DO NOT suggest whitening or lightening. Affirm that the analysis is based on preserving heritage.
    3. [K-Style Translation]: Reinterpret the celeb look for the user's ethnicity. If the celeb wears 'Translucent Pink' but the user has deep skin, suggest 'Deep Mauve Glaze' or 'Rich Berry' to ensure vibrancy without ashy tones.
    4. [Ingredient Check]: Recommend specific K-beauty active ingredients based on the user's concerns (and sensitivity: ${isSensitive}). Align with Hwahae safety standards.
    5. [Tutorial Adaptation]: Provide 2 tutorial recommendations with specific 'AI Coaching' notes that explain how to modify the tutorial's technique for the user's specific bone structure and tone.

    Your response must be valid JSON only.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: systemInstruction },
        { inlineData: { mimeType: 'image/jpeg', data: userImageBase64 } },
        { inlineData: { mimeType: 'image/jpeg', data: celebImageBase64 } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tone: {
            type: Type.OBJECT,
            properties: {
              melaninIndex: { type: Type.NUMBER },
              undertone: { type: Type.STRING },
              skinConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING }
            },
            required: ['melaninIndex', 'undertone', 'skinConcerns', 'description']
          },
          sherlock: {
            type: Type.OBJECT,
            properties: {
              proportions: {
                type: Type.OBJECT,
                properties: {
                  upper: { type: Type.STRING },
                  middle: { type: Type.STRING },
                  lower: { type: Type.STRING }
                }
              },
              eyeAngle: { type: Type.STRING },
              boneStructure: { type: Type.STRING },
              facialVibe: { type: Type.STRING }
            },
            required: ['proportions', 'eyeAngle', 'boneStructure', 'facialVibe']
          },
          kMatch: {
            type: Type.OBJECT,
            properties: {
              celebName: { type: Type.STRING },
              adaptationLogic: {
                type: Type.OBJECT,
                properties: {
                  base: { type: Type.STRING },
                  lip: { type: Type.STRING },
                  point: { type: Type.STRING }
                }
              },
              styleExplanation: { type: Type.STRING }
            },
            required: ['celebName', 'adaptationLogic', 'styleExplanation']
          },
          recommendations: {
            type: Type.OBJECT,
            properties: {
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              products: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    brand: { type: Type.STRING },
                    price: { type: Type.STRING },
                    desc: { type: Type.STRING },
                    matchScore: { type: Type.NUMBER },
                    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    safetyRating: { type: Type.STRING }
                  },
                  required: ['name', 'brand', 'price', 'desc', 'matchScore', 'ingredients', 'safetyRating']
                }
              },
              videos: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    creator: { type: Type.STRING },
                    views: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    tag: { type: Type.STRING },
                    aiCoaching: { type: Type.STRING },
                    matchPercentage: { type: Type.NUMBER },
                    skillLevel: { type: Type.STRING }
                  },
                  required: ['title', 'creator', 'views', 'duration', 'tag', 'aiCoaching', 'matchPercentage', 'skillLevel']
                }
              },
              sensitiveSafe: { type: Type.BOOLEAN }
            },
            required: ['ingredients', 'products', 'videos', 'sensitiveSafe']
          }
        },
        required: ['tone', 'sherlock', 'kMatch', 'recommendations']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  return JSON.parse(text) as AnalysisResult;
};
