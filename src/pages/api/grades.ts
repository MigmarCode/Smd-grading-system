import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all grades or grades for a specific student
        const { student_id: queryStudentId, class_id: queryClassId } = req.query;
        
        if (queryStudentId) {
          // Get grades for specific student
          const { data: grades, error } = await supabase
            .from('grades')
            .select(`
              *,
              students(first_name, last_name),
              classes(name, section),
              teachers(first_name, last_name)
            `)
            .eq('student_id', queryStudentId)
            .order('term', { ascending: true })
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Get grades by student error:', error);
            res.status(500).json({ error: error.message });
            return;
          }
          res.status(200).json(grades);
        } else if (queryClassId) {
          // Get grades for specific class
          const { data: grades, error } = await supabase
            .from('grades')
            .select(`
              *,
              students(first_name, last_name, roll_no),
              classes(name, section),
              teachers(first_name, last_name)
            `)
            .eq('class_id', queryClassId)
            .order('students(roll_no)', { ascending: true })
            .order('term', { ascending: true })
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Get grades by class error:', error);
            res.status(500).json({ error: error.message });
            return;
          }
          res.status(200).json(grades);
        } else {
          // Get all grades
          const { data: grades, error } = await supabase
            .from('grades')
            .select(`
              *,
              students(first_name, last_name),
              classes(name, section),
              teachers(first_name, last_name)
            `)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Get all grades error:', error);
            res.status(500).json({ error: error.message });
            return;
          }
          res.status(200).json(grades);
        }
        break;

      case 'POST':
        // Handle bulk grade submission
        const { grades: gradeEntries } = req.body;
        
        if (!gradeEntries || !Array.isArray(gradeEntries)) {
          return res.status(400).json({ error: 'Grades array is required' });
        }

        // Prepare the data for bulk insert
        const gradesToInsert = gradeEntries.map(gradeEntry => {
          const {
            student_id,
            teacher_id,
            class_id,
            term,
            mathematics,
            science,
            english,
            social_studies,
            computer_science,
            physical_education,
            extra_curricular,
            total_marks,
            percentage,
            grade,
            remark_english,
            remark_other
          } = gradeEntry;

          return {
            student_id,
            teacher_id,
            class_id,
            term,
            mathematics: mathematics || 0,
            science: science || 0,
            english: english || 0,
            social_studies: social_studies || 0,
            computer_science: computer_science || 0,
            physical_education: physical_education || 0,
            extra_curricular: extra_curricular || 0,
            total_marks: total_marks || 0,
            percentage: percentage || 0,
            grade: grade || '',
            remark_english: remark_english || '',
            remark_other: remark_other || ''
          };
        });

        // Use upsert to handle duplicates gracefully
        const { data: insertedGrades, error: insertError } = await supabase
          .from('grades')
          .upsert(gradesToInsert, { onConflict: 'student_id,class_id,term' })
          .select();
        
        if (insertError) {
          console.error('Insert grades error:', insertError);
          res.status(500).json({ error: insertError.message });
          return;
        }
        
        res.status(201).json({ 
          message: 'Grades submitted successfully',
          count: insertedGrades.length,
          grades: insertedGrades
        });
        break;

      case 'PUT':
        // Update existing grade record
        const { id, ...updateData } = req.body;
        
        const { data: updatedGrade, error: updateError } = await supabase
          .from('grades')
          .update({
            mathematics: updateData.mathematics || 0,
            science: updateData.science || 0,
            english: updateData.english || 0,
            social_studies: updateData.social_studies || 0,
            computer_science: updateData.computer_science || 0,
            physical_education: updateData.physical_education || 0,
            extra_curricular: updateData.extra_curricular || 0,
            total_marks: updateData.total_marks || 0,
            percentage: updateData.percentage || 0,
            grade: updateData.grade || '',
            remark_english: updateData.remark_english || '',
            remark_other: updateData.remark_other || ''
          })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError || !updatedGrade) {
          console.error('Update grade error:', updateError);
          res.status(404).json({ error: 'Grade record not found' });
          return;
        }
        
        res.status(200).json(updatedGrade);
        break;

      case 'DELETE':
        // Delete grade record
        const { id: deleteId } = req.query;
        
        const { error: deleteError } = await supabase
          .from('grades')
          .delete()
          .eq('id', deleteId);
        
        if (deleteError) {
          console.error('Delete grade error:', deleteError);
          res.status(404).json({ error: 'Grade record not found' });
          return;
        }
        
        res.status(200).json({ message: 'Grade deleted successfully' });
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