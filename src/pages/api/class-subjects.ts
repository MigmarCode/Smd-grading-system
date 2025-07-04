import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const { class_id: queryClassId } = req.query;
        
        if (queryClassId) {
          // Get subjects for a specific class
          const { data: classSubjects, error: classSubjectsError } = await supabase
            .from('class_subjects')
            .select('subject_id')
            .eq('class_id', queryClassId);
          
          if (classSubjectsError) {
            console.error('Get class subjects error:', classSubjectsError);
            res.status(500).json({ error: classSubjectsError.message });
            return;
          }
          
          const subjectIds = classSubjects.map(cs => cs.subject_id);
          
          if (subjectIds.length === 0) {
            res.status(200).json([]);
            return;
          }
          
          const { data: subjects, error } = await supabase
            .from('subjects')
            .select('*')
            .in('id', subjectIds)
            .order('name', { ascending: true });
          
          if (error) {
            console.error('Get subjects error:', error);
            res.status(500).json({ error: error.message });
            return;
          }
          res.status(200).json(subjects);
        } else {
          // Get all class-subject relationships
          const { data: relationships, error } = await supabase
            .from('class_subjects')
            .select(`
              *,
              classes(name),
              subjects(name)
            `)
            .order('classes(name)', { ascending: true })
            .order('subjects(name)', { ascending: true });
          
          if (error) {
            console.error('Get all relationships error:', error);
            res.status(500).json({ error: error.message });
            return;
          }
          res.status(200).json(relationships);
        }
        break;

      case 'POST':
        const { class_id: postClassId, subject_ids } = req.body;
        
        if (!postClassId || !subject_ids || !Array.isArray(subject_ids)) {
          return res.status(400).json({ error: 'Invalid data provided' });
        }
        
        // Remove existing relationships for this class
        const { error: deleteError } = await supabase
          .from('class_subjects')
          .delete()
          .eq('class_id', postClassId);
        
        if (deleteError) {
          console.error('Delete class subjects error:', deleteError);
          res.status(500).json({ error: deleteError.message });
          return;
        }
        
        // Add new relationships
        const relationshipsToInsert = subject_ids.map(subject_id => ({
          class_id: postClassId,
          subject_id
        }));
        
        const { error: insertError } = await supabase
          .from('class_subjects')
          .insert(relationshipsToInsert);
        
        if (insertError) {
          console.error('Insert class subjects error:', insertError);
          res.status(500).json({ error: insertError.message });
          return;
        }
        
        res.status(200).json({ message: 'Class subjects updated successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 