"use client";
import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from '@supabase/supabase-js';
import StudentGradesTable from '@/components/StudentGradesTable';

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

  // Calculate totals for each subject
  const calculateSubjectTotals = () => {
    const totals: {[subjectId: string]: number} = {};
    
    subjects.forEach(subject => {
      let total = 0;
      students.forEach(student => {
        const grades = submittedGrades.find(g => g.student_id === student.id && g.subject_id === subject.id && g.term === selectedTerm);
        if (grades) {
          total += grades.marks;
        } else {
          // Use existing grades if not edited
          const existingGrade = getStudentGrade(student.id, subject.id);
          total += existingGrade || 0;
        }
      });
      totals[subject.id] = total;
    });
    
    return totals;
  };

  // Helper function to calculate total marks for a student
  const calculateStudentTotal = (studentId: string) => {
    let total = 0;
    subjects.forEach(subject => {
      const grades = submittedGrades.find(g => g.student_id === studentId && g.subject_id === subject.id && g.term === selectedTerm);
      if (grades) {
        total += grades.marks;
      } else {
        // Use existing grades if not edited
        const existingGrade = getStudentGrade(studentId, subject.id);
        total += existingGrade || 0;
      }
    });
    return total;
  };

  // Helper function to calculate percentage for a student
  const calculateStudentPercentage = (studentId: string) => {
    const total = calculateStudentTotal(studentId);
    const totalPossible = subjects.length * 100; // Assuming 100 marks per subject
    return totalPossible > 0 ? Math.round((total / totalPossible) * 100) : 0;
  };

  // Helper function to determine division based on percentage
  const getStudentDivision = (percentage: number) => {
    if (percentage >= 80) return 'First';
    if (percentage >= 60) return 'Second';
    if (percentage >= 40) return 'Third';
    return 'Fail';
  };

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

              {/* Action Buttons - Removed, now in StudentGradesTable */}
              <div className="flex items-end">
                <div className="text-sm text-slate-600 italic">
                  Use the buttons in the grades table below
                </div>
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



          {/* Student Grades Table */}
          {selectedClass && (
            <div className="sticky top-0 z-10">
              <StudentGradesTable
                isEditable={true}
                userRole="teacher"
                selectedClass={selectedClass}
                selectedTerm={selectedTerm}
                className={`${classes.find(c => c.id === selectedClass)?.name}${classes.find(c => c.id === selectedClass)?.section ? classes.find(c => c.id === selectedClass)?.section : ''}`}
                showActions={true}
                showCalculations={true}
                onPreviewResults={handlePreviewClassResult}
                onDownloadPDF={handleDownloadClassPDF}
                showPreviewDownloadButtons={true}
              />
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

          {/* Hidden Class Result Sheet for Preview/Download */}
          {selectedClass && (
            <div 
              ref={classResultRef} 
              className="hidden"
              style={{ 
                width: '210mm', 
                minHeight: '297mm', 
                padding: '20mm',
                backgroundColor: 'white',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#333' }}>
                  Himalayan Children's Academy
                </h1>
                <p style={{ fontSize: '14px', margin: '5px 0', color: '#666' }}>
                  Class Result Sheet - {selectedTerm.charAt(0).toUpperCase() + selectedTerm.slice(1)} Term
                </p>
                <p style={{ fontSize: '12px', margin: '5px 0', color: '#666' }}>
                  {classes.find(c => c.id === selectedClass)?.name}{classes.find(c => c.id === selectedClass)?.section ? ` - ${classes.find(c => c.id === selectedClass)?.section}` : ''}
                </p>
              </div>

              {/* Class Statistics */}
              {classStats && (
                <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                  <div style={{ textAlign: 'center', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>{classStats.totalStudents}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Students</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>{classStats.gradedStudents}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Graded Students</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#7c3aed' }}>{classStats.averageMarks}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Average Marks</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ea580c' }}>{classStats.passRate}%</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Pass Rate</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0d9488' }}>{classStats.completionRate}%</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Completion Rate</div>
                  </div>
                </div>
              )}

              {/* Student Results Table */}
              {students.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #333' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>S.No</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Student Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Roll No</th>
                        {subjects.map(subject => (
                          <th key={subject.id} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                            {subject.name}
                          </th>
                        ))}
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Total</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Percentage</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>Division</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .sort((a, b) => parseInt(a.roll_no || '0', 10) - parseInt(b.roll_no || '0', 10))
                        .map((student, index) => {
                          const studentTotal = calculateStudentTotal(student.id);
                          const studentPercentage = calculateStudentPercentage(student.id);
                          const studentDivision = getStudentDivision(studentPercentage);
                          
                          return (
                            <tr key={student.id} style={{ borderBottom: '1px solid #ddd' }}>
                              <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{index + 1}</td>
                              <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                                <div style={{ fontWeight: 'bold' }}>{student.first_name} {student.last_name}</div>
                                <div style={{ fontSize: '9px', color: '#666' }}>{student.student_id}</div>
                              </td>
                              <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>{student.roll_no || 'N/A'}</td>
                              {subjects.map(subject => {
                                const grade = getStudentGrade(student.id, subject.id);
                                return (
                                  <td key={subject.id} style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center' }}>
                                    {grade || '-'}
                                  </td>
                                );
                              })}
                              <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{studentTotal}</td>
                              <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{studentPercentage}%</td>
                              <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{studentDivision}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer */}
              <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                  <div>
                    <p style={{ margin: '5px 0' }}>Generated on: {new Date().toLocaleDateString()}</p>
                    <p style={{ margin: '5px 0' }}>Class Teacher: {user?.user_metadata?.first_name ? `${user?.user_metadata?.first_name} ${user?.user_metadata?.last_name}` : user?.email}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '5px 0' }}>Himalayan Children's Academy</p>
                    <p style={{ margin: '5px 0' }}>Official Result Sheet</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

