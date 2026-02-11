
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number; // cents (e.g. 4500 = $45.00)
  priceDisplay: string; // formatted (e.g. "$45.00")
  desc: string;
  matchScore: number;
  ingredients: string[];
  safetyRating: string; // e.g., "EWG Green", "Vegan"
  category: 'base' | 'lip' | 'eye' | 'skincare' | 'tool';
  imageUrl?: string;
  melaninRange: [number, number]; // min-max melanin index this product works for
}

/** Lightweight product reference used in AI recommendations */
export interface ProductRecommendation {
  name: string;
  brand: string;
  price: string;
  desc: string;
  matchScore: number;
  ingredients: string[];
  safetyRating: string;
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
  environment: 'Office' | 'Outdoor' | 'Studio';
  skill: 'Beginner' | 'Intermediate' | 'Pro';
  mood: 'Natural' | 'Elegant' | 'Powerful';
}

export interface AnalysisResult {
  tone: {
    melaninIndex: number; // 1-6
    undertone: 'Warm' | 'Cool' | 'Neutral';
    skinHexCode: string; // e.g. "#C8A98B"
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
    products: ProductRecommendation[];
    videos: VideoRecommendation[];
    sensitiveSafe: boolean;
  };
}


export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingMethod: 'dhl' | 'ems';
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  createdAt: string;
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
