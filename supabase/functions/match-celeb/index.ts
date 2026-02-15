// supabase/functions/match-celeb/index.ts
//
// 추구미 셀럽 매칭 Edge Function
//
// 사용자의 5 Metrics와 셀럽 ID를 받아 celeb_makeup_dna 테이블에서
// 셀럽 데이터를 조회하고, 메트릭 간 갭을 계산한 뒤 Gemini로
// 맞춤 솔루션을 생성하여 반환한다.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// -- CORS --

const ALLOWED_ORIGINS = [
  'https://k-mirror.vercel.app',
  'http://localhost:3000',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function jsonResponse(body: Record<string, unknown>, status: number, req: Request): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}

// -- 타입 --

/** 5 Metrics: 0-100 범위의 수치 */
interface FiveMetrics {
  visualWeight: number;
  canthalTilt: number;
  midfaceRatio: number;
  luminosity: number;
  harmony: number;
}

interface PerMetricGap {
  metric: string;
  userValue: number;
  celebValue: number;
  gap: number;
  normalizedGap: number;
}

interface MatchResult {
  matchRate: number;
  celeb: {
    celebId: string;
    celebName: string;
    category: string;
    signatureLook: string | null;
  };
  perMetricGap: PerMetricGap[];
  solutions: string[];
  difficulty: 'easy' | 'moderate' | 'challenging';
}

// -- 상수 --

const METRIC_KEYS: (keyof FiveMetrics)[] = [
  'visualWeight',
  'canthalTilt',
  'midfaceRatio',
  'luminosity',
  'harmony',
];

