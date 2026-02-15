-- Add style_versions JSONB column to analyses table
-- Stores daily/office/glam style version data from Gemini analysis
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS style_versions JSONB;
