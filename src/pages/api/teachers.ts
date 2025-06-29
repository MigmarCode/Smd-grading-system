import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all teachers
        const { data: teachers, error } = await supabase
          .from('teachers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          res.status(500).json({ error: error.message });
          return;
        }
        res.status(200).json(teachers);
        break;

      case 'POST':
        // Create new teacher
        const { first_name, last_name, class_id } = req.body;
        if (!first_name || !last_name) {
          return res.status(400).json({ error: 'First name and last name are required' });
        }
        
        const teacherId = uuidv4();
        const { data: newTeacher, error: createError } = await supabase
          .from('teachers')
          .insert({
            id: teacherId,
            first_name,
            last_name,
            phone: '',
            class_id: class_id || null
          })
          .select()
          .single();
        
        if (createError) {
          res.status(500).json({ error: createError.message });
          return;
        }
        res.status(201).json(newTeacher);
        break;

      case 'PUT':
        // Update existing teacher
        const { id, first_name: updateFirstName, last_name: updateLastName, class_id: updateClassId } = req.body;
        if (!id || !updateFirstName || !updateLastName) {
          return res.status(400).json({ error: 'ID, first name, and last name are required' });
        }
        
        const { data: updatedTeacher, error: updateError } = await supabase
          .from('teachers')
          .update({
            first_name: updateFirstName,
            last_name: updateLastName,
            class_id: updateClassId || null
          })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError || !updatedTeacher) {
          return res.status(404).json({ error: 'Teacher not found' });
        }
        res.status(200).json(updatedTeacher);
        break;

      case 'DELETE':
        // Delete teacher
        const { id: deleteId } = req.query;
        if (!deleteId) {
          return res.status(400).json({ error: 'Teacher ID is required' });
        }
        
        const { error: deleteError } = await supabase
          .from('teachers')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) {
          return res.status(404).json({ error: 'Teacher not found' });
        }
        res.status(200).json({ message: 'Teacher deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 