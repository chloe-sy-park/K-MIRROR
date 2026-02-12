import { AnalysisResult } from '@/types';

export const DEMO_RESULT: AnalysisResult = {
  tone: {
    melaninIndex: 5,
    undertone: 'Cool',
    skinHexCode: '#6B4226',
    skinConcerns: ['Hyper-pigmentation', 'Inner Dryness', 'Structural Shadowing'],
    description: "Your complexion exhibits a rich, cool-ebony depth (Melanin L5) with subtle sapphire undertones. K-Beauty standards for this tone shift from 'whitening' to 'luminosity optimization,' focusing on high-chroma berry pigments and moisture-locked glass finishes."
  },
  sherlock: {
    proportions: { upper: '1', middle: '1.25', lower: '0.85' },
    eyeAngle: '12° Positive Cat-eye',
    boneStructure: 'High-Definition Angular Zygomatic',
    facialVibe: 'Seoul Bold / Avant-Garde'
  },
  kMatch: {
    celebName: 'Wonyoung (IVE)',
    adaptationLogic: {
      base: 'Replacing translucent beige with a deep-gold infused radiant primer to neutralize ashiness while maintaining K-glow.',
      lip: 'Pivot from pastel coral to a high-saturation Deep Black-Cherry glass tint. Use a blurred edge for a modern Seoul editorial look.',
      point: 'Structural K-idol lash mapping using 10mm-12mm clusters focused on the outer third to accentuate the 12° cat-eye angle.'
    },
    styleExplanation: "We have re-engineered the 'Strawberry Moon' look for a deeper palette. Instead of desaturating, we increased chromatic density by 40% to achieve the same 'pop' effect on melanin-rich skin. This is the 'Midnight Muse' variant of the look.",
    aiStylePoints: ['Melanin-Safe Luminosity', 'Chromatic Saturation Shift', 'Structural Vector Lashes']
  },
  recommendations: {
    ingredients: ['Niacinamide (5%)', 'Beta-Glucan', 'Ceramide NP', 'Black Rice Extract'],
    products: [
      { name: 'Black Cushion (Deep Shade)', brand: 'HERA', price: '$45', desc: 'High-coverage matte finish with zero ashiness.', matchScore: 98, ingredients: [], safetyRating: 'EWG Green' },
      { name: 'Glasting Water Tint (Fig)', brand: 'ROM&ND', price: '$14', desc: 'High-gloss finish with deep pigment retention.', matchScore: 96, ingredients: [], safetyRating: 'Vegan' },
      { name: 'Ultra Facial Cream', brand: 'KIEHLS (K-Exclusive)', price: '$38', desc: 'Heavy hydration for the 1:1.2:0.9 proportion prep.', matchScore: 92, ingredients: [], safetyRating: 'Safe' },
      { name: 'Super Slim Pen Liner', brand: 'CLIO', price: '$12', desc: 'Waterproof precision for vector eyeliner.', matchScore: 95, ingredients: [], safetyRating: 'Safe' }
    ],
    videos: [
      { title: 'Cool Tone Adaptation for Deep Skin', creator: 'PONY Syndrome', views: '2.1M', duration: '14:20', tag: 'Masterclass', aiCoaching: 'Focus on the 3:45 mark: use a stippling motion rather than wiping to avoid disturbing the melanin-guard primer.', matchPercentage: 99, skillLevel: 'Intermediate' },
      { title: 'Structural Eyeliner Theory', creator: 'LeoJ Makeup', views: '850K', duration: '08:15', tag: 'Technique', aiCoaching: 'Apply liner at the specific 12° angle found in your scan to harmonize with your zygomatic prominence.', matchPercentage: 94, skillLevel: 'Pro' }
    ],
    sensitiveSafe: true
  }
};

export const TRANSFORMATION_SAMPLES = [
  {
    name: "Deep Tone / Idol Glam",
    user: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80",
    muse: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80",
    result: "Velvet Berry Look"
  },
  {
    name: "South Asian / Clean Girl",
    user: "https://images.unsplash.com/photo-1523824921871-d6f1a31951bc?q=80",
    muse: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80",
    result: "Honey Glass Glow"
  },
  {
    name: "East Asian / Seoul Mute",
    user: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80",
    muse: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80",
    result: "Graphic Lavender"
  }
];
