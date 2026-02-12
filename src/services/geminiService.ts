
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, UserPreferences } from "@/types";
import { analysisResultSchema } from "@/schemas/analysisResult";

export class AnalysisError extends Error {
  constructor(message: string, public readonly code: 'EMPTY_RESPONSE' | 'VALIDATION' | 'API' | 'NETWORK') {
    super(message);
    this.name = 'AnalysisError';
  }
}

export const analyzeKBeauty = async (
  userImageBase64: string,
  celebImageBase64: string,
  isSensitive: boolean,
  prefs: UserPreferences,
  selectedCelebName?: string
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new AnalysisError('API key is not configured. Check your .env.local file.', 'API');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prompt v5.1 — Inclusive K-Beauty Neural Stylist
  const celebContext = selectedCelebName
    ? `The user has selected "${selectedCelebName}" as their style muse.`
    : 'The user uploaded a K-Celeb inspiration photo.';

  const systemInstruction = `
    You are a Global K-Beauty Stylist and Face Analysis Expert (Neural Stylist v5.1).
    Analyze the two images provided:
    1. The user's bare face.
    2. ${celebContext}

    User Profile & Preferences:
    - Environment: ${prefs.environment} (Tailor makeup longevity and finish)
    - Skill Level: ${prefs.skill} (Suggest techniques appropriate for this skill)
    - Desired Mood: ${prefs.mood} (Influence the overall aesthetic direction)
    - Sensitive Skin: ${isSensitive ? 'Yes' : 'No'}

    ═══ INCLUSIVITY DIRECTIVES (MANDATORY) ═══
    1. NEVER suggest lightening or whitening the user's skin tone.
       Use "luminosity" or "radiance" instead of "brightening."
    2. NEVER compare ethnic features as superior or inferior.
    3. Adapt the K-celeb style TO the user's features, not the other way around.
       The user's identity is the constant; the K-style is the variable.
    4. For deep skin tones (L4-L6), increase chromatic saturation of
       product colors by 30-50% to achieve equivalent visual impact.
    5. Preserve the user's natural features (moles, scars, unique markings).
    6. Never use terms: "fix", "correct", "improve" for ethnic features.
       Use: "enhance", "accentuate", "harmonize".

    ═══ MELANIN-AWARE COLOR ADAPTATION ═══
    - L1-L2: Standard K-beauty shades apply directly.
    - L3: Shift warm tones +10% saturation.
    - L4: Replace pastel shades with medium-chroma equivalents. Avoid gray-based foundations.
    - L5: Replace light pastels with deep-chroma variants. Use gold-infused primers to counter ashiness.
    - L6: Maximum chromatic density. Berry > Coral. Black-Cherry > Rose. Deep Gold > Champagne.

    ═══ STRUCTURE-AWARE PLACEMENT ═══
    - Prominent zygomatic arches: Place highlighter on the highest point, not the K-beauty apple position.
    - Deep orbital sockets: Reduce crease color depth, focus on lid.
    - Flat nasal bridges: Skip K-style nose contour; enhance brow bone instead.
    - Full lips (common in L4-L6): Embrace fullness. Never suggest "thinning" techniques.
      Adapt K-gradient lip to full lip shape.

    ═══ ANALYSIS TASKS ═══
    1. Tone Analysis: Melanin index (1-6), Undertone (Warm/Cool/Neutral), Skin Hex Code (average of cheek/forehead/chin as #RRGGBB), skin concerns.
    2. Sherlock Face Analysis: Facial proportions (Upper/Mid/Lower ratio descriptions), Eye Angle (Cat/Puppy/Doe), Bone Structure, Facial Vibe.
    3. Style Transfer Logic: Reinterpret the K-celeb's style for the user's unique ethnicity and bone structure. Apply melanin-aware color adaptation rules above.
    4. Product Curation: 3-4 K-beauty products with match scores and safety ratings. For L4-L6, ensure product shades have sufficient chromatic depth.
    5. Video Curation: 2 tutorials that teach this adapted look at the user's skill level.

    Output MUST be in valid JSON format only.
  `;

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: systemInstruction },
          { text: 'Analyze these two images. Image 1 is the user\'s bare face. Image 2 is the K-Celeb style muse.' },
          { inlineData: { mimeType: 'image/jpeg', data: userImageBase64 } },
          { inlineData: { mimeType: 'image/jpeg', data: celebImageBase64 } }
        ]
      },
      config: {
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tone: {
              type: Type.OBJECT,
              properties: {
                melaninIndex: { type: Type.NUMBER },
                undertone: { type: Type.STRING, description: "Warm, Cool, or Neutral" },
                skinHexCode: { type: Type.STRING, description: "Average skin color as #RRGGBB hex" },
                skinConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
                description: { type: Type.STRING }
              },
              required: ['melaninIndex', 'undertone', 'skinHexCode', 'skinConcerns', 'description']
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
  } catch (err) {
    if (err instanceof Error && err.message.includes('fetch')) {
      throw new AnalysisError('Network error. Please check your connection.', 'NETWORK');
    }
    throw new AnalysisError(
      err instanceof Error ? err.message : 'Failed to communicate with AI service.',
      'API'
    );
  }

  const text = response.text;
  if (!text) {
    throw new AnalysisError('AI returned an empty response. Please try again.', 'EMPTY_RESPONSE');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AnalysisError('AI returned invalid JSON. Please try again.', 'VALIDATION');
  }
  const validated = analysisResultSchema.safeParse(parsed);

  if (!validated.success) {
    console.error('Zod validation errors:', validated.error.issues);
    throw new AnalysisError(
      'AI response did not match expected format. Please try again.',
      'VALIDATION'
    );
  }

  return validated.data;
};
