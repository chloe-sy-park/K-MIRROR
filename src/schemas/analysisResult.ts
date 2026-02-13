import { z } from 'zod';

const productSchema = z.object({
  name: z.string(),
  brand: z.string(),
  price: z.string(),
  desc: z.string(),
  matchScore: z.number(),
  ingredients: z.array(z.string()),
  safetyRating: z.string(),
});

const videoSchema = z.object({
  title: z.string(),
  creator: z.string(),
  views: z.string(),
  duration: z.string(),
  tag: z.string(),
  aiCoaching: z.string(),
  matchPercentage: z.number(),
  skillLevel: z.string(),
});

const youtubeSearchSchema = z.object({
  queries: z.array(z.string()),
  focusPoints: z.array(z.string()),
  channelSuggestions: z.array(z.string()),
});

export const analysisResultSchema = z.object({
  tone: z.object({
    melaninIndex: z.number().min(1).max(6),
    undertone: z.enum(['Warm', 'Cool', 'Neutral']),
    skinHexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#C8A98B'),
    skinConcerns: z.array(z.string()),
    description: z.string(),
    skinType: z.enum(['dry', 'oily', 'combination', 'normal']).optional(),
    sensitivityLevel: z.number().min(1).max(5).optional(),
    moistureLevel: z.enum(['low', 'medium', 'high']).optional(),
    sebumLevel: z.enum(['low', 'medium', 'high']).optional(),
    poreSize: z.enum(['small', 'medium', 'large']).optional(),
    skinThickness: z.enum(['thin', 'medium', 'thick']).optional(),
  }),
  sherlock: z.object({
    proportions: z.object({
      upper: z.string(),
      middle: z.string(),
      lower: z.string(),
    }),
    eyeAngle: z.string(),
    boneStructure: z.string(),
    facialVibe: z.string(),
  }),
  kMatch: z.object({
    celebName: z.string(),
    adaptationLogic: z.object({
      base: z.string(),
      lip: z.string(),
      point: z.string(),
    }),
    styleExplanation: z.string(),
    aiStylePoints: z.array(z.string()),
  }),
  recommendations: z.object({
    ingredients: z.array(z.string()),
    products: z.array(productSchema),
    videos: z.array(videoSchema),
    sensitiveSafe: z.boolean(),
  }),
  autoTags: z.array(z.string()).optional().default([]),
  youtubeSearch: youtubeSearchSchema.optional(),
});
