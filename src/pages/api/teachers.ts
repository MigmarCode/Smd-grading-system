import { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const db = new Database(path.resolve(process.cwd(), 'data.db'));

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const teachers = db.prepare(`
        SELECT t.*, c.name as class_name, c.section as class_section 
        FROM teachers t 
        LEFT JOIN classes c ON t.class_id = c.id 
        ORDER BY t.created_at DESC
      `).all();
      res.status(200).json(teachers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch teachers' });
    }
  } else if (req.method === 'POST') {
    const { first_name, last_name, class_id } = req.body;
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    try {
      const id = uuidv4();
      const created_at = new Date().toISOString();
      db.prepare('INSERT INTO teachers (id, first_name, last_name, phone, class_id, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, first_name, last_name, '', class_id || null, created_at);
      const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(id);
      res.status(201).json(teacher);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to add teacher' });
    }
  } else if (req.method === 'PUT') {
    const { id, first_name, last_name, class_id } = req.body;
    if (!id || !first_name || !last_name) {
      return res.status(400).json({ error: 'ID, first name, and last name are required' });
    }
    try {
      db.prepare('UPDATE teachers SET first_name = ?, last_name = ?, class_id = ? WHERE id = ?')
        .run(first_name, last_name, class_id || null, id);
      const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(id);
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      res.status(200).json(teacher);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update teacher' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Teacher ID is required' });
    }
    try {
      const result = db.prepare('DELETE FROM teachers WHERE id = ?').run(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete teacher' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 