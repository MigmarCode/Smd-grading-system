"use client";
import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from '@supabase/supabase-js';

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedTerm, setSelectedTerm] = useState("first");
  const [showClassResultSheet, setShowClassResultSheet] = useState(false);
  const [submittedGrades, setSubmittedGrades] = useState<any[]>([]);
  const [gradeStatus, setGradeStatus] = useState<{ [subjectId: string]: { graded: number; total: number } }>({});
  const tableRef = useRef<HTMLDivElement>(null);
  const studentRefs = useRef<{ [studentId: string]: HTMLDivElement | null }>({});
  const classResultRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPdfToast, setShowPdfToast] = useState(false);

  // All useEffect hooks at the top
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.replace("/teacher/login");
        return;
      }
      if (data.user.user_metadata?.role !== "class_teacher") {
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
  }, []);

  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      // Fetch students for the selected class
      fetch(`/api/students?class_id=${selectedClass}`)
        .then(res => res.json())
        .then(data => {
          setStudents(data);
        });
      // Fetch subjects assigned to this class
      fetch(`/api/class-subjects?class_id=${selectedClass}`)
        .then(res => res.json())
        .then(data => {
          const sortedSubjects = sortSubjectsByOrder(data);
          setSubjects(sortedSubjects);
        });
      // Fetch submitted grades for this class and term from grades-new
      fetch(`/api/grades-new?class_id=${selectedClass}&term=${selectedTerm}`)
        .then(res => res.json())
        .then(data => {
          setSubmittedGrades(data.grades || []);
          // Calculate grade status for each subject
          const status: { [subjectId: string]: { graded: number; total: number } } = {};
          subjects.forEach(subject => {
            // Count students who have grades for this subject
            const gradedStudents = (data.grades || []).filter((g: any) => g.subject_id === subject.id && g.marks > 0);
            status[subject.id] = {
              graded: gradedStudents.length,
              total: students.length
            };
          });
          setGradeStatus(status);
          setLoading(false);
        });
    } else {
      setStudents([]);
      setSubjects([]);
      setSubmittedGrades([]);
      setGradeStatus({});
    }
  }, [selectedClass, selectedTerm]);

  // Get grade for a specific student and subject (grades_new structure)
  const getStudentGrade = (studentId: string, subjectId: string) => {
    const grade = submittedGrades.find(g => g.student_id === studentId && g.subject_id === subjectId && g.term === selectedTerm);
    return grade ? grade.marks : null;
  };

  // Calculate total and grade for a student
  const calculateStudentTotalAndGrade = (studentId: string) => {
    const marks = subjects.map(subject => {
      const grade = getStudentGrade(studentId, subject.id);
      return grade ? parseInt(grade, 10) : 0;
    });
    const total = marks.reduce((sum, mark) => sum + (isNaN(mark) ? 0 : mark), 0);
    const maxMarks = subjects.length * 100; // Assuming 100 per subject
    const percentage = maxMarks > 0 ? (total / maxMarks) * 100 : 0;
    
    let grade = "Failed";
    if (percentage >= 80) grade = "Distinction";
    else if (percentage >= 60) grade = "First Division";
    else if (percentage >= 50) grade = "Third Division";
    
    return { 
      total, 
      grade, 
      percentage: percentage.toFixed(1),
      maxMarks 
    };
  };

  // Calculate subject statistics
  const calculateSubjectStats = (subjectCode: string) => {
    const subjectGrades = submittedGrades.filter(g => g.term === selectedTerm);
    
    if (subjectGrades.length === 0) return { average: 0, total: 0, count: 0 };
    
    const subjectCodeLower = subjectCode.toLowerCase();
    const marks = subjectGrades.map(grade => {
      return (grade as any)[subjectCodeLower] || 0;
    });
    
    const total = marks.reduce((sum, mark) => sum + mark, 0);
    const average = total / marks.length;
    
    return {
      average: average.toFixed(1),
      total,
      count: marks.length
    };
  };

  // Print table
  const handlePrint = () => {
    window.print();
  };

  // Download PDF of the whole table
  const handleDownloadPDF = async () => {
    if (!tableRef.current) return;
    const element = tableRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape" });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`class_result_${selectedClass}_${selectedTerm}.pdf`);
  };

  // Print individual student result
  const handlePrintStudent = (studentId: string) => {
    const printContents = studentRefs.current[studentId]?.innerHTML;
    if (!printContents) return;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Student Result</title>');
    printWindow.document.write('</head><body >');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Download PDF of individual student result
  const handleDownloadStudentPDF = async (studentId: string) => {
    const element = studentRefs.current[studentId];
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`student_result_${studentId}_${selectedTerm}.pdf`);
  };

  // Get grade color based on grade
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-emerald-600 bg-emerald-50';
      case 'A': return 'text-emerald-600 bg-emerald-50';
      case 'B': return 'text-blue-600 bg-blue-50';
      case 'C': return 'text-yellow-600 bg-yellow-50';
      case 'D': return 'text-orange-600 bg-orange-50';
      case 'F': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  // Get badge color based on admission number prefix
  const getBadgeColor = (admissionNumber: string) => {
    const prefix = admissionNumber.charAt(0).toUpperCase();
    switch (prefix) {
      case 'M': return 'bg-[#9b2037] text-white'; // Monk - dark red/maroon with white text
      case 'N': return 'bg-[#fff884] text-slate-900'; // Nun - yellow with dark text
      case 'B': return 'bg-teal-500 text-white'; // Boarding - teal with white text
      case 'D': return 'bg-amber-500 text-white'; // Day Boarding - amber with white text
      default: return 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'; // Default blue gradient with white text
    }
  };

  // Preview class result sheet
  const handlePreviewClassResult = () => {
    const printContents = classResultRef.current?.innerHTML;
    if (!printContents) return;
    const previewWindow = window.open('', '_blank', 'height=800,width=800,scrollbars=yes,resizable=yes');
    if (!previewWindow) return;
    previewWindow.document.write('<html><head><title>Class Result Sheet Preview</title>');
    previewWindow.document.write('<style>');
    previewWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }');
    previewWindow.document.write('.result-sheet { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 0 auto; }');
    previewWindow.document.write('@page { size: A4 landscape; margin: 10mm; }');
    previewWindow.document.write('table { page-break-inside: auto; }');
    previewWindow.document.write('tr { page-break-inside: avoid; page-break-after: auto; }');
    previewWindow.document.write('thead { display: table-header-group; }');
    previewWindow.document.write('tfoot { display: table-footer-group; }');
    previewWindow.document.write('</style>');
    previewWindow.document.write('</head><body>');
    previewWindow.document.write('<div class="result-sheet">');
    previewWindow.document.write(printContents);
    previewWindow.document.write('</div>');
    previewWindow.document.write('</body></html>');
    previewWindow.document.close();
  };

  // Print class result sheet
  const handlePrintClassResult = () => {
    const printContents = classResultRef.current?.innerHTML;
    if (!printContents) return;
    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Class Result Sheet</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
    printWindow.document.write('@page { size: A4 landscape; margin: 10mm; }');
    printWindow.document.write('table { page-break-inside: auto; }');
    printWindow.document.write('tr { page-break-inside: avoid; page-break-after: auto; }');
    printWindow.document.write('thead { display: table-header-group; }');
    printWindow.document.write('tfoot { display: table-footer-group; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Download class result PDF
  const handleDownloadClassPDF = async () => {
    setPdfLoading(true);
    const element = classResultRef.current;
    if (!element) {
      setPdfLoading(false);
      return;
    }
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape" });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`class_result_${selectedClass}_${selectedTerm}.pdf`);
    setPdfLoading(false);
    setShowPdfToast(true);
    setTimeout(() => setShowPdfToast(false), 2000);
  };

  // Sort subjects in the order required for school result sheet
  const sortSubjectsByOrder = (subjects: any[]) => {
    const getPriority = (subjectName: string) => {
      const name = subjectName.toLowerCase().trim();
      
      if (name.includes('tibetan') && name.includes('1')) return 0;
      if (name.includes('tibetan') && name.includes('2')) return 1;
      if (name.includes('english') || name.includes('englsih')) return 2;
      if (name.includes('nepali')) return 3;
      if (name.includes('science')) return 4;
      if (name.includes('samajik')) return 5;
      if (name.includes('mathematics') || name.includes('math')) return 6;
      if (name.includes('computer')) return 7;
      if (name.includes('health')) return 8;
      if (name.includes('optional')) return 9;
      if (name.includes('sero') && name.includes('fero')) return 10;
      if (name.includes('social')) return 11;
      
      return 999;
    };
    
    return subjects.sort((a, b) => {
      const aPriority = getPriority(a.name);
      const bPriority = getPriority(b.name);
      return aPriority - bPriority;
    });
  };

  // Calculate overall class statistics
  const calculateClassStats = () => {
    if (students.length === 0) return null;

    let totalStudents = students.length;
    let gradedStudents = 0;
    let totalMarks = 0;
    let passedStudents = 0;

    students.forEach(student => {
      const studentResult = calculateStudentTotalAndGrade(student.id);
      if (studentResult.total > 0) {
        gradedStudents++;
        totalMarks += studentResult.total;
        if (parseFloat(studentResult.percentage) >= 40) {
          passedStudents++;
        }
      }
    });

    const averageMarks = gradedStudents > 0 ? totalMarks / gradedStudents : 0;
    const passRate = totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0;
    const completionRate = totalStudents > 0 ? (gradedStudents / totalStudents) * 100 : 0;

    return {
      totalStudents,
      gradedStudents,
      averageMarks: averageMarks.toFixed(1),
      passRate: passRate.toFixed(1),
      completionRate: completionRate.toFixed(1)
    };
  };

  const classStats = calculateClassStats();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffef2' }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Class Teacher Dashboard</h1>
                <p className="text-xs lg:text-sm text-slate-600 font-medium hidden sm:block">Monitor and generate reports for your class</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <p className="text-sm text-slate-600">Welcome, {user?.user_metadata?.first_name ? `${user?.user_metadata?.first_name} ${user?.user_metadata?.last_name}` : user?.email}</p>
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  router.push("/");
                }}
                className="px-3 lg:px-4 py-2 text-white rounded-lg hover:bg-red-800 transition-colors duration-200 font-medium flex items-center space-x-1 lg:space-x-2 text-sm lg:text-base"
                style={{ backgroundColor: '#9b2037' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
          {/* Selection Controls */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 lg:p-8 mb-6 lg:mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-base lg:text-lg font-medium"
                >
                  <option value="">Choose your class...</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}{cls.section ? ` - ${cls.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Term Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Select Term</label>
                <select
                  value={selectedTerm}
                  onChange={e => setSelectedTerm(e.target.value)}
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-base lg:text-lg font-medium"
                >
                  <option value="first">First Term</option>
                  <option value="second">Second Term</option>
                  <option value="third">Third Term</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end space-x-3">
                <button
                  onClick={handlePreviewClassResult}
                  disabled={!selectedClass || loading}
                  className="flex-1 px-4 py-3 lg:py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Preview Results
                </button>
                <button
                  onClick={handleDownloadClassPDF}
                  disabled={!selectedClass || loading || pdfLoading}
                  className="flex-1 px-4 py-3 lg:py-4 bg-pink-600 text-white font-semibold rounded-xl shadow-lg hover:bg-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pdfLoading ? "Generating..." : "Download PDF"}
                </button>
              </div>
            </div>
          </div>

          {/* Class Statistics */}
          {classStats && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="bg-blue-50 rounded-xl p-4 lg:p-6 border border-blue-200">
                <div className="text-2xl lg:text-3xl font-bold text-blue-600">{classStats.totalStudents}</div>
                <div className="text-sm lg:text-base text-blue-700">Total Students</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 lg:p-6 border border-emerald-200">
                <div className="text-2xl lg:text-3xl font-bold text-emerald-600">{classStats.gradedStudents}</div>
                <div className="text-sm lg:text-base text-emerald-700">Graded Students</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 lg:p-6 border border-purple-200">
                <div className="text-2xl lg:text-3xl font-bold text-purple-600">{classStats.averageMarks}</div>
                <div className="text-sm lg:text-base text-purple-700">Average Marks</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 lg:p-6 border border-orange-200">
                <div className="text-2xl lg:text-3xl font-bold text-orange-600">{classStats.passRate}%</div>
                <div className="text-sm lg:text-base text-orange-700">Pass Rate</div>
              </div>
              <div className="bg-teal-50 rounded-xl p-4 lg:p-6 border border-teal-200">
                <div className="text-2xl lg:text-3xl font-bold text-teal-600">{classStats.completionRate}%</div>
                <div className="text-sm lg:text-base text-teal-700">Completion Rate</div>
              </div>
            </div>
          )}

          {/* Grades Table */}
          {selectedClass && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 lg:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl lg:text-2xl font-bold text-slate-900">Student Grades Overview</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Print
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              </div>

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
                <div className="overflow-x-auto" ref={tableRef}>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 border border-slate-200">Student</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200">Roll No</th>
                        {subjects.map(subject => (
                          <th key={subject.id} className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200">
                            {subject.name}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200">Total</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200">Percentage</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200">Division</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 border border-slate-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .sort((a, b) => parseInt(a.roll_no || '0', 10) - parseInt(b.roll_no || '0', 10))
                        .map((student) => {
                          const studentResult = calculateStudentTotalAndGrade(student.id);
                          
                          return (
                            <tr key={student.id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 border border-slate-200">
                                <div>
                                  <div className="font-medium text-slate-900">{student.first_name} {student.last_name}</div>
                                  <div className="text-sm text-slate-600">{student.student_id}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center border border-slate-200">
                                {student.roll_no || 'N/A'}
                              </td>
                              {subjects.map(subject => {
                                const grade = getStudentGrade(student.id, subject.id);
                                return (
                                  <td key={subject.id} className="px-4 py-3 text-center border border-slate-200">
                                    <span className={`font-semibold ${grade ? 'text-slate-900' : 'text-slate-400'}`}>
                                      {grade || '-'}
                                    </span>
                                  </td>
                                );
                              })}
                              <td className="px-4 py-3 text-center border border-slate-200">
                                <span className={`font-semibold ${studentResult.total > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {studentResult.total > 0 ? studentResult.total : '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center border border-slate-200">
                                <span className={`font-semibold ${studentResult.total > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {studentResult.total > 0 ? `${studentResult.percentage}%` : '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center border border-slate-200">
                                {studentResult.total > 0 ? (
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    studentResult.grade === 'Distinction' ? 'bg-purple-100 text-purple-800' :
                                    studentResult.grade === 'First Division' ? 'bg-green-100 text-green-800' :
                                    studentResult.grade === 'Third Division' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {studentResult.grade}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs">Not graded</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center border border-slate-200">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handlePrintStudent(student.id)}
                                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                  >
                                    Print
                                  </button>
                                  <button
                                    onClick={() => handleDownloadStudentPDF(student.id)}
                                    className="px-2 py-1 bg-pink-600 text-white text-xs rounded hover:bg-pink-700 transition-colors"
                                  >
                                    PDF
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {students.map(student => (
  <div
    key={student.id}
    ref={el => { studentRefs.current[student.id] = el; }}
    style={{ display: 'none' }}
  >
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif', width: 600 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Student Result Sheet</h2>
      <p><strong>Name:</strong> {student.first_name} {student.last_name}</p>
      <p><strong>Student ID:</strong> {student.student_id}</p>
      <p><strong>Roll No:</strong> {student.roll_no}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Subject</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Marks</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map(subject => {
            const grade = getStudentGrade(student.id, subject.id);
            return (
              <tr key={subject.id}>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{subject.name}</td>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>{grade ?? '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ marginTop: 16 }}>
        <strong>Total:</strong> {calculateStudentTotalAndGrade(student.id).total}<br />
        <strong>Percentage:</strong> {calculateStudentTotalAndGrade(student.id).percentage}%<br />
        <strong>Division:</strong> {calculateStudentTotalAndGrade(student.id).grade}
      </p>
    </div>
  </div>
))}
                </div>
                
              )}
            </div>
          )}

          {/* Welcome Message */}
          {!selectedClass && (
            <div className="text-center py-12 lg:py-16">
              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 lg:mb-3">Welcome to the Class Coordinator Dashboard</h3>
              <p className="text-slate-600 text-base lg:text-lg">Please select a class to view grades submitted by subject teachers and generate reports.</p>
            </div>
          )}

          {/* PDF Toast */}
          {showPdfToast && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              PDF downloaded successfully!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

