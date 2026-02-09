
export interface Product {
  name: string;
  brand: string;
  price: string;
  desc: string;
  matchScore: number;
  ingredients: string[];
  safetyRating: string; // e.g., "EWG Green", "Vegan"
}

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

export interface UserPreferences {
  environment: 'Office' | 'Outdoor' | 'Night-out';
  skill: 'Beginner' | 'Intermediate' | 'Pro';
  mood: 'Natural' | 'Elegant' | 'Powerful';
}

export interface AnalysisResult {
  tone: {
    melaninIndex: number; // 1-6
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
    aiStylePoints: string[]; // Key takeaways for the card hover
  };
  recommendations: {
    ingredients: string[];
    products: Product[];
    videos: VideoRecommendation[];
    sensitiveSafe: boolean;
  };
}

export enum AppStep {
  ONBOARDING,
  IDLE,
  ANALYZING,
  RESULT,
  MUSEBOARD,
  SETTINGS,
  STYLIST,
  PARTNER_DASHBOARD
}

export interface MuseBoard {
  id: string;
  name: string;
  icon: string;
  count: number;
  aiSummary: string;
}

export interface SavedMuse {
  id: string;
  userImage: string;
  celebImage: string;
  celebName: string;
  date: string;
  vibe: string;
  boardId?: string;
  aiStylePoints: string[];
}
