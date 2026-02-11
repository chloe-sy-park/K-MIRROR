
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, UserPreferences } from "@/types";

// Fix: Updated function signature to accept 4 arguments as expected by App.tsx
export const analyzeKBeauty = async (
  userImageBase64: string,
  celebImageBase64: string,
  isSensitive: boolean,
  prefs: UserPreferences
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are a Global K-Beauty Stylist and Face Analysis Expert. 
    Analyze the two images provided:
    1. The user's bare face.
    2. A K-Celeb inspiration photo.

    User Profile & Preferences:
    - Environment: ${prefs.environment} (Tailor makeup longevity and finish for this environment)
    - Skill Level: ${prefs.skill} (Suggest techniques appropriate for this skill)
    - Desired Mood: ${prefs.mood} (Influence the overall aesthetic direction)
    - Sensitive Skin: ${isSensitive ? 'Yes' : 'No'}

    Perform the following analysis:
    - Tone Analysis: Melanin index (1-6), Undertone (Warm/Cool/Neutral), and primary skin concerns.
    - Sherlock Face Analysis: Evaluate facial proportions (Upper/Mid/Lower), Eye Angle (Cat/Puppy/Doe), and Bone Structure (Sculpted/Soft).
    - Style Transfer Logic: Reinterpret the K-celeb's makeup/style for the user's unique ethnicity and skin tone. Suggest inclusive K-beauty techniques.
    - Sensitivity Filter: If the user is sensitive, recommend soothing K-beauty ingredients.
    - Product Curation (Hwahae Style): Recommend 3-4 specific K-beauty products with match scores and safety ratings.
    - Video Curation: Suggest 2 relevant YouTube-style tutorial topics that specifically teach how to achieve this adapted look.

    Output MUST be in valid JSON format only.
  `;

  const response = await ai.models.generateContent({
    // Using gemini-3-pro-preview for complex facial analysis and style transfer tasks
    model: 'gemini-3-pro-preview',
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
              undertone: { type: Type.STRING, description: "Warm, Cool, or Neutral" },
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
                },
                required: ['upper', 'middle', 'lower']
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
                },
                required: ['base', 'lip', 'point']
              },
              styleExplanation: { type: Type.STRING },
              aiStylePoints: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['celebName', 'adaptationLogic', 'styleExplanation', 'aiStylePoints']
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

  // Correctly accessing text property from the response
  const text = response.text;
  if (!text) throw new Error("Empty response from AI");
  return JSON.parse(text) as AnalysisResult;
};
