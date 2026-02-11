import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Upload a base64 image to Supabase Storage.
 * Falls back to returning the base64 string as-is when Supabase is not configured.
 */
export async function uploadImage(
  base64: string,
  bucket: 'user-images' | 'celeb-images' = 'user-images'
): Promise<string> {
  if (!isSupabaseConfigured) return base64;

  const match = base64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return base64;

  const contentType = match[1]!;
  const raw = match[2]!;
  const ext = contentType.split('/')[1];
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)), {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error('Storage upload failed:', error.message);
    return base64; // graceful fallback
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}
