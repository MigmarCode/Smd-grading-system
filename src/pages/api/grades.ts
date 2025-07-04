import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "../../lib/supabaseClient";

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

        // Prepare the data for bulk insert/update
        const gradesToInsert = gradeEntries.map(gradeEntry => ({
          ...gradeEntry
        }));

        // For each grade entry, we need to merge with existing data if it exists
        const finalGradesToInsert = [];
        
        for (const gradeEntry of gradesToInsert) {
          // Check if a grade record already exists for this student, class, and term
          const { data: existingGrade } = await supabase
            .from('grades')
            .select('*')
            .eq('student_id', gradeEntry.student_id)
            .eq('class_id', gradeEntry.class_id)
            .eq('term', gradeEntry.term)
            .single();

          if (existingGrade) {
            // Merge with existing data, preserving existing subject grades and adding new ones
            const mergedGrade = {
              ...existingGrade,
              teacher_id: gradeEntry.teacher_id, // Update teacher
              // Preserve existing subject grades and add new ones
              tib1: gradeEntry.tib1 > 0 ? gradeEntry.tib1 : existingGrade.tib1 || 0,
              tib2: gradeEntry.tib2 > 0 ? gradeEntry.tib2 : existingGrade.tib2 || 0,
              com: gradeEntry.com > 0 ? gradeEntry.com : existingGrade.com || 0,
              eng: gradeEntry.eng > 0 ? gradeEntry.eng : existingGrade.eng || 0,
              nep: gradeEntry.nep > 0 ? gradeEntry.nep : existingGrade.nep || 0,
              math: gradeEntry.math > 0 ? gradeEntry.math : existingGrade.math || 0,
              hea: gradeEntry.hea > 0 ? gradeEntry.hea : existingGrade.hea || 0,
              sam: gradeEntry.sam > 0 ? gradeEntry.sam : existingGrade.sam || 0,
              sci: gradeEntry.sci > 0 ? gradeEntry.sci : existingGrade.sci || 0,
              // Keep old columns for backward compatibility
              mathematics: existingGrade.mathematics || 0,
              science: existingGrade.science || 0,
              english: existingGrade.english || 0,
              social_studies: existingGrade.social_studies || 0,
              computer_science: existingGrade.computer_science || 0,
              physical_education: existingGrade.physical_education || 0,
              extra_curricular: existingGrade.extra_curricular || 0,
              // Recalculate total marks and percentage
              total_marks: 0,
              percentage: 0
            };
            
            // Calculate new total marks from all subject columns
            const subjectMarks = [
              mergedGrade.tib1, mergedGrade.tib2, mergedGrade.com, mergedGrade.eng,
              mergedGrade.nep, mergedGrade.math, mergedGrade.hea, mergedGrade.sam, mergedGrade.sci,
              mergedGrade.mathematics, mergedGrade.science, mergedGrade.english,
              mergedGrade.social_studies, mergedGrade.computer_science,
              mergedGrade.physical_education, mergedGrade.extra_curricular
            ];
            
            mergedGrade.total_marks = subjectMarks.reduce((sum, mark) => sum + (mark || 0), 0);
            
            // Calculate percentage (assuming max marks per subject is 100)
            const maxPossibleMarks = subjectMarks.length * 100;
            mergedGrade.percentage = maxPossibleMarks > 0 ? (mergedGrade.total_marks / maxPossibleMarks) * 100 : 0;
            
            finalGradesToInsert.push(mergedGrade);
          } else {
            // New grade record
            finalGradesToInsert.push(gradeEntry);
          }
        }

        // Use upsert to handle duplicates gracefully
        let { data: insertedGrades, error: insertError } = await supabase
          .from('grades')
          .upsert(finalGradesToInsert, { onConflict: 'student_id,class_id,term' })
          .select();
        
        // Initialize insertedGrades as empty array if null
        let finalInsertedGrades = insertedGrades || [];
        
        // If the constraint doesn't exist, handle it manually
        if (insertError && insertError.code === '42P10') {
          console.log('Unique constraint not found, handling conflicts manually...');
          
          // For each grade entry, check if it exists and update or insert accordingly
          const results = [];
          for (const gradeEntry of finalGradesToInsert) {
            const { data: existingGrade } = await supabase
              .from('grades')
              .select('*')
              .eq('student_id', gradeEntry.student_id)
              .eq('class_id', gradeEntry.class_id)
              .eq('term', gradeEntry.term)
              .single();
            
            if (existingGrade) {
              // Update existing grade
              const { data: updatedGrade, error: updateError } = await supabase
                .from('grades')
                .update(gradeEntry)
                .eq('id', existingGrade.id)
                .select()
                .single();
              
              if (updateError) {
                console.error('Update error:', updateError);
                return res.status(500).json({ error: updateError.message });
              }
              results.push(updatedGrade);
            } else {
              // Insert new grade
              const { data: newGrade, error: insertError } = await supabase
                .from('grades')
                .insert(gradeEntry)
                .select()
                .single();
              
              if (insertError) {
                console.error('Insert error:', insertError);
                return res.status(500).json({ error: insertError.message });
              }
              results.push(newGrade);
            }
          }
          
          finalInsertedGrades = results;
          insertError = null;
        }
        
        if (insertError) {
          console.error('Insert grades error:', insertError);
          res.status(500).json({ error: insertError.message });
          return;
        }
        
        res.status(201).json({ 
          message: 'Grades submitted successfully',
          count: finalInsertedGrades.length,
          grades: finalInsertedGrades
        });
        break;

      case 'PUT':
        // Update existing grade record
        const { id, ...updateData } = req.body;
        
        const { data: updatedGrade, error: updateError } = await supabase
          .from('grades')
          .update({
            // New subject columns
            tib1: updateData.tib1 || 0,
            tib2: updateData.tib2 || 0,
            com: updateData.com || 0,
            eng: updateData.eng || 0,
            nep: updateData.nep || 0,
            math: updateData.math || 0,
            hea: updateData.hea || 0,
            sam: updateData.sam || 0,
            sci: updateData.sci || 0,
            // Old columns for backward compatibility
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
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 