import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all classes - sort numerically by name, then by section
        const { data: classes, error } = await supabase
          .from('classes')
          .select('*')
          .order('name', { ascending: true })
          .order('section', { ascending: true });
        
        if (error) {
          res.status(500).json({ error: error.message });
          return;
        }
        
        // Sort classes numerically by name, then by section (empty sections last)
        const sortedClasses = classes.sort((a, b) => {
          const nameA = parseInt(a.name) || 0;
          const nameB = parseInt(b.name) || 0;
          if (nameA !== nameB) return nameA - nameB;
          
          const sectionA = a.section || '';
          const sectionB = b.section || '';
          if (sectionA === '' && sectionB !== '') return 1;
          if (sectionB === '' && sectionA !== '') return -1;
          return sectionA.localeCompare(sectionB);
        });
        
        res.status(200).json(sortedClasses);
        break;

      case 'POST':
        // Add a new class
        const { name, section } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Name is required' });
        }
        
        const classId = uuidv4();
        const { data: newClass, error: createError } = await supabase
          .from('classes')
          .insert({
            id: classId,
            name,
            section: section || ""
          })
          .select()
          .single();
        
        if (createError) {
          res.status(500).json({ error: createError.message });
          return;
        }
        
        res.status(201).json(newClass);
        break;

      case 'PUT':
        // Update a class
        const { id, name: updateName, section: updateSection } = req.body;
        if (!id || !updateName) {
          return res.status(400).json({ error: 'ID and name are required' });
        }
        
        const { data: updatedClass, error: updateError } = await supabase
          .from('classes')
          .update({
            name: updateName,
            section: updateSection || ""
          })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError || !updatedClass) {
          return res.status(404).json({ error: 'Class not found' });
        }
        
        res.status(200).json(updatedClass);
        break;

      case 'DELETE':
        // Delete a class
        const { id: deleteId } = req.query;
        if (!deleteId) {
          return res.status(400).json({ error: 'Class ID is required' });
        }
        
        const { error: deleteError } = await supabase
          .from('classes')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) {
          return res.status(404).json({ error: 'Class not found' });
        }
        
        res.status(200).json({ message: 'Class deleted successfully' });
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