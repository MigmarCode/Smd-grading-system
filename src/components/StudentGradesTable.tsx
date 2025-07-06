'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface StudentGradesTableProps {
  isEditable?: boolean;
  userRole?: 'admin' | 'teacher' | 'student' | 'parent';
  selectedClass?: string;
  selectedTerm?: string;
  className?: string; // New prop for class name display
  onGradeChange?: (studentId: string, subjectId: string, field: 'theory' | 'practical', value: string) => void;
  onSaveGrades?: (changes: any[]) => Promise<void>;
  showActions?: boolean;
  showCalculations?: boolean;
  onPreviewResults?: () => void;
  onPrintResults?: () => void;
  onDownloadPDF?: () => void;
  showPreviewDownloadButtons?: boolean;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  roll_no: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  teacher_id: string;
  term: string;
  marks: number;
  remark: string;
  created_at: string;
}

export default function StudentGradesTable({
  isEditable = true,
  userRole = 'teacher',
  selectedClass,
  selectedTerm = 'first',
  className,
  onGradeChange,
  onSaveGrades,
  showActions = true,
  showCalculations = true,
  onPreviewResults,
  onPrintResults,
  onDownloadPDF,
  showPreviewDownloadButtons = false
}: StudentGradesTableProps) {
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [submittedGrades, setSubmittedGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editableGrades, setEditableGrades] = useState<{[key: string]: {[key: string]: {theory: string, practical: string}}}>({});
  const [editingMessage, setEditingMessage] = useState("");

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  // Fetch subjects when class is selected
  useEffect(() => {
    if (selectedClass) {
      fetchSubjects();
    }
  }, [selectedClass]);

  // Fetch grades when class or term changes
  useEffect(() => {
    if (selectedClass && selectedTerm) {
      fetchGrades();
    }
  }, [selectedClass, selectedTerm]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/students?class_id=${selectedClass}`);
      const data = await response.json();
      setStudents(data || []); // API returns students directly, not wrapped
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Sort subjects in the preferred order
  const sortSubjectsByOrder = (subjects: Subject[]) => {
    const subjectOrder = [
      'Tibetan1',
      'Tibetan2', 
      'English',
      'Nepali',
      'Science',
      'Samajik',
      'Mathematics',
      'Computer',
      'Health',
      'Optional'
    ];

    return subjects.sort((a, b) => {
      const aIndex = subjectOrder.indexOf(a.name);
      const bIndex = subjectOrder.indexOf(b.name);
      
      // If both subjects are in the order list, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one is in the order list, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // If neither is in the order list, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/class-subjects?class_id=${selectedClass}`);
      const data = await response.json();
      const sortedSubjects = sortSubjectsByOrder(data || []);
      setSubjects(sortedSubjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/grades-new?class_id=${selectedClass}&term=${selectedTerm}`);
      const data = await response.json();
      setSubmittedGrades(data.grades || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get theory and practical marks for a student and subject
  const getStudentTheoryPractical = (studentId: string, subjectId: string) => {
    const grade = submittedGrades.find(g => g.student_id === studentId && g.subject_id === subjectId && g.term === selectedTerm);
    if (!grade) return { theory: '', practical: '' };
    
    // For now, we'll split the total marks (this is a placeholder - in real implementation, 
    // the database should store theory and practical separately)
    const total = grade.marks;
    // This is a temporary split - ideally the database should store theory/practical separately
    const theory = Math.floor(total * 0.7).toString(); // 70% theory
    const practical = (total - Math.floor(total * 0.7)).toString(); // 30% practical
    
    return { theory, practical };
  };

  // Handle editable grade changes
  const handleGradeChange = (studentId: string, subjectId: string, field: 'theory' | 'practical', value: string) => {
    setEditableGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          ...prev[studentId]?.[subjectId],
          [field]: value
        }
      }
    }));

    // Call parent callback if provided
    if (onGradeChange) {
      onGradeChange(studentId, subjectId, field, value);
    }
  };

  // Save edited grades
  const handleSaveGrades = async () => {
    setEditingMessage("");
    const changes = Object.entries(editableGrades).flatMap(([studentId, subjects]) =>
      Object.entries(subjects).map(([subjectId, grades]) => ({
        studentId,
        subjectId,
        theory: parseInt(grades.theory) || 0,
        practical: parseInt(grades.practical) || 0
      }))
    );

    if (changes.length === 0) {
      setEditingMessage("No changes to save.");
      return;
    }

    try {
      if (onSaveGrades) {
        await onSaveGrades(changes);
      } else {
        // Default save logic
        const promises = changes.map(change => {
          const totalMarks = change.theory + change.practical;
          return fetch("/api/grades-new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              class_id: selectedClass,
              student_id: change.studentId,
              subject_id: change.subjectId,
              teacher_id: user?.id,
              term: selectedTerm,
              marks: totalMarks,
              remark: "Edited by class teacher"
            })
          });
        });

        const responses = await Promise.all(promises);
        const allSuccessful = responses.every(res => res.ok);

        if (allSuccessful) {
          setEditingMessage(`${changes.length} grades updated successfully!`);
          setEditableGrades({});
          // Refresh grades
          fetchGrades();
        } else {
          setEditingMessage("Some grades failed to update. Please try again.");
        }
      }
    } catch (error) {
      setEditingMessage("Error updating grades. Please try again.");
    }
  };

  // Helper function to calculate total marks for a student
  const calculateStudentTotal = (studentId: string) => {
    let total = 0;
    subjects.forEach(subject => {
      const grades = getStudentTheoryPractical(studentId, subject.id);
      const theoryValue = parseInt(grades.theory) || 0;
      const practicalValue = parseInt(grades.practical) || 0;
      total += theoryValue + practicalValue;
    });
    return total;
  };

  // Helper function to calculate percentage for a student
  const calculateStudentPercentage = (studentId: string) => {
    const total = calculateStudentTotal(studentId);
    const totalPossible = subjects.length * 200; // Assuming 100 marks per theory + 100 marks per practical
    return totalPossible > 0 ? Math.round((total / totalPossible) * 100) : 0;
  };

  // Helper function to determine division based on percentage
  const getStudentDivision = (percentage: number) => {
    if (percentage >= 80) return 'First';
    if (percentage >= 60) return 'Second';
    if (percentage >= 40) return 'Third';
    return 'Fail';
  };

  // Helper function to handle print action
  const handlePrintStudent = (studentId: string) => {
    // TODO: Implement print functionality
    console.log('Print result for student:', studentId);
  };

  // Helper function to handle download action
  const handleDownloadStudentPDF = async (studentId: string) => {
    // TODO: Implement download functionality
    console.log('Download result for student:', studentId);
  };

  if (!selectedClass) {
    console.log('No selectedClass, showing welcome message');
    return (
      <div className="text-center py-12 lg:py-16">
        <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 lg:mb-3">Student Grades Table</h3>
        <p className="text-slate-600 text-base lg:text-lg">Please select a class to view grades.</p>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 lg:p-8">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 pb-4 mb-4 z-10 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900">
              {className ? `${className} Grades Table` : 'Student Grades Table'}
            </h3>
            <div className="flex space-x-3">
              {isEditable && (
                <button
                  onClick={handleSaveGrades}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              )}
              {showPreviewDownloadButtons && onPreviewResults && (
                <button
                  onClick={onPreviewResults}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Preview Results
                </button>
              )}
              {showPreviewDownloadButtons && onPrintResults && (
                <button
                  onClick={onPrintResults}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Print Results
                </button>
              )}
              {showPreviewDownloadButtons && onDownloadPDF && (
                <button
                  onClick={onDownloadPDF}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Download PDF
                </button>
              )}
            </div>
          </div>
        </div>

        {editingMessage && (
          <div className="mb-4 text-center text-base font-medium text-green-700 bg-green-50 rounded-lg py-2">
            {editingMessage}
          </div>
        )}

        {/* Scrollable Table Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading grades...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No students found in this class.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 sticky top-0 z-10">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700 border border-slate-200 bg-slate-100">Student</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200 bg-slate-100">Roll No</th>
                    {subjects.map(subject => (
                      <th key={subject.id} className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200 bg-slate-100">
                        {subject.name}
                      </th>
                    ))}
                    {showCalculations && (
                      <>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200 bg-slate-100">Total</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200 bg-slate-100">Percentage</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200 bg-slate-100">Division</th>
                      </>
                    )}
                    {showActions && (
                      <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200 bg-slate-100">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {students
                    .sort((a, b) => parseInt(a.roll_no || '0', 10) - parseInt(b.roll_no || '0', 10))
                    .map((student) => {
                      return (
                        <React.Fragment key={student.id}>
                          {/* Student row with theory inputs */}
                          <tr className="hover:bg-slate-50">
                            <td className="px-4 py-3 border border-slate-200" rowSpan={2}>
                              <div>
                                <div className="font-medium text-slate-900">{student.first_name} {student.last_name}</div>
                                <div className="text-sm text-slate-600">{student.student_id}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center border border-slate-200" rowSpan={2}>
                              {student.roll_no || 'N/A'}
                            </td>
                            {subjects.map(subject => {
                              const existingGrades = getStudentTheoryPractical(student.id, subject.id);
                              const editedGrades = editableGrades[student.id]?.[subject.id];
                              const theoryValue = editedGrades?.theory || existingGrades.theory;
                              
                              return (
                                <td key={subject.id} className="px-4 py-3 text-center border border-slate-200">
                                  {isEditable ? (
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={theoryValue}
                                      onChange={(e) => handleGradeChange(student.id, subject.id, 'theory', e.target.value)}
                                      className="w-full border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 focus:outline-none text-center"
                                      placeholder="Theory"
                                    />
                                  ) : (
                                    <span className="font-semibold text-slate-900">{theoryValue || '-'}</span>
                                  )}
                                </td>
                              );
                            })}
                            {showCalculations && (
                              <>
                                <td className="px-4 py-3 text-center border border-slate-200"></td>
                                <td className="px-4 py-3 text-center border border-slate-200"></td>
                                <td className="px-4 py-3 text-center border border-slate-200"></td>
                              </>
                            )}
                            {showActions && (
                              <td className="px-4 py-3 text-center border border-slate-200"></td>
                            )}
                          </tr>
                          {/* Student row with practical inputs */}
                          <tr className="hover:bg-slate-50">
                            {subjects.map(subject => {
                              const existingGrades = getStudentTheoryPractical(student.id, subject.id);
                              const editedGrades = editableGrades[student.id]?.[subject.id];
                              const practicalValue = editedGrades?.practical || existingGrades.practical;
                              
                              return (
                                <td key={subject.id} className="px-4 py-3 text-center border border-slate-200">
                                  {isEditable ? (
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={practicalValue}
                                      onChange={(e) => handleGradeChange(student.id, subject.id, 'practical', e.target.value)}
                                      className="w-full border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 focus:outline-none text-center"
                                      placeholder="Practical"
                                    />
                                  ) : (
                                    <span className="font-semibold text-slate-900">{practicalValue || '-'}</span>
                                  )}
                                </td>
                              );
                            })}
                            {showCalculations && (
                              <>
                                <td className="px-4 py-3 text-center border border-slate-200"></td>
                                <td className="px-4 py-3 text-center border border-slate-200"></td>
                                <td className="px-4 py-3 text-center border border-slate-200"></td>
                              </>
                            )}
                            {showActions && (
                              <td className="px-4 py-3 text-center border border-slate-200"></td>
                            )}
                          </tr>
                          {/* Student total row */}
                          <tr className="bg-blue-50 font-semibold">
                            <td className="px-4 py-3 text-center border border-slate-200 text-blue-800" colSpan={2}>
                              Totals
                            </td>
                            {subjects.map(subject => {
                              const existingGrades = getStudentTheoryPractical(student.id, subject.id);
                              const editedGrades = editableGrades[student.id]?.[subject.id];
                              const theoryValue = parseInt(editedGrades?.theory || existingGrades.theory) || 0;
                              const practicalValue = parseInt(editedGrades?.practical || existingGrades.practical) || 0;
                              const total = theoryValue + practicalValue;
                              
                              return (
                                <td key={subject.id} className="px-4 py-3 text-center border border-slate-200 text-blue-800 font-bold">
                                  {total}
                                </td>
                              );
                            })}
                            {showCalculations && (
                              <>
                                <td className="px-4 py-3 text-center border border-slate-200 text-blue-800 font-bold">
                                  {calculateStudentTotal(student.id)}
                                </td>
                                <td className="px-4 py-3 text-center border border-slate-200 text-blue-800 font-bold">
                                  {calculateStudentPercentage(student.id)}%
                                </td>
                                <td className="px-4 py-3 text-center border border-slate-200 text-blue-800 font-bold">
                                  {getStudentDivision(calculateStudentPercentage(student.id))}
                                </td>
                              </>
                            )}
                            {showActions && (
                              <td className="px-4 py-3 text-center border border-slate-200 text-blue-800">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handlePrintStudent(student.id)}
                                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                                  >
                                    Print
                                  </button>
                                  <button
                                    onClick={() => handleDownloadStudentPDF(student.id)}
                                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                                  >
                                    PDF
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
} 