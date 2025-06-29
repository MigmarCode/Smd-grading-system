import { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';

const db = new Database('data.db');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { class_id } = req.query;
      
      if (class_id) {
        // Get subjects for a specific class
        const subjects = db.prepare(`
          SELECT s.* FROM subjects s
          INNER JOIN class_subjects cs ON s.id = cs.subject_id
          WHERE cs.class_id = ?
          ORDER BY s.name
        `).all(class_id);
        
        res.status(200).json(subjects);
      } else {
        // Get all class-subject relationships
        const relationships = db.prepare(`
          SELECT cs.*, c.name as class_name, s.name as subject_name
          FROM class_subjects cs
          INNER JOIN classes c ON cs.class_id = c.id
          INNER JOIN subjects s ON cs.subject_id = s.id
          ORDER BY c.name, s.name
        `).all();
        
        res.status(200).json(relationships);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch class subjects' });
    }
  } else if (req.method === 'POST') {
    try {
      const { class_id, subject_ids } = req.body;
      
      if (!class_id || !subject_ids || !Array.isArray(subject_ids)) {
        return res.status(400).json({ error: 'Invalid data provided' });
      }
      
      // Remove existing relationships for this class
      db.prepare('DELETE FROM class_subjects WHERE class_id = ?').run(class_id);
      
      // Add new relationships
      const insertStmt = db.prepare('INSERT INTO class_subjects (class_id, subject_id) VALUES (?, ?)');
      
      for (const subject_id of subject_ids) {
        insertStmt.run(class_id, subject_id);
      }
      
      res.status(200).json({ message: 'Class subjects updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update class subjects' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 