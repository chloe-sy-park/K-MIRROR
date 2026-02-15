// supabase/functions/analyze-kbeauty/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const ALLOWED_ORIGINS = [
  'https://k-mirror.vercel.app',
  'http://localhost:3000',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

/** Strip the optional data-URI prefix from a base64 string. */
function stripBase64Prefix(b64: string): string {
  const idx = b64.indexOf(',');
  if (idx !== -1 && b64.slice(0, idx).includes('base64')) {
    return b64.slice(idx + 1);
  }
  return b64;
}

/** Build the full Gemini response schema (Type.X -> "X" strings). */
function buildResponseSchema() {
  return {
    type: 'OBJECT',
    properties: {
      tone: {
        type: 'OBJECT',
        properties: {
          melaninIndex: { type: 'NUMBER' },
          undertone: { type: 'STRING', description: 'Warm, Cool, or Neutral' },
          skinHexCode: { type: 'STRING', description: 'Average skin color as #RRGGBB hex' },
          skinConcerns: { type: 'ARRAY', items: { type: 'STRING' } },
          description: { type: 'STRING' },
        },
        required: ['melaninIndex', 'undertone', 'skinHexCode', 'skinConcerns', 'description'],
      },
      sherlock: {
        type: 'OBJECT',
        properties: {
          proportions: {
            type: 'OBJECT',
            properties: {
              upper: { type: 'STRING' },
              middle: { type: 'STRING' },
              lower: { type: 'STRING' },
            },
            required: ['upper', 'middle', 'lower'],
          },
          eyeAngle: { type: 'STRING' },
          boneStructure: { type: 'STRING' },
          facialVibe: { type: 'STRING' },
        },
        required: ['proportions', 'eyeAngle', 'boneStructure', 'facialVibe'],
      },
      kMatch: {
        type: 'OBJECT',
        properties: {
          celebName: { type: 'STRING' },
          adaptationLogic: {
            type: 'OBJECT',
            properties: {
              base: { type: 'STRING' },
              lip: { type: 'STRING' },
              point: { type: 'STRING' },
            },
            required: ['base', 'lip', 'point'],
          },
          styleExplanation: { type: 'STRING' },
          aiStylePoints: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['celebName', 'adaptationLogic', 'styleExplanation', 'aiStylePoints'],
      },
      recommendations: {
        type: 'OBJECT',
        properties: {
          ingredients: { type: 'ARRAY', items: { type: 'STRING' } },
          products: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                brand: { type: 'STRING' },
                price: { type: 'STRING' },
                desc: { type: 'STRING' },
                matchScore: { type: 'NUMBER' },
                ingredients: { type: 'ARRAY', items: { type: 'STRING' } },
                safetyRating: { type: 'STRING' },
              },
              required: ['name', 'brand', 'price', 'desc', 'matchScore', 'ingredients', 'safetyRating'],
            },
          },
          videos: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                creator: { type: 'STRING' },
                views: { type: 'STRING' },
                duration: { type: 'STRING' },
                tag: { type: 'STRING' },
                aiCoaching: { type: 'STRING' },
                matchPercentage: { type: 'NUMBER' },
                skillLevel: { type: 'STRING' },
              },
              required: ['title', 'creator', 'views', 'duration', 'tag', 'aiCoaching', 'matchPercentage', 'skillLevel'],
            },
          },
          sensitiveSafe: { type: 'BOOLEAN' },
        },
        required: ['ingredients', 'products', 'videos', 'sensitiveSafe'],
      },
      fiveMetrics: {
        type: 'OBJECT',
        description: 'K-MIRROR 5 Metrics facial analysis system',
        properties: {
          visualWeight: {
            type: 'OBJECT',
            properties: {
              score: { type: 'NUMBER', description: 'Visual weight score 0-100' },
              eyeWeight: { type: 'NUMBER', description: 'Eye prominence contribution 0-100' },
              lipWeight: { type: 'NUMBER', description: 'Lip prominence contribution 0-100' },
              noseWeight: { type: 'NUMBER', description: 'Nose prominence contribution 0-100' },
              interpretation: { type: 'STRING', description: 'Light (0-40) / Balanced (41-70) / Strong (71-100)' },
            },
            required: ['score', 'eyeWeight', 'lipWeight', 'noseWeight', 'interpretation'],
          },
          canthalTilt: {
            type: 'OBJECT',
            properties: {
              angleDegrees: { type: 'NUMBER', description: 'Eye tilt angle from -10 to +15 degrees' },
              classification: { type: 'STRING', description: 'Negative / Neutral / Positive' },
              symmetry: { type: 'STRING', description: 'Symmetric / Slight asymmetry / Noticeable asymmetry' },
            },
            required: ['angleDegrees', 'classification', 'symmetry'],
          },
          midfaceRatio: {
            type: 'OBJECT',
            properties: {
              ratioPercent: { type: 'NUMBER', description: 'Mid-face ratio as percentage (ideal ~33%)' },
              philtrumRelative: { type: 'STRING', description: 'Short / Average / Long' },
              youthScore: { type: 'NUMBER', description: 'Youth impression score 0-100' },
            },
            required: ['ratioPercent', 'philtrumRelative', 'youthScore'],
          },
          luminosity: {
            type: 'OBJECT',
            properties: {
              current: { type: 'NUMBER', description: 'Current skin luminosity 0-100' },
              potential: { type: 'NUMBER', description: 'Achievable luminosity with K-beauty routine 0-100' },
              textureGrade: { type: 'STRING', description: 'A+ / A / B+ / B / C (glass skin readiness)' },
            },
            required: ['current', 'potential', 'textureGrade'],
          },
          harmonyIndex: {
            type: 'OBJECT',
            properties: {
              overall: { type: 'NUMBER', description: 'Overall facial harmony 0-100' },
              symmetryScore: { type: 'NUMBER', description: 'Left-right symmetry 0-100' },
              optimalBalance: { type: 'STRING', description: 'Which area to enhance for maximum harmony improvement' },
            },
            required: ['overall', 'symmetryScore', 'optimalBalance'],
          },
        },
        required: ['visualWeight', 'canthalTilt', 'midfaceRatio', 'luminosity', 'harmonyIndex'],
      },
      autoTags: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: '3-5 short descriptive tags for auto-categorization',
      },
      youtubeSearch: {
        type: 'OBJECT',
        properties: {
          queries: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: '2-3 Korean YouTube search queries',
          },
          focusPoints: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: '3-5 technique tips to watch for',
          },
          channelSuggestions: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: '2-3 popular Korean beauty YouTube channels',
          },
        },
        required: ['queries', 'focusPoints', 'channelSuggestions'],
      },
    },
    required: ['tone', 'sherlock', 'kMatch', 'recommendations', 'fiveMetrics', 'autoTags', 'youtubeSearch'],
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
        status: 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const {
      userImageBase64,
      celebImageBase64,
      userMimeType,
      celebMimeType,
      isSensitive,
      prefs,
      selectedCelebName,
    } = body as {
      userImageBase64: string;
      celebImageBase64: string;
      userMimeType?: string;
      celebMimeType?: string;
      isSensitive: boolean;
      prefs: { environment: string; skill: string; mood: string };
      selectedCelebName?: string;
    };

    // Build the celeb context string
    const celebContext = selectedCelebName
      ? `The user has selected "${selectedCelebName}" as their style muse.`
      : 'The user uploaded a K-Celeb inspiration photo.';

    // Full system prompt (copied exactly from geminiService.ts lines 72-123)
    const systemInstruction = `
    You are a Global K-Beauty Stylist and Face Analysis Expert (Neural Stylist v6.0).
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
    6. Auto Tags: Generate 3-5 short descriptive tags that categorize this analysis (e.g., "Natural Glow", "Bold Lip", "Cool Tone", "Office Ready", celebrity name). These will be used for automatic board categorization.
    7. YouTube Search Hints: Generate the following for Korean YouTube tutorial curation:
       - queries: 2-3 Korean-language YouTube search queries to find the best matching tutorials (e.g., "한소희 메이크업 튜토리얼", "쿨톤 데일리 메이크업 브이로그")
       - focusPoints: 3-5 specific technique tips the user should watch for in these tutorials (in Korean, e.g., "눈꼬리 라인 올리는 각도", "쿠션 반만 묻혀 얇게 레이어링")
       - channelSuggestions: 2-3 real popular Korean beauty YouTube channel names (e.g., "이사배", "PONY Syndrome", "회사원A")
    8. Five Metrics Analysis (CRITICAL — these metrics power the K-GLOW CARD and SHERLOCK ARCHIVE):
       a) Visual Weight Score (0-100): Measure how much visual presence the eyes, nose, and lips carry on the face.
          Score each feature's contribution (eyeWeight, lipWeight, noseWeight) and compute an overall score.
          Classify: Light (0-40), Balanced (41-70), Strong (71-100).
       b) Canthal Tilt (-10° to +15°): Measure the eye tilt angle. Classify as Negative (<-2°), Neutral (-2° to +5°), Positive (>+5°).
          Note any asymmetry between left and right eyes.
       c) Mid-face Ratio: Calculate the distance from eyes to mouth as a percentage of total face length.
          Ideal K-beauty ratio is ~33%. Assess philtrum length (Short/Average/Long) and overall youth impression (0-100).
       d) Luminosity Score: Rate current skin luminosity (0-100) based on skin clarity, glow, and texture.
          Estimate potential score achievable with a K-beauty glass skin routine. Grade texture: A+ (flawless) to C (needs work).
       e) Harmony Index: Overall facial proportion harmony (0-100). Measure left-right symmetry (0-100).
          Identify which single area, if enhanced, would most improve overall harmony.

    Output MUST be in valid JSON format only.
  `;

    // Strip base64 prefixes if present
    const userImage = stripBase64Prefix(userImageBase64);
    const celebImage = stripBase64Prefix(celebImageBase64);

    // Build Gemini request body
    const geminiRequestBody = {
      contents: [
        {
          parts: [
            { text: systemInstruction },
            {
              text: "Analyze these two images. Image 1 is the user's bare face. Image 2 is the K-Celeb style muse.",
            },
            { inlineData: { mimeType: userMimeType || 'image/jpeg', data: userImage } },
            { inlineData: { mimeType: celebMimeType || 'image/jpeg', data: celebImage } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: buildResponseSchema(),
      },
    };

    // Call Gemini REST API with 45s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45_000);

    let geminiRes: Response;
    try {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiRequestBody),
          signal: controller.signal,
        },
      );
    } catch (fetchErr) {
      if ((fetchErr as Error).name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'Gemini API request timed out (45s)' }), {
          status: 504,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        });
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error (${geminiRes.status})`, details: errBody }),
        {
          status: geminiRes.status,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        },
      );
    }

    const geminiData = await geminiRes.json();

    // Extract the generated text from Gemini response
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return new Response(JSON.stringify({ error: 'Gemini returned an empty response' }), {
        status: 502,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Parse the JSON text and return it
    const result = JSON.parse(text);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  }
});
