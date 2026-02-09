
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, UserPreferences } from "../types";

export const analyzeKBeauty = async (
  userImageBase64: string,
  celebImageBase64: string,
  isSensitive: boolean,
  preferences: UserPreferences
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const sophisticatedContext = `
[User Profile Expansion]
- Environment: ${preferences.environment}
- Skill Level: ${preferences.skill}
- Desired Impression: ${preferences.mood}

위 정보를 바탕으로:
1. 환경이 ${preferences.environment === 'Office' ? '건조한 사무실' : preferences.environment === 'Outdoor' ? '활동적인 야외' : '조명이 강한 파티'}라면 그에 맞는 제형(수분 앰플 함유 또는 롱래스팅)을 추천하세요. 특히 건조하다면 픽서보다는 수분 앰플 함유 제형을 추천하세요.
2. 메이크업 숙련도가 ${preferences.skill}임을 고려하여, 숙련도가 낮다면 브러시 대신 퍼프를 활용한 기법을 설명하고, 전문가라면 정교한 레이어링 기법을 제안하세요.
3. 인상이 '${preferences.mood}'하길 원한다는 점을 스타일링에 적극 반영하세요. 특히 'Powerful'을 원한다면 눈매를 더 선명하게 강조하는 K-아이돌 테크닉을 적용하고, 'Natural'을 원한다면 투명한 광채 위주로 설명하세요.
`;

  const systemInstruction = `
    You are the Senior AI Stylist for K-Mirror, a global K-Beauty laboratory.
    Your mission is to analyze the user's portrait and a K-Celeb inspiration photo.
    
    ${sophisticatedContext}

    Strictly follow this analysis logic:
    1. [Visual Analysis]: Use Fitzpatrick scale (1-6) for melanin index, determine undertone, and facial proportions.
    2. [Identity Preservation]: Preserve and celebrate the user's natural melanin level. Suggest ethnic-inclusive K-beauty adaptations.
    3. [K-Style Translation]: Reinterpret the celeb look based on the user's specific context provided in the User Profile Expansion.
    4. [Ingredient Check]: Recommend K-beauty ingredients based on sensitivity: ${isSensitive}.

    CRITICAL: Output 'aiStylePoints' in 'kMatch' as exactly 3 short strings.
    Response must be valid JSON only.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: userImageBase64 } },
        { inlineData: { mimeType: 'image/jpeg', data: celebImageBase64 } },
        { text: "Analyze the facial architecture and skin tone. Reinterpret the celebrity look for this user's specific environment, skill level, and desired mood." }
      ]
    },
    config: {
      systemInstruction: systemInstruction,
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
              sensitiveSafe: { type: Type.BOOLEAN }
            },
            required: ['ingredients', 'products', 'sensitiveSafe']
          }
        },
        required: ['tone', 'sherlock', 'kMatch', 'recommendations']
      }
    }
  });

  return JSON.parse(response.text);
};
