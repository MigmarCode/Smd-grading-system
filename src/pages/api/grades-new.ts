import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "../../lib/supabaseClient";

// POST: Add or update a grade
// GET: Fetch grades (optionally filter by class_id, student_id, subject_id, term)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { class_id, student_id, subject_id, teacher_id, term, marks, remark } = req.body;
    if (!student_id || !class_id || !subject_id || !term || marks === undefined || !teacher_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Upsert grade
    const { data, error } = await supabase
      .from('grades_new')
      .upsert([
        { class_id, student_id, subject_id, teacher_id, term, marks, remark }
      ], { onConflict: 'class_id,student_id,subject_id,term' })
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ grade: data[0] });
  }

  if (req.method === 'GET') {
    const { class_id, student_id, subject_id, term, teacher_id } = req.query;
    let query = supabase.from('grades_new').select(`
      *,
      teachers(first_name, last_name),
      students(first_name, last_name, student_id),
      subjects(name, code),
      classes(name, section)
    `);
    if (class_id) query = query.eq('class_id', class_id);
    if (student_id) query = query.eq('student_id', student_id);
    if (subject_id) query = query.eq('subject_id', subject_id);
    if (term) query = query.eq('term', term);
    if (teacher_id) query = query.eq('teacher_id', teacher_id);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ grades: data });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 