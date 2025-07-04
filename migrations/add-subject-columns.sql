-- Migration: Add dynamic subject columns to grades table
-- This adds columns for all the subject codes we're using

-- Add new subject columns to grades table
ALTER TABLE grades ADD COLUMN IF NOT EXISTS tib1 INTEGER DEFAULT 0;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS tib2 INTEGER DEFAULT 0;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS com INTEGER DEFAULT 0;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS eng INTEGER DEFAULT 0;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS nep INTEGER DEFAULT 0;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS math INTEGER DEFAULT 0;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS hea INTEGER DEFAULT 0;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS sam INTEGER DEFAULT 0;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS sci INTEGER DEFAULT 0;

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'grades' 
AND column_name IN ('tib1', 'tib2', 'com', 'eng', 'nep', 'math', 'hea', 'sam', 'sci')
ORDER BY column_name; 