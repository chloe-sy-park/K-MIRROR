import { AnalysisResult } from '../types';

/**
 * K-MIRROR Mock Data
 * Realistic analysis result for UI development without Gemini API.
 */
export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  tone: {
    melaninIndex: 3,
    undertone: 'Warm',
    skinConcerns: ['Hyperpigmentation', 'Dehydration', 'Uneven Texture'],
    description:
      'A warm-toned complexion with golden undertones at Fitzpatrick III. The skin shows slight dehydration in the T-zone with minimal sun damage. Excellent candidate for glass-skin protocols with warm-adapted palettes. The Inclusion Guard shifts all standard K-beauty swatches +2 warmth to ensure melanin harmony.',
  },
  sherlock: {
    proportions: { upper: '34%', middle: '33%', lower: '33%' },
    eyeAngle: '+8°',
    boneStructure: 'High Cheekbone / Soft Jaw',
    facialVibe: 'Elegant Minimalist',
  },
  kMatch: {
    celebName: 'Kim Tae-ri',
    adaptationLogic: {
      base: 'Dewy Cushion N23 → Warm-shift to W25 for melanin harmony',
      lip: 'MLBB Rose → Deeper berry undertone for warm-skin pop',
      point: 'Soft brown liner with gold shimmer point on inner corner',
    },
    styleExplanation:
      "Your bone structure mirrors Kim Tae-ri's balanced proportions with high cheekbones. The warm undertone calls for berry-shifted lip colors rather than standard coral K-beauty tones. Your +8° eye angle suggests a gentle upward flick rather than sharp cat-eye — we're translating Seoul's signature soft-glam into your unique architecture.",
    aiStylePoints: [
      'Glass-skin base with luminous W25 cushion',
      'Berry MLBB lip adapted for warm melanin',
      'Soft gold inner-corner highlight for eye dimension',
    ],
  },
  palette: {
    lip: '#B5485F',
    cheek: '#C8836A',
    base: '#DEB896',
    eye: '#8B6F47',
  },
  recommendations: {
    ingredients: [
      'Niacinamide',
      'Centella Asiatica',
      'Hyaluronic Acid',
      'Rice Ferment Filtrate',
      'Propolis Extract',
    ],
    products: [
      {
        name: 'Luminous Glow Cushion SPF50+',
        brand: 'Sulwhasoo',
        price: '$48.00',
        desc: 'Adaptable coverage cushion with herbal complex for melanin-balanced glow.',
        matchScore: 96,
        ingredients: ['Niacinamide', 'Ginseng Extract', 'Pearl Powder'],
        safetyRating: 'EWG Green',
      },
      {
        name: 'Ink Velvet Tint #19',
        brand: 'Peripera',
        price: '$12.00',
        desc: 'Buildable matte-velvet lip tint in Plum Rose — adapted for warm undertones.',
        matchScore: 93,
        ingredients: ['Jojoba Oil', 'Vitamin E', 'Rose Hip Extract'],
        safetyRating: 'EWG Green',
      },
      {
        name: 'Vita Propolis Ampoule',
        brand: 'COSRX',
        price: '$24.00',
        desc: 'Intensive glow serum with 73.5% propolis for hydrated glass-skin finish.',
        matchScore: 91,
        ingredients: ['Propolis Extract', 'Betaine', 'Panthenol'],
        safetyRating: 'EWG Green',
      },
      {
        name: 'Eye Palette — Autumn Closet',
        brand: "Rom&nd",
        price: '$22.00',
        desc: 'Warm-toned quad with matte, shimmer, and glitter for soft contour.',
        matchScore: 89,
        ingredients: ['Mica', 'Dimethicone', 'Tocopherol'],
        safetyRating: 'EWG Yellow',
      },
    ],
    videos: [
      {
        title: 'Warm-Tone Glass Skin Masterclass',
        creator: 'PONY Syndrome',
        views: '4.2M',
        duration: '12:34',
        tag: 'Glass Skin',
        aiCoaching: 'Focus on the cushion-pressing technique at 3:45 for your skin type.',
        matchPercentage: 94,
        skillLevel: 'Beginner',
      },
      {
        title: 'Korean MLBB Lip for Every Skin Tone',
        creator: 'Risabae',
        views: '2.8M',
        duration: '8:22',
        tag: 'Lip Technique',
        aiCoaching: 'Skip the coral section — go directly to berry adaptation at 5:10.',
        matchPercentage: 91,
        skillLevel: 'Intermediate',
      },
      {
        title: 'Cheekbone Sculpting: High vs Low',
        creator: 'Sichenmakeupholic',
        views: '1.5M',
        duration: '15:08',
        tag: 'Contouring',
        aiCoaching: 'Your high cheekbones match the first technique demonstrated.',
        matchPercentage: 88,
        skillLevel: 'Pro',
      },
    ],
    sensitiveSafe: true,
  },
};

/** Muse Board inspiration items */
export const MUSE_BOARD_ITEMS = [
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=600',
    label: 'Glass Skin Glow',
    tag: 'Skin',
    span: 'tall' as const,
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600',
    label: 'Seoul Editorial',
    tag: 'Look',
    span: 'normal' as const,
  },
  {
    id: 3,
    img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600',
    label: 'Soft Mute Tone',
    tag: 'Mood',
    span: 'normal' as const,
  },
  {
    id: 4,
    img: 'https://images.unsplash.com/photo-1503236123135-0835612d7d32?q=80&w=600',
    label: 'Idol Stage Ready',
    tag: 'Glam',
    span: 'tall' as const,
  },
  {
    id: 5,
    img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600',
    label: 'Natural Contour',
    tag: 'Technique',
    span: 'normal' as const,
  },
  {
    id: 6,
    img: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=600',
    label: 'Dewy Highlight',
    tag: 'Finish',
    span: 'normal' as const,
  },
];

/** Style notes for Muse Board */
export const MUSE_STYLE_NOTES = [
  'Warm-shifted berry tones over standard coral',
  'Glass-skin base → skip matte setting powder',
  'Gold shimmer on inner corner for +8° eye lift effect',
  'High cheekbone emphasis with cream bronzer, not powder',
];
