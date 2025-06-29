import { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const db = new Database(path.resolve(process.cwd(), 'data.db'));

// Ensure the subjects table exists with the correct schema
db.prepare(`
  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
  )
`).run();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const subjects = db.prepare('SELECT * FROM subjects ORDER BY created_at DESC').all();
      res.status(200).json(subjects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  } else if (req.method === 'POST') {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    try {
      const id = uuidv4();
      const code = name.toUpperCase().replace(/\s+/g, '_');
      const created_at = new Date().toISOString();
      db.prepare('INSERT INTO subjects (id, name, code, created_at) VALUES (?, ?, ?, ?)')
        .run(id, name, code, created_at);
      const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);
      res.status(201).json(subject);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(409).json({ error: 'Subject code must be unique' });
      } else {
        res.status(500).json({ error: 'Failed to add subject' });
      }
    }
  } else if (req.method === 'PUT') {
    const { id, name } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'ID and name are required' });
    }
    try {
      const code = name.toUpperCase().replace(/\s+/g, '_');
      db.prepare('UPDATE subjects SET name = ?, code = ? WHERE id = ?').run(name, code, id);
      const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);
      if (!subject) {
        return res.status(404).json({ error: 'Subject not found' });
      }
      res.status(200).json(subject);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(409).json({ error: 'Subject code must be unique' });
      } else {
        res.status(500).json({ error: 'Failed to update subject' });
      }
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }
    try {
      const result = db.prepare('DELETE FROM subjects WHERE id = ?').run(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Subject not found' });
      }
      res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete subject' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 