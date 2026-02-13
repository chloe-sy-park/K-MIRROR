import { describe, it, expect } from 'vitest';

import {
  formatViewCount,
  getYouTubeVideoUrl,
  getYouTubeEmbedUrl,
  searchYouTubeVideos,
} from './youtubeService';

describe('youtubeService', () => {
  // ── formatViewCount ────────────────────────────────────

  describe('formatViewCount', () => {
    it('returns empty string for undefined', () => {
      expect(formatViewCount(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(formatViewCount('')).toBe('');
    });

    it('formats millions', () => {
      expect(formatViewCount('1200000')).toBe('1.2M');
    });

    it('formats thousands', () => {
      expect(formatViewCount('345000')).toBe('345K');
    });

    it('returns small numbers as-is', () => {
      expect(formatViewCount('999')).toBe('999');
    });

    it('returns original string for NaN input', () => {
      expect(formatViewCount('not-a-number')).toBe('not-a-number');
    });
  });

  // ── getYouTubeVideoUrl ─────────────────────────────────

  describe('getYouTubeVideoUrl', () => {
    it('returns correct watch URL', () => {
      expect(getYouTubeVideoUrl('abc123')).toBe('https://www.youtube.com/watch?v=abc123');
    });
  });

  // ── getYouTubeEmbedUrl ─────────────────────────────────

  describe('getYouTubeEmbedUrl', () => {
    it('returns correct embed URL', () => {
      expect(getYouTubeEmbedUrl('abc123')).toBe('https://www.youtube.com/embed/abc123');
    });
  });

  // ── searchYouTubeVideos ────────────────────────────────

  describe('searchYouTubeVideos', () => {
    it('returns empty array when API key is not set', async () => {
      const results = await searchYouTubeVideos(['korean makeup tutorial']);
      expect(results).toEqual([]);
    });
  });
});
