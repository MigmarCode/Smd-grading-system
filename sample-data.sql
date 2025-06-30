-- Sample Data for SMD Grading System
-- Run this in your Supabase SQL Editor

-- First, let's clear any existing data to avoid conflicts
DELETE FROM grades;
DELETE FROM students;
DELETE FROM teachers;
DELETE FROM classes;

-- Insert sample classes (using auto-generated UUIDs)
INSERT INTO classes (name, section) VALUES
  ('Class 1', 'A'),
  ('Class 2', 'B'),
  ('Class 3', 'A')
RETURNING id, name, section;

-- Insert sample teachers (using auto-generated UUIDs)
INSERT INTO teachers (first_name, last_name, email, phone) VALUES
  ('John', 'Doe', 'john.doe@school.com', '+1234567890'),
  ('Jane', 'Smith', 'jane.smith@school.com', '+1234567891'),
  ('Mike', 'Johnson', 'mike.johnson@school.com', '+1234567892')
RETURNING id, first_name, last_name;

-- Insert sample students (using auto-generated UUIDs)
-- We'll get the class IDs first
INSERT INTO students (first_name, last_name, class_id, student_id, roll_no)
SELECT 
  'Alice', 'Johnson', c.id, 'S001', '1'
FROM classes c WHERE c.name = 'Class 1' AND c.section = 'A'
UNION ALL
SELECT 
  'Bob', 'Williams', c.id, 'S002', '2'
FROM classes c WHERE c.name = 'Class 2' AND c.section = 'B'
UNION ALL
SELECT 
  'Charlie', 'Brown', c.id, 'S003', '3'
FROM classes c WHERE c.name = 'Class 1' AND c.section = 'A'
RETURNING id, first_name, last_name, student_id;

-- Insert sample grades (using auto-generated UUIDs)
-- We'll get the student, teacher, and class IDs first
INSERT INTO grades (
  student_id, teacher_id, class_id, term,
  mathematics, science, english, social_studies, computer_science,
  physical_education, extra_curricular, total_marks, percentage, grade,
  remark_english, remark_other
)
SELECT 
  s.id as student_id,
  t.id as teacher_id,
  s.class_id,
  'Term 1' as term,
  90 as mathematics,
  85 as science,
  88 as english,
  80 as social_studies,
  75 as computer_science,
  95 as physical_education,
  80 as extra_curricular,
  593 as total_marks,
  84.71 as percentage,
  'A' as grade,
  'Excellent!' as remark_english,
  'Keep it up!' as remark_other
FROM students s
JOIN teachers t ON t.first_name = 'John' AND t.last_name = 'Doe'
WHERE s.first_name = 'Alice' AND s.last_name = 'Johnson'

UNION ALL

SELECT 
  s.id as student_id,
  t.id as teacher_id,
  s.class_id,
  'Term 1' as term,
  78 as mathematics,
  82 as science,
  80 as english,
  70 as social_studies,
  65 as computer_science,
  85 as physical_education,
  70 as extra_curricular,
  530 as total_marks,
  75.71 as percentage,
  'B' as grade,
  'Good effort!' as remark_english,
  'Needs improvement in science' as remark_other
FROM students s
JOIN teachers t ON t.first_name = 'Jane' AND t.last_name = 'Smith'
WHERE s.first_name = 'Bob' AND s.last_name = 'Williams'

UNION ALL

SELECT 
  s.id as student_id,
  t.id as teacher_id,
  s.class_id,
  'Term 1' as term,
  95 as mathematics,
  92 as science,
  90 as english,
  88 as social_studies,
  85 as computer_science,
  90 as physical_education,
  85 as extra_curricular,
  625 as total_marks,
  89.29 as percentage,
  'A+' as grade,
  'Outstanding performance!' as remark_english,
  'Excellent work across all subjects!' as remark_other
FROM students s
JOIN teachers t ON t.first_name = 'Mike' AND t.last_name = 'Johnson'
WHERE s.first_name = 'Charlie' AND s.last_name = 'Brown'
RETURNING id, student_id, teacher_id, class_id, term, grade;

-- Verify the data was inserted correctly
SELECT 'Classes' as table_name, COUNT(*) as count FROM classes
UNION ALL
SELECT 'Teachers' as table_name, COUNT(*) as count FROM teachers
UNION ALL
SELECT 'Students' as table_name, COUNT(*) as count FROM students
UNION ALL
SELECT 'Grades' as table_name, COUNT(*) as count FROM grades; 