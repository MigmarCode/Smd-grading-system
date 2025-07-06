"use client";
import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function GradesNewDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [grades, setGrades] = useState<any[]>([]);

  // New state variables for bulk entry table
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkTerm, setBulkTerm] = useState("");
  const [bulkGrades, setBulkGrades] = useState<{[key: string]: {theory: string, practical: string, remark: string}}>({});
  const [bulkMessage, setBulkMessage] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.replace("/subject-teacher/login");
        return;
      }
      if (data.user.user_metadata?.role !== "subject_teacher") {
        router.replace("/not-authorized");
        return;
      }
      setUser(data.user);
      setLoading(false);
    };
    getUser();
  }, [router]);

  useEffect(() => {
    fetch("/api/classes").then(res => res.json()).then(setClasses);
    fetch("/api/subjects").then(res => res.json()).then(setSubjects);
    fetch("/api/teachers").then(res => res.json()).then(setTeachers);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetch(`/api/students?class_id=${selectedClass}`)
        .then(res => res.json())
        .then(setStudents);
      // Fetch grades for this class
      fetch(`/api/grades-new?class_id=${selectedClass}`)
        .then(res => res.json())
        .then(data => setGrades(data.grades || []));
    } else {
      setStudents([]);
      setGrades([]);
    }
  }, [selectedClass]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  // Handle bulk grade submission
  const handleBulkSubmit = async () => {
    setBulkMessage("");
    if (!selectedClass || !bulkSubject || !bulkTerm || !selectedTeacher) {
      setBulkMessage("Please select class, subject, term, and teacher.");
      return;
    }

    const gradeEntries = Object.entries(bulkGrades).filter(([_, grades]) => 
      grades.theory !== "" || grades.practical !== ""
    );

    if (gradeEntries.length === 0) {
      setBulkMessage("Please enter at least one grade.");
      return;
    }

    try {
      const promises = gradeEntries.map(([studentId, grades]) => {
        const totalMarks = (parseInt(grades.theory, 10) || 0) + (parseInt(grades.practical, 10) || 0);
        return fetch("/api/grades-new", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            class_id: selectedClass,
            student_id: studentId,
            subject_id: bulkSubject,
            teacher_id: selectedTeacher,
            term: bulkTerm,
            marks: totalMarks,
            remark: grades.remark
          })
        });
      });

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(res => res.ok);

      if (allSuccessful) {
        setBulkMessage(`${gradeEntries.length} grades submitted successfully!`);
        setBulkGrades({});
        // Refresh grades
        fetch(`/api/grades-new?class_id=${selectedClass}`)
          .then(res => res.json())
          .then(data => setGrades(data.grades || []));
      } else {
        setBulkMessage("Some grades failed to submit. Please try again.");
      }
    } catch (error) {
      setBulkMessage("Error submitting grades. Please try again.");
    }
  };

  // Handle bulk grade input change
  const handleBulkGradeChange = (studentId: string, field: 'theory' | 'practical' | 'remark', value: string) => {
    setBulkGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Topbar/Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-blue-100 flex items-center justify-center">
              <img src="/SMD_Logo.png" alt="SMD Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-blue-900 tracking-tight">Enter Subject Grades</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-blue-800 hidden sm:block">
              {user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}` : user.email}
            </span>
            <button
              className="px-3 lg:px-4 py-2 text-white rounded-lg hover:bg-red-800 transition-colors duration-200 font-medium flex items-center space-x-1 lg:space-x-2 text-sm lg:text-base"
              style={{ backgroundColor: '#9b2037' }}
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/');
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-3xl mx-auto py-10 px-2">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center tracking-tight">Enter Subject Grades</h1>

        {/* New Bulk Entry Table */}
        <div className="bg-white/90 rounded-2xl shadow-xl border border-blue-100 p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Bulk Grade Entry</h2>
          <p className="text-sm text-blue-700 mb-6">Enter grades for all students in the selected class at once.</p>
          
          {/* Bulk Entry Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-800">Subject Teacher</label>
              <select 
                value={selectedTeacher} 
                onChange={e => setSelectedTeacher(e.target.value)} 
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white"
              >
                <option value="">Select teacher</option>
                {teachers.map((teacher: any) => (
                  <option key={teacher.id} value={teacher.id}>{teacher.first_name} {teacher.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-800">Class</label>
              <select 
                value={selectedClass} 
                onChange={e => setSelectedClass(e.target.value)} 
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white"
              >
                <option value="">Select class</option>
                {classes.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>{cls.name}{cls.section ? ` - ${cls.section}` : ""}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-800">Subject</label>
              <select 
                value={bulkSubject} 
                onChange={e => setBulkSubject(e.target.value)} 
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white"
              >
                <option value="">Select subject</option>
                {subjects.map((subj: any) => (
                  <option key={subj.id} value={subj.id}>{subj.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-800">Term</label>
              <select 
                value={bulkTerm} 
                onChange={e => setBulkTerm(e.target.value)} 
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white"
              >
                <option value="">Select term</option>
                <option value="first">First</option>
                <option value="second">Second</option>
                <option value="third">Third</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleBulkSubmit}
                disabled={!selectedClass || !bulkSubject || !bulkTerm || !selectedTeacher}
                className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-lg shadow hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit All Grades
              </button>
            </div>
          </div>

          {bulkMessage && (
            <div className="mb-4 text-center text-base font-medium text-green-700 bg-green-50 rounded-lg py-2">
              {bulkMessage}
            </div>
          )}

          {/* Bulk Entry Table */}
          {selectedClass && students.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-green-100 text-green-900">
                    <th className="px-4 py-2 border-b font-semibold">Student</th>
                    <th className="px-4 py-2 border-b font-semibold">Theory</th>
                    <th className="px-4 py-2 border-b font-semibold">Practical</th>
                    <th className="px-4 py-2 border-b font-semibold">Total</th>
                    <th className="px-4 py-2 border-b font-semibold">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student: any) => {
                    const studentGrades = bulkGrades[student.id] || { theory: '', practical: '', remark: '' };
                    const total = (parseInt(studentGrades.theory, 10) || 0) + (parseInt(studentGrades.practical, 10) || 0);
                    
                    return (
                      <tr key={student.id} className="hover:bg-green-50 transition-colors">
                        <td className="px-4 py-2 border-b font-medium">
                          {student.first_name} {student.last_name} 
                          <span className="text-xs text-green-500 block">({student.student_id})</span>
                        </td>
                        <td className="px-4 py-2 border-b">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={studentGrades.theory}
                            onChange={(e) => handleBulkGradeChange(student.id, 'theory', e.target.value)}
                            className="w-full border border-green-200 rounded px-2 py-1 focus:ring-2 focus:ring-green-300 focus:outline-none"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-2 border-b">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={studentGrades.practical}
                            onChange={(e) => handleBulkGradeChange(student.id, 'practical', e.target.value)}
                            className="w-full border border-green-200 rounded px-2 py-1 focus:ring-2 focus:ring-green-300 focus:outline-none"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-2 border-b text-center font-semibold text-green-800">
                          {total}
                        </td>
                        <td className="px-4 py-2 border-b">
                          <input
                            type="text"
                            value={studentGrades.remark}
                            onChange={(e) => handleBulkGradeChange(student.id, 'remark', e.target.value)}
                            className="w-full border border-green-200 rounded px-2 py-1 focus:ring-2 focus:ring-green-300 focus:outline-none"
                            placeholder={`${subjects.find(s => s.id === bulkSubject)?.name || 'Subject'} Remark`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {selectedClass && students.length === 0 && (
            <div className="text-center py-8 text-green-700">
              No students found in this class.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 