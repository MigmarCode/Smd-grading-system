import type { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Use an absolute path for the DB file
const db = new Database(path.resolve(process.cwd(), 'data.db'));

// Ensure the table exists with TEXT IDs to match the schema
db.prepare(`
  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    section TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`).run();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get all classes - sort numerically by name, then by section (empty sections last)
    const classes = db.prepare(`
      SELECT * FROM classes 
      ORDER BY CAST(name AS INTEGER), 
               CASE WHEN section = '' OR section IS NULL THEN 1 ELSE 0 END,
               section
    `).all();
    res.status(200).json(classes);
  } else if (req.method === 'POST') {
    // Add a new class
    const { name, section } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const classId = uuidv4();
    const stmt = db.prepare('INSERT INTO classes (id, name, section) VALUES (?, ?, ?)');
    const info = stmt.run(classId, name, section || "");
    res.status(201).json({ id: classId, name, section: section || "" });
  } else if (req.method === 'PUT') {
    // Update a class
    const { id, name, section } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'ID and name are required' });
    }
    try {
      const result = db.prepare('UPDATE classes SET name = ?, section = ? WHERE id = ?').run(name, section || "", id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Class not found' });
      }
      const updatedClass = db.prepare('SELECT * FROM classes WHERE id = ?').get(id);
      res.status(200).json(updatedClass);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update class' });
    }
  } else if (req.method === 'DELETE') {
    // Delete a class
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Class ID is required' });
    }
    try {
      const result = db.prepare('DELETE FROM classes WHERE id = ?').run(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Class not found' });
      }
      res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete class' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 