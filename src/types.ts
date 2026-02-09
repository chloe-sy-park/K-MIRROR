/* ── Product ─────────────────────────────────────────────── */

export interface Product {
  name: string;
  brand: string;
  price: string;
  desc: string;
  matchScore: number;
  ingredients: string[];
  safetyRating: string;
}

/* ── Video Recommendation ───────────────────────────────── */

export interface VideoRecommendation {
  title: string;
  creator: string;
  views: string;
  duration: string;
  tag: string;
  aiCoaching: string;
  matchPercentage: number;
  skillLevel: string;
}

/* ── User Preferences (Onboarding output) ───────────────── */

export interface UserPreferences {
  environment: 'Office' | 'Outdoor' | 'Night-out';
  skill: 'Beginner' | 'Intermediate' | 'Pro';
  mood: 'Natural' | 'Elegant' | 'Powerful';
}

/* ── Gemini Analysis Result ─────────────────────────────── */

export interface AnalysisResult {
  tone: {
    melaninIndex: number;          // Fitzpatrick 1-6
    undertone: 'Warm' | 'Cool' | 'Neutral';
    skinConcerns: string[];
    description: string;
  };
  sherlock: {
    proportions: {
      upper: string;
      middle: string;
      lower: string;
    };
    eyeAngle: string;
    boneStructure: string;
    facialVibe: string;
  };
  kMatch: {
    celebName: string;
    adaptationLogic: {
      base: string;
      lip: string;
      point: string;
    };
    styleExplanation: string;
    aiStylePoints: string[];
  };
  recommendations: {
    ingredients: string[];
    products: Product[];
    videos: VideoRecommendation[];
    sensitiveSafe: boolean;
  };
}

/* ── App Navigation ─────────────────────────────────────── */

export enum AppStep {
  ONBOARDING,
  IDLE,
  ANALYZING,
  RESULT,
  CHECKOUT,
  MUSEBOARD,
  SETTINGS,
  STYLIST,
  PARTNER_DASHBOARD,
}

/* ── Chat (Live Translation) ────────────────────────────── */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'expert' | 'system';
  text: string;
  translatedText?: string;
  timestamp: Date;
  productRecommendation?: Product;
}

/* ── Expert ──────────────────────────────────────────────── */

export interface Expert {
  id: string;
  name: string;
  specialty: string;
  desc: string;
  img: string;
  rate: string;
  tag: string;
}
