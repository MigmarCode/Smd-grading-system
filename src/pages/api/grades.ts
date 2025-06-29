import { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.resolve(process.cwd(), 'data.db');
const db = new Database(dbPath);

// Ensure the grades table exists with the correct schema
db.prepare(`
  CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    class_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    term TEXT NOT NULL,
    theory_mark INTEGER,
    practical_mark INTEGER,
    total_mark INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(student_id, class_id, subject_id, term)
  )
`).run();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all grades or grades for a specific student
        const { student_id: queryStudentId, class_id: queryClassId } = req.query;
        
        if (queryStudentId) {
          // Get grades for specific student
          const grades = db.prepare(
            `SELECT g.*, s.first_name, s.last_name, c.name as class_name, c.section as class_section, sub.name as subject_name
             FROM grades g
             JOIN students s ON g.student_id = s.student_id
             JOIN classes c ON g.class_id = c.id
             JOIN subjects sub ON g.subject_id = sub.id
             WHERE g.student_id = ?
             ORDER BY g.term, sub.name`
          ).all(queryStudentId);
          
          res.status(200).json(grades);
        } else if (queryClassId) {
          // Get grades for specific class
          const grades = db.prepare(
            `SELECT g.*, s.first_name, s.last_name, c.name as class_name, c.section as class_section, sub.name as subject_name
             FROM grades g
             JOIN students s ON g.student_id = s.student_id
             JOIN classes c ON g.class_id = c.id
             JOIN subjects sub ON g.subject_id = sub.id
             WHERE g.class_id = ?
             ORDER BY s.roll_no, g.term, sub.name`
          ).all(queryClassId);
          
          res.status(200).json(grades);
        } else {
          // Get all grades
          const grades = db.prepare(
            `SELECT g.*, s.first_name, s.last_name, c.name as class_name, c.section as class_section, sub.name as subject_name
             FROM grades g
             JOIN students s ON g.student_id = s.student_id
             JOIN classes c ON g.class_id = c.id
             JOIN subjects sub ON g.subject_id = sub.id
             ORDER BY g.created_at DESC`
          ).all();
          
          res.status(200).json(grades);
        }
        break;

      case 'POST':
        // Handle bulk grade submission
        const { grades: gradeEntries } = req.body;
        
        if (!gradeEntries || !Array.isArray(gradeEntries)) {
          return res.status(400).json({ error: 'Grades array is required' });
        }

        // Use a transaction for better concurrency handling
        const transaction = db.transaction(() => {
          const results = [];
          for (const gradeEntry of gradeEntries) {
            const {
              student_id,
              class_id,
              subject_id,
              term,
              theory_mark,
              practical_mark,
              total_mark
            } = gradeEntry;

            const gradeId = uuidv4();
            
            // Use INSERT OR REPLACE to handle duplicates gracefully
            const insertStmt = db.prepare(
              `INSERT OR REPLACE INTO grades (
                id, student_id, class_id, subject_id, term, theory_mark, practical_mark, total_mark
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            );
            
            insertStmt.run(
              gradeId, student_id, class_id, subject_id, term, 
              theory_mark || 0, practical_mark || 0, total_mark || 0
            );
            
            results.push({ id: gradeId, ...gradeEntry });
          }
          return results;
        });

        // Execute the transaction
        const insertedGrades = transaction();
        
        res.status(201).json({ 
          message: 'Grades submitted successfully',
          count: insertedGrades.length,
          grades: insertedGrades
        });
        break;

      case 'PUT':
        // Update existing grade record
        const { id, ...updateData } = req.body;
        
        const updateStmt = db.prepare(
          `UPDATE grades SET 
            theory_mark = ?, practical_mark = ?, total_mark = ?
           WHERE id = ?`
        );
        
        const updateResult = updateStmt.run(
          updateData.theory_mark || 0, 
          updateData.practical_mark || 0, 
          updateData.total_mark || 0, 
          id
        );
        
        if (updateResult.changes === 0) {
          res.status(404).json({ error: 'Grade record not found' });
          return;
        }
        
        res.status(200).json({ message: 'Grade updated successfully' });
        break;

      case 'DELETE':
        // Delete grade record
        const { id: deleteId } = req.query;
        
        const deleteStmt = db.prepare('DELETE FROM grades WHERE id = ?');
        const deleteResult = deleteStmt.run(deleteId);
        
        if (deleteResult.changes === 0) {
          res.status(404).json({ error: 'Grade record not found' });
          return;
        }
        
        res.status(200).json({ message: 'Grade deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 