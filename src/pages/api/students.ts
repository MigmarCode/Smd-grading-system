import { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.resolve(process.cwd(), 'data.db');
const db = new Database(dbPath);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all students or student by ID
        const { id: queryId, class_id: queryClassId } = req.query;
        
        if (queryId) {
          // Get specific student by ID
          const student = db.prepare(
            `SELECT s.*, c.name as class_name, c.section as class_section
             FROM students s
             LEFT JOIN classes c ON s.class_id = c.id
             WHERE s.id = ?`
          ).get(queryId);
          
          if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
          }
          res.status(200).json(student);
        } else if (queryClassId) {
          // Get students by class
          const students = db.prepare(
            `SELECT s.*, c.name as class_name, c.section as class_section
             FROM students s
             LEFT JOIN classes c ON s.class_id = c.id
             WHERE s.class_id = ?
             ORDER BY s.roll_no ASC, s.first_name, s.last_name`
          ).all(queryClassId);
          
          res.status(200).json(students);
        } else {
          // Get all students
          const students = db.prepare(
            `SELECT s.*, c.name as class_name, c.section as class_section
             FROM students s
             LEFT JOIN classes c ON s.class_id = c.id
             ORDER BY s.roll_no ASC, s.first_name, s.last_name`
          ).all();
          
          res.status(200).json(students);
        }
        break;

      case 'POST':
        // Create new student
        const {
          first_name,
          last_name,
          class_id,
          student_id,
          roll_no
        } = req.body;

        if (!/^[0-9]+$/.test(roll_no)) {
          res.status(400).json({ error: 'Please input number' });
          return;
        }

        // Use a more consistent ID generation method
        const studentId = uuidv4();

        const insertStmt = db.prepare(
          `INSERT INTO students (id, first_name, last_name, class_id, student_id, roll_no)
           VALUES (?, ?, ?, ?, ?, ?)`
        );
        
        const result = insertStmt.run(studentId, first_name, last_name, class_id, student_id, roll_no);
        
        // Return the created student record
        const newStudent = db.prepare(
          `SELECT s.*, c.name as class_name, c.section as class_section
           FROM students s
           LEFT JOIN classes c ON s.class_id = c.id
           WHERE s.id = ?`
        ).get(studentId);
        
        res.status(201).json(newStudent);
        break;

      case 'PUT':
        // Update existing student
        const { id, ...updateData } = req.body;
        
        if (!/^[0-9]+$/.test(updateData.roll_no)) {
          res.status(400).json({ error: 'Please input number' });
          return;
        }
        
        const updateStmt = db.prepare(
          `UPDATE students SET 
            first_name = ?, last_name = ?, class_id = ?, student_id = ?, roll_no = ?
           WHERE id = ?`
        );
        
        const updateResult = updateStmt.run(
          updateData.first_name, updateData.last_name,
          updateData.class_id, updateData.student_id, updateData.roll_no, id
        );
        
        if (updateResult.changes === 0) {
          res.status(404).json({ error: 'Student not found' });
          return;
        }
        
        res.status(200).json({ message: 'Student updated successfully' });
        break;

      case 'DELETE':
        // Delete student
        const { id: deleteId } = req.query;
        
        const deleteStmt = db.prepare('DELETE FROM students WHERE id = ?');
        const deleteResult = deleteStmt.run(deleteId);
        
        if (deleteResult.changes === 0) {
          res.status(404).json({ error: 'Student not found' });
          return;
        }
        
        res.status(200).json({ message: 'Student deleted successfully' });
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