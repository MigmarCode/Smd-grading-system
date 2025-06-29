import { NextApiRequest, NextApiResponse } from 'next';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'data.db');
const db = new Database(dbPath);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    return;
  }

  try {
    // Get all students
    const students = db.prepare('SELECT student_id FROM students').all();
    
    // Categorize students based on admission number prefix
    const stats = {
      monkStudents: 0,
      nunStudents: 0,
      boardingStudents: 0,
      dayBoardingStudents: 0,
      totalStudents: students.length
    };

    students.forEach((student: any) => {
      const studentId = student.student_id;
      if (studentId) {
        const prefix = studentId.charAt(0).toUpperCase();
        
        switch (prefix) {
          case 'M':
            stats.monkStudents++;
            break;
          case 'N':
            stats.nunStudents++;
            break;
          case 'B':
            stats.boardingStudents++;
            break;
          case 'D':
            stats.dayBoardingStudents++;
            break;
          default:
            // Students with other prefixes or no prefix are not counted in specific categories
            break;
        }
      }
    });

    res.status(200).json(stats);
  } catch (error) {
    console.error('Student Stats API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 