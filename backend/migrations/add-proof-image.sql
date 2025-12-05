-- Add proof_image_url column to issues table
ALTER TABLE issues ADD COLUMN IF NOT EXISTS proof_image_url TEXT;
