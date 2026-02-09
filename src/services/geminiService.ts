import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, UserPreferences } from "../types";

/**
 * K-MIRROR System Prompt
 * The core AI directive for the Gemini-powered beauty analysis engine.
 */
const K_MIRROR_SYSTEM_PROMPT = `
You are the world's foremost K-Beauty expert, operating as the AI engine for K-MIRROR.

CORE DIRECTIVES:
1. Extract melanin index (Fitzpatrick 1-6) and skeletal bone structure from the user's portrait.
2. Follow the 'Inclusion Guard' policy: regardless of ethnicity, translate and adapt K-beauty colors
   so they render beautifully on the user's specific skin tone.
3. Output MUST be strict JSON. Include recommended product names and YouTube tutorial keywords
   matched to the user's detected style.

ANALYSIS PROTOCOL:
- [Tone Analysis]: Fitzpatrick scale melanin index, undertone detection, skin concern mapping.
- [Sherlock Scan]: Facial proportions (upper/middle/lower thirds), eye angle measurement,
  bone structure classification, and overall facial vibe assessment.
- [K-Style Translation]: Reinterpret the celebrity reference look to suit the user's unique
  facial architecture and melanin level. Never suggest "lightening" — always adapt the palette.
- [Product Intelligence]: Match K-beauty products considering sensitivity flags and environment context.

CRITICAL RULES:
- 'aiStylePoints' in 'kMatch' must be exactly 3 short, punchy strings.
- All product prices must be in USD format (e.g., "$24.00").
- Videos array must contain at least 2 recommendations with YouTube-searchable keywords.
`;

export const analyzeKBeauty = async (
  userImageBase64: string,
  celebImageBase64: string,
  isSensitive: boolean,
  preferences: UserPreferences
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const userContext = `
[User Profile Context]
- Environment: ${preferences.environment} ${preferences.environment === 'Office' ? '(dry, air-conditioned — prioritize hydrating formulas over setting sprays)' : preferences.environment === 'Outdoor' ? '(humid — prioritize long-wear, sweat-proof formulas)' : '(studio lighting — prioritize photo-finish, luminous formulas)'}
- Skill Level: ${preferences.skill} ${preferences.skill === 'Beginner' ? '(recommend puff/cushion application over brushes)' : '(can handle advanced brush techniques)'}
- Desired Mood: ${preferences.mood} ${preferences.mood === 'Powerful' ? '(emphasize sharp eye contour, K-idol technique)' : preferences.mood === 'Natural' ? '(soft, dewy, glass-skin focus)' : '(refined, classic editorial look)'}
- Sensitive Skin Mode: ${isSensitive ? 'ACTIVE — exclude fragrances, essential oils, and known irritants' : 'inactive'}
`;

  const systemInstruction = `${K_MIRROR_SYSTEM_PROMPT}\n${userContext}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: userImageBase64 } },
        { inlineData: { mimeType: 'image/jpeg', data: celebImageBase64 } },
        { text: "Analyze the facial architecture and skin tone of the first image. Using the second image as the style reference, create a full K-beauty translation report adapted to this user's unique bone structure, melanin level, environment, and skill level." },
      ],
    },
    config: {
      systemInstruction,
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
              description: { type: Type.STRING },
            },
            required: ['melaninIndex', 'undertone', 'skinConcerns', 'description'],
          },
          sherlock: {
            type: Type.OBJECT,
            properties: {
              proportions: {
                type: Type.OBJECT,
                properties: {
                  upper: { type: Type.STRING },
                  middle: { type: Type.STRING },
                  lower: { type: Type.STRING },
                },
                required: ['upper', 'middle', 'lower'],
              },
              eyeAngle: { type: Type.STRING },
              boneStructure: { type: Type.STRING },
              facialVibe: { type: Type.STRING },
            },
            required: ['proportions', 'eyeAngle', 'boneStructure', 'facialVibe'],
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
                  point: { type: Type.STRING },
                },
                required: ['base', 'lip', 'point'],
              },
              styleExplanation: { type: Type.STRING },
              aiStylePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['celebName', 'adaptationLogic', 'styleExplanation', 'aiStylePoints'],
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
                    safetyRating: { type: Type.STRING },
                  },
                  required: ['name', 'brand', 'price', 'desc', 'matchScore', 'ingredients', 'safetyRating'],
                },
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
                    skillLevel: { type: Type.STRING },
                  },
                  required: ['title', 'creator', 'views', 'duration', 'tag', 'aiCoaching', 'matchPercentage', 'skillLevel'],
                },
              },
              sensitiveSafe: { type: Type.BOOLEAN },
            },
            required: ['ingredients', 'products', 'videos', 'sensitiveSafe'],
          },
        },
        required: ['tone', 'sherlock', 'kMatch', 'recommendations'],
      },
    },
  });

  return JSON.parse(response.text!);
};
