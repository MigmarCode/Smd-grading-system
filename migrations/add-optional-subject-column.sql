-- Migration: Add optional subject column to grades table
ALTER TABLE grades ADD COLUMN IF NOT EXISTS opt INTEGER DEFAULT 0; 