const METRIC_LABELS: Record<keyof FiveMetrics, string> = {
  visualWeight: 'Visual Weight',
  canthalTilt: 'Canthal Tilt',
  midfaceRatio: 'Mid-face Ratio',
  luminosity: 'Luminosity',
  harmony: 'Harmony',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// -- 갭 계산 --

function calculatePerMetricGap(userMetrics: FiveMetrics, celebMetrics: FiveMetrics): PerMetricGap[] {
  return METRIC_KEYS.map((key) => {
    const userValue = userMetrics[key] ?? 0;
    const celebValue = celebMetrics[key] ?? 0;
    const gap = userValue - celebValue;
    const normalizedGap = Math.abs(gap);

    return {
      metric: METRIC_LABELS[key],
      userValue,
      celebValue,
      gap,
      normalizedGap,
    };
  });
}

function calculateMatchRate(gaps: PerMetricGap[]): number {
  const totalGaps = gaps.length;
  if (totalGaps === 0) return 100;

  const avgNormalizedGap = gaps.reduce((sum, g) => sum + g.normalizedGap, 0) / totalGaps;
  return Math.max(0, Math.min(100, Math.round(100 - avgNormalizedGap)));
}

function determineDifficulty(avgGap: number): 'easy' | 'moderate' | 'challenging' {
  if (avgGap < 15) return 'easy';
  if (avgGap < 30) return 'moderate';
  return 'challenging';
}

// -- Gemini 솔루션 생성 --

async function generateSolutions(
  gaps: PerMetricGap[],
  celebName: string,
  signatureLook: string | null,
): Promise<string[]> {
  if (!GEMINI_API_KEY) {
    return ['Gemini API key not configured. Gap analysis is available but personalized solutions require API access.'];
  }

  const gapDescription = gaps
    .map((g) => `${g.metric}: user=${g.userValue}, celeb=${g.celebValue}, gap=${g.gap}`)
    .join('\n');

  const prompt = `You are a K-Beauty makeup expert specializing in the "추구미" (追求美) concept —
adapting celebrity makeup styles to individual facial features.

Celebrity: ${celebName}
${signatureLook ? `Signature Look: ${signatureLook}` : ''}

The user wants to achieve this celebrity's makeup style. Here are the gap measurements
between the user's facial metrics and the celebrity's metrics (scale 0-100):

${gapDescription}

Metric definitions:
- Visual Weight: Overall perceived heaviness/density of makeup features
- Canthal Tilt: Eye angle direction (higher = more upturned/cat-eye)
- Mid-face Ratio: Proportional length of mid-face area
- Luminosity: Skin radiance and light-reflecting quality
- Harmony: Overall facial feature balance and symmetry

For each metric gap, provide a specific, actionable makeup technique to bridge the
difference and help the user achieve the celebrity's look while respecting their
natural features.

IMPORTANT:
- Never suggest changing the user's natural features
- Use "enhance" and "harmonize" instead of "fix" or "correct"
- Adapt the celeb style TO the user, not the other way around
- For deep skin tones, suggest higher chromatic saturation

Return a JSON array of exactly 5 strings, one solution per metric in order:
[Visual Weight, Canthal Tilt, Mid-face Ratio, Luminosity, Harmony]

Each string should be 1-2 concise sentences with a specific technique.
Return ONLY the JSON array, no other text.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`Gemini API error (${response.status}):`, errBody);
      return gaps.map((g) => `Bridge ${g.metric} gap of ${g.gap > 0 ? '+' : ''}${g.gap} with targeted technique adjustments.`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Gemini returned empty response');
      return gaps.map((g) => `Bridge ${g.metric} gap of ${g.gap > 0 ? '+' : ''}${g.gap} with targeted technique adjustments.`);
    }

    const parsed = JSON.parse(text);

    if (Array.isArray(parsed) && parsed.length === 5 && parsed.every((s: unknown) => typeof s === 'string')) {
      return parsed as string[];
    }

    console.error('Gemini response was not a 5-element string array:', parsed);
    return gaps.map((g) => `Bridge ${g.metric} gap of ${g.gap > 0 ? '+' : ''}${g.gap} with targeted technique adjustments.`);
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      console.error('Gemini API request timed out (30s)');
    } else {
      console.error('Gemini API error:', err);
    }
    return gaps.map((g) => `Bridge ${g.metric} gap of ${g.gap > 0 ? '+' : ''}${g.gap} with targeted technique adjustments.`);
  } finally {
    clearTimeout(timeoutId);
  }
}

// -- 입력 검증 --

function isValidFiveMetrics(obj: unknown): obj is FiveMetrics {
  if (typeof obj !== 'object' || obj === null) return false;

  const metrics = obj as Record<string, unknown>;
  return METRIC_KEYS.every((key) => {
    const value = metrics[key];
    return typeof value === 'number' && value >= 0 && value <= 100;
  });
}

// -- 메인 핸들러 --

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  // POST만 허용
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405, req);
  }

  // 환경변수 확인
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({ error: 'Supabase 환경변수가 설정되지 않았습니다' }, 500, req);
  }

  // 요청 파싱
  let userFiveMetrics: FiveMetrics;
  let celebId: string;

  try {
    const body = await req.json();
    userFiveMetrics = body.user_five_metrics;
    celebId = body.celeb_id;
  } catch {
    return jsonResponse({ error: '잘못된 JSON 요청입니다' }, 400, req);
  }

  // 필수 필드 검증
  if (!celebId || typeof celebId !== 'string') {
    return jsonResponse({ error: 'celeb_id가 필요합니다 (문자열)' }, 400, req);
  }

  if (!isValidFiveMetrics(userFiveMetrics)) {
    return jsonResponse(
      {
        error: 'user_five_metrics가 올바르지 않습니다. visualWeight, canthalTilt, midfaceRatio, luminosity, harmony (0-100 숫자) 필요',
      },
      400,
      req,
    );
  }

  // Supabase 클라이언트 생성 및 셀럽 데이터 조회
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: celebData, error: dbError } = await supabase
    .from('celeb_makeup_dna')
    .select('celeb_id, celeb_name, category, signature_look, five_metrics')
    .eq('celeb_id', celebId)
    .single();

  if (dbError) {
    if (dbError.code === 'PGRST116') {
      return jsonResponse({ error: `셀럽을 찾을 수 없습니다: ${celebId}` }, 404, req);
    }
    return jsonResponse({ error: `데이터베이스 조회 실패: ${dbError.message}` }, 500, req);
  }

  // 셀럽 five_metrics 검증
  const celebFiveMetrics = celebData.five_metrics as Record<string, unknown> | null;

  if (!isValidFiveMetrics(celebFiveMetrics)) {
    return jsonResponse(
      { error: `셀럽 ${celebId}의 five_metrics 데이터가 올바르지 않습니다` },
      500,
      req,
    );
  }

  // 갭 계산
  const perMetricGap = calculatePerMetricGap(userFiveMetrics, celebFiveMetrics);
  const matchRate = calculateMatchRate(perMetricGap);
  const avgGap = perMetricGap.reduce((sum, g) => sum + g.normalizedGap, 0) / perMetricGap.length;
  const difficulty = determineDifficulty(avgGap);

  // Gemini로 솔루션 생성
  const solutions = await generateSolutions(perMetricGap, celebData.celeb_name, celebData.signature_look);

  // 결과 반환
  const result: MatchResult = {
    matchRate,
    celeb: {
      celebId: celebData.celeb_id,
      celebName: celebData.celeb_name,
      category: celebData.category,
      signatureLook: celebData.signature_look,
    },
    perMetricGap,
    solutions,
    difficulty,
  };

  return jsonResponse(result as unknown as Record<string, unknown>, 200, req);
});
