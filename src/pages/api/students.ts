import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all students or student by ID
        const { id: queryId, class_id: queryClassId } = req.query;
        
        if (queryId) {
          // Get specific student by ID
          const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', queryId)
            .single();
          
          if (error || !student) {
            console.error('Get student error:', error);
            res.status(404).json({ error: 'Student not found' });
            return;
          }
          res.status(200).json(student);
        } else if (queryClassId) {
          // Get students by class
          const { data: students, error } = await supabase
            .from('students')
            .select('*')
            .eq('class_id', queryClassId)
            .order('roll_no', { ascending: true });
          
          if (error) {
            console.error('Get students by class error:', error);
            res.status(500).json({ error: error.message });
            return;
          }
          res.status(200).json(students);
        } else {
          // Get all students
          const { data: students, error } = await supabase
            .from('students')
            .select('*')
            .order('roll_no', { ascending: true });
          
          if (error) {
            console.error('Get all students error:', error);
            res.status(500).json({ error: error.message });
            return;
          }
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

        const { data: newStudent, error } = await supabase
          .from('students')
          .insert({
            first_name,
            last_name,
            class_id,
            student_id,
            roll_no
          })
          .select()
          .single();
        
        if (error) {
          console.error('Create student error:', error);
          res.status(500).json({ error: error.message });
          return;
        }
        
        res.status(201).json(newStudent);
        break;

      case 'PUT':
        // Update existing student
        const { id, ...updateData } = req.body;
        
        if (!/^[0-9]+$/.test(updateData.roll_no)) {
          res.status(400).json({ error: 'Please input number' });
          return;
        }
        
        const { data: updatedStudent, error: updateError } = await supabase
          .from('students')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (updateError || !updatedStudent) {
          console.error('Update student error:', updateError);
          res.status(404).json({ error: 'Student not found' });
          return;
        }
        
        res.status(200).json(updatedStudent);
        break;

      case 'DELETE':
        // Delete student
        const { id: deleteId } = req.query;
        
        const { error: deleteError } = await supabase
          .from('students')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) {
          console.error('Delete student error:', deleteError);
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