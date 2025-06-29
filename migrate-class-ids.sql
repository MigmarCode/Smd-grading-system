-- Migration script to convert integer class IDs to string IDs
-- This will make the class IDs consistent with the student class_id format

-- First, let's see what we have
SELECT 'Current classes:' as info;
SELECT id, name, section FROM classes LIMIT 10;

SELECT 'Current students:' as info;
SELECT id, first_name, last_name, class_id FROM students LIMIT 10;

-- Create a temporary table with the new structure
CREATE TABLE IF NOT EXISTS classes_new (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    section TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Copy data with string IDs (without created_at since it doesn't exist in old table)
INSERT INTO classes_new (id, name, section)
SELECT CAST(id AS TEXT), name, section FROM classes;

-- Drop the old table
DROP TABLE classes;

-- Rename the new table
ALTER TABLE classes_new RENAME TO classes;

-- Verify the migration
SELECT 'After migration - classes:' as info;
SELECT id, name, section FROM classes LIMIT 10;

SELECT 'After migration - students:' as info;
SELECT id, first_name, last_name, class_id FROM students LIMIT 10;

-- Migration script to add class_id to teachers table
-- Run this script to update existing database

-- Add class_id column to teachers table
ALTER TABLE teachers ADD COLUMN class_id TEXT;

-- Add foreign key constraint
-- Note: SQLite doesn't support adding foreign key constraints to existing tables
-- The constraint will be enforced at the application level 