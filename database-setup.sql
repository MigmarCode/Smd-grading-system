-- SMD Grading System Database Schema (SQLite Compatible)

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    section TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    class_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    class_id TEXT,
    student_id TEXT NOT NULL UNIQUE,
    roll_no TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    term TEXT NOT NULL,
    mathematics INTEGER,
    science INTEGER,
    english INTEGER,
    social_studies INTEGER,
    computer_science INTEGER,
    physical_education INTEGER,
    extra_curricular INTEGER,
    total_marks INTEGER,
    percentage REAL,
    grade TEXT,
    remark_english TEXT,
    remark_other TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    UNIQUE(student_id, class_id, term)
);

-- Create class_subjects table for many-to-many relationship
CREATE TABLE IF NOT EXISTS class_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, subject_id)
);

-- Insert some sample data
INSERT OR IGNORE INTO classes (id, name, section) VALUES
    ('1', 'Class 1A', 'A'),
    ('2', 'Class 2B', 'B'),
    ('3', 'Class 3A', 'A');

INSERT OR IGNORE INTO subjects (id, name, code) VALUES
    ('1', 'Mathematics', 'MATH101'),
    ('2', 'English Language', 'ENG101'),
    ('3', 'Science', 'SCI101'),
    ('4', 'Social Studies', 'SOC101');

INSERT OR IGNORE INTO teachers (id, first_name, last_name, phone) VALUES
    ('1', 'John', 'Doe', '+1234567890'),
    ('2', 'Jane', 'Smith', '+1234567891'),
    ('3', 'Mike', 'Johnson', '+1234567892');

INSERT OR IGNORE INTO students (id, first_name, last_name, class_id, student_id, roll_no) VALUES
    ('1', 'Alice', 'Brown', '1', 'STU001', '1'),
    ('2', 'Bob', 'Wilson', '2', 'STU002', '2'),
    ('3', 'Carol', 'Davis', '3', 'STU003', '3');

-- Sample class-subject mappings
INSERT OR IGNORE INTO class_subjects (class_id, subject_id) VALUES
    ('1', '1'), -- Class 1A has Mathematics
    ('1', '2'), -- Class 1A has English
    ('1', '3'), -- Class 1A has Science
    ('2', '1'), -- Class 2B has Mathematics
    ('2', '2'), -- Class 2B has English
    ('2', '4'), -- Class 2B has Social Studies
    ('3', '1'), -- Class 3A has Mathematics
    ('3', '2'), -- Class 3A has English
    ('3', '3'), -- Class 3A has Science
    ('3', '4'); -- Class 3A has Social Studies

-- Add some sample class-subject assignments
INSERT OR IGNORE INTO class_subjects (class_id, subject_id) VALUES
('class_1', 'math_1'),
('class_1', 'science_1'),
('class_1', 'english_1'),
('class_2', 'math_2'),
('class_2', 'science_2'),
('class_2', 'english_2'),
('class_3', 'math_3'),
('class_3', 'science_3'),
('class_3', 'english_3'); 