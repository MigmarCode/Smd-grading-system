-- Migration: Add teacher_id column to grades_new table
-- This adds teacher identification to track who entered each grade

-- Add teacher_id column to grades_new table
ALTER TABLE grades_new ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL;

-- Add index for better performance when filtering by teacher
CREATE INDEX IF NOT EXISTS idx_grades_new_teacher_id ON grades_new(teacher_id);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'grades_new' 
AND column_name = 'teacher_id'; 