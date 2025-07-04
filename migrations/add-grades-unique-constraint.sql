-- Migration: Add unique constraint to grades table
-- This ensures that each student can only have one grade record per class per term

-- Add unique constraint to grades table
ALTER TABLE grades ADD CONSTRAINT grades_student_class_term_unique UNIQUE (student_id, class_id, term);

-- If the above fails due to existing duplicate data, you may need to clean up duplicates first:
-- DELETE FROM grades WHERE id NOT IN (
--   SELECT MIN(id) FROM grades GROUP BY student_id, class_id, term
-- );
-- Then run the ALTER TABLE command again. 