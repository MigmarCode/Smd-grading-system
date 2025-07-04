-- Migration: Add remark column to grades_new table
ALTER TABLE grades_new ADD COLUMN IF NOT EXISTS remark TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'grades_new' 
AND column_name = 'remark'; 