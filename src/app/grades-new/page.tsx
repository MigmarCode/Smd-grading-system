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
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [term, setTerm] = useState("");
  const [theoryMarks, setTheoryMarks] = useState("");
  const [practicalMarks, setPracticalMarks] = useState("");
  const [grades, setGrades] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [remark, setRemark] = useState("");

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

  // Calculate total marks
  const totalMarks =
    (parseInt(theoryMarks, 10) || 0) + (parseInt(practicalMarks, 10) || 0);

  // Handle grade submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!selectedClass || !selectedStudent || !selectedSubject || !selectedTeacher || !term || theoryMarks === "" || practicalMarks === "") {
      setMessage("Please fill all fields.");
      return;
    }
    const res = await fetch("/api/grades-new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: selectedClass,
        student_id: selectedStudent,
        subject_id: selectedSubject,
        teacher_id: selectedTeacher,
        term,
        marks: totalMarks,
        remark
      })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Grade submitted!");
      setTheoryMarks("");
      setPracticalMarks("");
      setRemark("");
      // Refresh grades
      fetch(`/api/grades-new?class_id=${selectedClass}`)
        .then(res => res.json())
        .then(data => setGrades(data.grades || []));
    } else {
      setMessage(data.error || "Error submitting grade.");
    }
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
                // You can implement logout here if needed
                router.push('/subject-teacher/login');
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
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/90 rounded-2xl shadow-xl p-8 mb-10 border border-blue-100">
          <div className="mb-6">
            <label className="block mb-2 text-sm font-semibold text-blue-800">Subject Teacher</label>
            <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white">
              <option value="">Select teacher</option>
              {teachers.map((teacher: any) => (
                <option key={teacher.id} value={teacher.id}>{teacher.first_name} {teacher.last_name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-800">Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white">
                <option value="">Select class</option>
                {classes.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>{cls.name}{cls.section ? ` - ${cls.section}` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-800">Student</label>
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white">
                <option value="">Select student</option>
                {students.map((stu: any) => (
                  <option key={stu.id} value={stu.id}>{stu.first_name} {stu.last_name} ({stu.student_id})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-800">Subject</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white">
                <option value="">Select subject</option>
                {subjects.map((subj: any) => (
                  <option key={subj.id} value={subj.id}>{subj.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-800">Term</label>
              <select value={term} onChange={e => setTerm(e.target.value)} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white">
                <option value="">Select term</option>
                <option value="first">First</option>
                <option value="second">Second</option>
                <option value="third">Third</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-800">Theory</label>
              <input type="number" min="0" max="100" value={theoryMarks} onChange={e => setTheoryMarks(e.target.value)} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white" />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-800">Practical</label>
              <input type="number" min="0" max="100" value={practicalMarks} onChange={e => setPracticalMarks(e.target.value)} className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white" />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-blue-800">Total</label>
              <input type="number" value={totalMarks} readOnly className="w-full border border-blue-100 rounded-lg px-3 py-2 bg-blue-50 text-blue-900 font-bold" />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-blue-800">
              {selectedSubject
                ? `${subjects.find(s => s.id === selectedSubject)?.name || ''} Teacher`
                : 'Teacher Remark'}
            </label>
            <textarea
              value={remark}
              onChange={e => setRemark(e.target.value)}
              className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-white"
              rows={2}
              placeholder="Write a remark for this student (optional, any language)"
            />
          </div>
          <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-lg shadow hover:from-blue-700 hover:to-blue-600 transition-all">Submit Grade</button>
          {message && <div className="mt-3 text-center text-base font-medium text-blue-700 bg-blue-50 rounded-lg py-2">{message}</div>}
        </form>

        <div className="bg-white/90 rounded-2xl shadow-xl border border-blue-100 p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Grades Table</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-blue-100 text-blue-900">
                  <th className="px-4 py-2 border-b font-semibold">Student</th>
                  <th className="px-4 py-2 border-b font-semibold">Subject</th>
                  <th className="px-4 py-2 border-b font-semibold">Teacher</th>
                  <th className="px-4 py-2 border-b font-semibold">Term</th>
                  <th className="px-4 py-2 border-b font-semibold">Marks</th>
                </tr>
              </thead>
              <tbody>
                {grades.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-blue-700">No grades found.</td></tr>
                ) : (
                  grades.map((g: any) => {
                    const stu = students.find((s: any) => s.id === g.student_id) || {};
                    const subj = subjects.find((s: any) => s.id === g.subject_id) || {};
                    const teacher = teachers.find((t: any) => t.id === g.teacher_id) || {};
                    return (
                      <tr key={g.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-2 border-b">{stu.first_name} {stu.last_name} <span className="text-xs text-blue-500">({stu.student_id})</span></td>
                        <td className="px-4 py-2 border-b">{subj.name}</td>
                        <td className="px-4 py-2 border-b">{teacher.first_name} {teacher.last_name}</td>
                        <td className="px-4 py-2 border-b">{g.term}</td>
                        <td className="px-4 py-2 border-b text-center font-semibold text-blue-800">{g.marks}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 