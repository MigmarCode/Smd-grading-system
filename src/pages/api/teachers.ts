import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all teachers with class information
        const { data: teachers, error } = await supabase
          .from('teachers')
          .select(`
            *,
            classes(name, section)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Get teachers error:', error);
          res.status(500).json({ error: error.message });
          return;
        }

        // Transform the data to match the expected format
        const transformedTeachers = teachers.map(teacher => ({
          ...teacher,
          class_name: teacher.classes?.name || null,
          class_section: teacher.classes?.section || null
        }));

        res.status(200).json(transformedTeachers);
        break;

      case 'POST':
        // Create new teacher
        const { first_name, last_name, class_id } = req.body;
        if (!first_name || !last_name) {
          return res.status(400).json({ error: 'First name and last name are required' });
        }
        
        const { data: newTeacher, error: createError } = await supabase
          .from('teachers')
          .insert({
            first_name,
            last_name,
            class_id: class_id || null
          })
          .select(`
            *,
            classes(name, section)
          `)
          .single();
        
        if (createError) {
          console.error('Create teacher error:', createError);
          res.status(500).json({ error: createError.message });
          return;
        }

        // Transform the response
        const transformedNewTeacher = {
          ...newTeacher,
          class_name: newTeacher.classes?.name || null,
          class_section: newTeacher.classes?.section || null
        };

        res.status(201).json(transformedNewTeacher);
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
          .select(`
            *,
            classes(name, section)
          `)
          .single();
        
        if (updateError || !updatedTeacher) {
          console.error('Update teacher error:', updateError);
          return res.status(404).json({ error: 'Teacher not found' });
        }

        // Transform the response
        const transformedUpdatedTeacher = {
          ...updatedTeacher,
          class_name: updatedTeacher.classes?.name || null,
          class_section: updatedTeacher.classes?.section || null
        };

        res.status(200).json(transformedUpdatedTeacher);
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
          console.error('Delete teacher error:', deleteError);
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