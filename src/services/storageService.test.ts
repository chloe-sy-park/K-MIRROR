import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  },
  isSupabaseConfigured: true,
}));

import { uploadImage } from './storageService';
import * as supabaseModule from '@/lib/supabase';

beforeEach(() => {
  vi.clearAllMocks();
  // Reset isSupabaseConfigured to true before each test
  Object.defineProperty(supabaseModule, 'isSupabaseConfigured', {
    value: true,
    writable: true,
  });
});

describe('uploadImage', () => {
  const validBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';

  it('returns base64 as-is when supabase is not configured', async () => {
    Object.defineProperty(supabaseModule, 'isSupabaseConfigured', {
      value: false,
      writable: true,
    });

    const result = await uploadImage(validBase64);
    expect(result).toBe(validBase64);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('returns base64 as-is when input does not match data URI pattern', async () => {
    const plainString = 'not-a-data-uri';
    const result = await uploadImage(plainString);
    expect(result).toBe(plainString);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('returns public URL on successful upload', async () => {
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://storage.example.com/image.png' },
    });

    const result = await uploadImage(validBase64);
    expect(result).toBe('https://storage.example.com/image.png');
    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(mockGetPublicUrl).toHaveBeenCalledTimes(1);
  });

  it('returns base64 fallback on upload error', async () => {
    mockUpload.mockResolvedValue({ error: { message: 'Upload failed' } });

    const result = await uploadImage(validBase64);
    expect(result).toBe(validBase64);
    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(mockGetPublicUrl).not.toHaveBeenCalled();
  });
});
