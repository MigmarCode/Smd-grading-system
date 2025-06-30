import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all subjects
        const { data: subjects, error } = await supabase
          .from('subjects')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Get subjects error:', error);
          res.status(500).json({ error: error.message });
          return;
        }
        res.status(200).json(subjects);
        break;

      case 'POST':
        // Create new subject
        const { name } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Name is required' });
        }
        
        const code = name.toUpperCase().replace(/\s+/g, '_');
        
        const { data: newSubject, error: createError } = await supabase
          .from('subjects')
          .insert({
            name,
            code
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Create subject error:', createError);
          if (createError.code === '23505') { // Unique constraint violation
            res.status(409).json({ error: 'Subject code must be unique' });
          } else {
            res.status(500).json({ error: createError.message });
          }
          return;
        }
        res.status(201).json(newSubject);
        break;

      case 'PUT':
        // Update existing subject
        const { id, name: updateName } = req.body;
        if (!id || !updateName) {
          return res.status(400).json({ error: 'ID and name are required' });
        }
        
        const updateCode = updateName.toUpperCase().replace(/\s+/g, '_');
        
        const { data: updatedSubject, error: updateError } = await supabase
          .from('subjects')
          .update({
            name: updateName,
            code: updateCode
          })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Update subject error:', updateError);
          if (updateError.code === '23505') { // Unique constraint violation
            res.status(409).json({ error: 'Subject code must be unique' });
          } else if (updateError.code === 'PGRST116') { // Not found
            res.status(404).json({ error: 'Subject not found' });
          } else {
            res.status(500).json({ error: updateError.message });
          }
          return;
        }
        res.status(200).json(updatedSubject);
        break;

      case 'DELETE':
        // Delete subject
        const { id: deleteId } = req.query;
        if (!deleteId) {
          return res.status(400).json({ error: 'Subject ID is required' });
        }
        
        const { error: deleteError } = await supabase
          .from('subjects')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) {
          console.error('Delete subject error:', deleteError);
          return res.status(404).json({ error: 'Subject not found' });
        }
        res.status(200).json({ message: 'Subject deleted successfully' });
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