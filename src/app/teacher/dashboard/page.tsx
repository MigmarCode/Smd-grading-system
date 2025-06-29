"use client";
import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [grades, setGrades] = useState<{ [studentId: string]: { [subjectId: string]: string } }>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentGrades, setStudentGrades] = useState<{ [key: string]: string }>({});
  const [studentPracticalGrades, setStudentPracticalGrades] = useState<{ [key: string]: string }>({});
  const [selectedTerm, setSelectedTerm] = useState("first");
  const [studentAttendance, setStudentAttendance] = useState("");
  const [showClassResultSheet, setShowClassResultSheet] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const studentRefs = useRef<{ [studentId: string]: HTMLDivElement | null }>({});
  const modalResultRef = useRef<HTMLDivElement>(null);
  const classResultRef = useRef<HTMLDivElement>(null);

  // Fetch classes from API on mount
  useEffect(() => {
    fetch("/api/classes").then(res => res.json()).then(setClasses);
  }, []);

  // Fetch students when class is selected
  useEffect(() => {
    if (selectedClass) {
      setLoading(true);
      // Fetch students for the selected class
      fetch(`/api/students?class_id=${selectedClass}`)
        .then(res => res.json())
        .then(data => {
          setStudents(data);
          setLoading(false);
        });
      
      // Fetch subjects assigned to this class
      fetch(`/api/class-subjects?class_id=${selectedClass}`)
        .then(res => res.json())
        .then(data => {
          console.log('Raw subjects from API:', data);
          const sortedSubjects = sortSubjectsByOrder(data);
          console.log('After sorting:', sortedSubjects);
          setSubjects(sortedSubjects);
          // Initialize grades state for this class
          const initialGrades: { [studentId: string]: { [subjectId: string]: string } } = {};
          students.forEach((student: any) => {
            initialGrades[student.student_id] = {};
            sortedSubjects.forEach((subject: any) => {
              initialGrades[student.student_id][subject.id] = "";
            });
          });
          setGrades(initialGrades);
        });
    } else {
      setStudents([]);
      setSubjects([]);
      setGrades({});
    }
  }, [selectedClass]);

  // Handle grade input change
  const handleGradeChange = (studentId: string, subjectId: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: value
      }
    }));
  };

  // Calculate total and grade for a student
  const calculateStudentTotalAndGrade = (studentId: string) => {
    const marks = subjects.map(subject => parseInt(grades[studentId]?.[subject.id] || "0", 10));
    const total = marks.reduce((sum, mark) => sum + (isNaN(mark) ? 0 : mark), 0);
    const percentage = subjects.length > 0 ? total / subjects.length : 0;
    let grade = "Failed";
    if (percentage >= 80) grade = "Distinction";
    else if (percentage >= 60) grade = "First Division";
    else if (percentage >= 50) grade = "Third Division";
    return { total, grade, percentage: percentage.toFixed(1) };
  };

  // Calculate subject totals (optional, can be left blank)
  const calculateSubjectTotals = (subjectId: string) => {
    let total = 0;
    let count = 0;
    students.forEach(student => {
      const mark = parseInt(grades[student.student_id]?.[subjectId] || "0", 10);
      if (!isNaN(mark)) {
        total += mark;
        count++;
      }
    });
    return { total, average: count > 0 ? (total / count).toFixed(1) : "-" };
  };

  const handleSubmit = async () => {
    // Prepare data for API
    const gradeEntries = [];
    for (const studentId in grades) {
      for (const subjectId in grades[studentId]) {
        const mark = grades[studentId][subjectId];
        if (mark !== "") {
          gradeEntries.push({
            student_id: studentId,
            class_id: selectedClass,
            subject_id: subjectId,
            mark: parseInt(mark, 10)
          });
        }
      }
    }
    if (gradeEntries.length === 0) {
      alert("Please enter at least one grade before submitting.");
      return;
    }
    
    setSubmitting(true);
    try {
      // Send to API (implement API to handle bulk grade submission)
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grades: gradeEntries })
      });
      if (res.ok) {
        alert("Grades submitted successfully!");
        setGrades({});
      } else {
        alert("Failed to submit grades.");
      }
    } catch (error) {
      alert("An error occurred while submitting grades.");
    } finally {
      setSubmitting(false);
    }
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
    pdf.save(`grades_${selectedClass}.pdf`);
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
    pdf.save(`result_${studentId}.pdf`);
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

  // Open grade modal for a student
  const openGradeModal = (student: any) => {
    setSelectedStudent(student);
    setStudentGrades({});
    setStudentPracticalGrades({});
    setStudentAttendance("");
    setShowGradeModal(true);
  };

  // Handle grade input change in modal
  const handleStudentGradeChange = (subjectId: string, value: string) => {
    setStudentGrades(prev => ({
      ...prev,
      [subjectId]: value
    }));
  };

  // Calculate total and grade for modal (including practical grades)
  const calculateModalTotalAndGrade = () => {
    let totalTheory = 0;
    let totalPractical = 0;
    let totalSum = 0;
    let subjectCount = 0;
    
    subjects.forEach(subject => {
      const theoryGrade = parseInt(studentGrades[subject.id] || "0", 10);
      const practicalGrade = parseInt(studentPracticalGrades[subject.id] || "0", 10);
      
      if (!isNaN(theoryGrade) && !isNaN(practicalGrade)) {
        // Simple sum: theory + practical
        const subjectTotal = theoryGrade + practicalGrade;
        totalTheory += theoryGrade;
        totalPractical += practicalGrade;
        totalSum += subjectTotal;
        subjectCount++;
      }
    });
    
    const averageTheory = subjectCount > 0 ? totalTheory / subjectCount : 0;
    const averagePractical = subjectCount > 0 ? totalPractical / subjectCount : 0;
    const totalAverage = averageTheory + averagePractical;
    
    let grade = "Failed";
    if (totalAverage >= 80) grade = "Distinction";
    else if (totalAverage >= 60) grade = "First Division";
    else if (totalAverage >= 50) grade = "Third Division";
    
    return { 
      totalTheory: Math.round(totalTheory), 
      totalPractical: Math.round(totalPractical),
      totalSum: Math.round(totalSum),
      averageTheory: averageTheory.toFixed(1),
      averagePractical: averagePractical.toFixed(1),
      totalAverage: totalAverage.toFixed(1),
      grade 
    };
  };

  // Submit grades for selected student
  const handleSubmitStudentGrades = async () => {
    if (!selectedStudent) return;
    
    const gradeEntries = [];
    for (const subjectId in studentGrades) {
      const theoryMark = studentGrades[subjectId];
      const practicalMark = studentPracticalGrades[subjectId];
      
      if (theoryMark !== "" && practicalMark !== "") {
        // Simple sum: theory + practical
        const theoryGrade = parseInt(theoryMark, 10);
        const practicalGrade = parseInt(practicalMark, 10);
        const totalGrade = theoryGrade + practicalGrade;
        
        gradeEntries.push({
          student_id: selectedStudent.student_id,
          class_id: selectedClass,
          subject_id: subjectId,
          term: selectedTerm,
          theory_mark: theoryGrade,
          practical_mark: practicalGrade,
          total_mark: totalGrade
        });
      }
    }
    
    if (gradeEntries.length === 0) {
      alert("Please enter both theory and practical grades for at least one subject before submitting.");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grades: gradeEntries })
      });
      if (res.ok) {
        alert("Grades submitted successfully!");
        // Update the main grades state
        setGrades(prev => ({
          ...prev,
          [selectedStudent.student_id]: studentGrades
        }));
        // Also update practical grades in global state
        setStudentPracticalGrades(prev => ({
          ...prev,
          [selectedStudent.student_id]: studentPracticalGrades
        }));
        setShowGradeModal(false);
        setSelectedStudent(null);
        setStudentGrades({});
        setStudentPracticalGrades({});
        setSelectedTerm("first");
      } else {
        alert("Failed to submit grades.");
      }
    } catch (error) {
      alert("An error occurred while submitting grades.");
    } finally {
      setSubmitting(false);
    }
  };

  // Print modal result sheet
  const handlePrintModalResult = () => {
    const printContents = modalResultRef.current?.innerHTML;
    if (!printContents) return;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Student Result Sheet</title>');
    printWindow.document.write('<style>body { font-family: Arial, sans-serif; margin: 20px; }</style>');
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

  // Download modal result sheet as PDF
  const handleDownloadModalPDF = async () => {
    const element = modalResultRef.current;
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`result_${selectedStudent?.first_name}_${selectedStudent?.last_name}_${selectedTerm}.pdf`);
  };

  // Preview modal result sheet
  const handlePreviewModalResult = () => {
    const printContents = modalResultRef.current?.innerHTML;
    if (!printContents) return;
    const previewWindow = window.open('', '_blank', 'height=800,width=600,scrollbars=yes,resizable=yes');
    if (!previewWindow) return;
    previewWindow.document.write('<html><head><title>Result Sheet Preview</title>');
    previewWindow.document.write('<style>body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; } .result-sheet { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }</style>');
    previewWindow.document.write('</head><body>');
    previewWindow.document.write('<div class="result-sheet">');
    previewWindow.document.write(printContents);
    previewWindow.document.write('</div>');
    previewWindow.document.write('</body></html>');
    previewWindow.document.close();
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

  // Download class result sheet as PDF
  const handleDownloadClassPDF = async () => {
    const element = classResultRef.current;
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape" });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`class_result_${classes.find(cls => cls.id === selectedClass)?.name}_${selectedTerm}.pdf`);
  };

  // Sort subjects in the order required for school result sheet
  const sortSubjectsByOrder = (subjects: any[]) => {
    console.log('=== SIMPLE SUBJECT SORTING ===');
    console.log('Original subjects:', subjects.map(s => s.name));
    
    // Simple mapping approach
    const getPriority = (subjectName: string) => {
      const name = subjectName.toLowerCase().trim();
      
      if (name.includes('tibetan') && name.includes('1')) return 0;
      if (name.includes('tibetan') && name.includes('2')) return 1;
      if (name.includes('english') || name.includes('englsih')) return 2; // Handle typo
      if (name.includes('nepali')) return 3;
      if (name.includes('science')) return 4;
      if (name.includes('samajik')) return 5;
      if (name.includes('mathematics') || name.includes('math')) return 6;
      if (name.includes('computer')) return 7;
      if (name.includes('health')) return 8;
      if (name.includes('optional')) return 9;
      if (name.includes('sero') && name.includes('fero')) return 10;
      if (name.includes('social')) return 11;
      
      return 999; // Put unknown subjects at the end
    };
    
    const sorted = subjects.sort((a, b) => {
      const aPriority = getPriority(a.name);
      const bPriority = getPriority(b.name);
      
      console.log(`"${a.name}" (priority: ${aPriority}) vs "${b.name}" (priority: ${bPriority})`);
      
      return aPriority - bPriority;
    });
    
    console.log('Final order:', sorted.map(s => s.name));
    return sorted;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffef2' }}>
      {/* Topbar */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Teacher Dashboard</h1>
                <p className="text-xs lg:text-sm text-slate-600 font-medium hidden sm:block">Manage grades and student progress</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">Teacher User</p>
                <p className="text-xs text-slate-600">Logged in</p>
              </div>
              <button
                onClick={() => window.location.href = '/'}
                className="px-3 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-1 lg:space-x-2 text-sm lg:text-base"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Class Selection */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 lg:p-8 mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Select Class</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-base lg:text-lg font-medium"
              >
                <option value="">Choose a class to manage grades...</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}{cls.section ? ` - ${cls.section}` : ""}
                  </option>
                ))}
              </select>
            </div>
            {selectedClass && (
              <div className="flex space-x-2 lg:space-x-4">
                <button
                  onClick={() => setShowClassResultSheet(true)}
                  className="px-4 lg:px-6 py-3 lg:py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 text-sm lg:text-base"
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Class Result Sheet</span>
                  <span className="sm:hidden">Result Sheet</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-slate-700 font-semibold text-lg">Loading students...</span>
            </div>
          </div>
        )}

        {/* Students List */}
        {selectedClass && !loading && students.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 lg:p-8">
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-4 lg:mb-6">Students in Class</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {[...students]
                .sort((a, b) => {
                  const aRoll = a.roll_no || a.roll_number || a.student_id;
                  const bRoll = b.roll_no || b.roll_number || b.student_id;
                  const aNum = parseInt(aRoll.replace(/\D/g, ""), 10);
                  const bNum = parseInt(bRoll.replace(/\D/g, ""), 10);
                  if (!isNaN(aNum) && !isNaN(bNum)) {
                    return aNum - bNum;
                  }
                  return aRoll.localeCompare(bRoll);
                })
                .map(student => {
                  const rollNumber = student.roll_no || student.roll_number || student.student_id;
                  const hasGrades = grades[student.student_id] && Object.values(grades[student.student_id]).some(grade => grade !== "");
                  return (
                    <div 
                      key={student.student_id} 
                      onClick={() => openGradeModal(student)}
                      className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-4 lg:p-6 cursor-pointer border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 lg:hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="relative z-10">
                        {/* Roll Number Badge */}
                        <div className="flex items-center justify-between mb-3 lg:mb-4">
                          <div className={`w-10 h-10 lg:w-12 lg:h-12 ${getBadgeColor(student.student_id)} rounded-xl flex items-center justify-center text-base lg:text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            {rollNumber}
                          </div>
                          {hasGrades && (
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        
                        {/* Student Info */}
                        <div className="mb-3 lg:mb-4">
                          <h4 className="text-base lg:text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                            {student.first_name} {student.last_name}
                          </h4>
                          <p className="text-xs lg:text-sm text-slate-600">Roll #{rollNumber}</p>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${hasGrades ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                            <span className="text-xs text-slate-600">
                              {hasGrades ? 'Grades Entered' : 'No Grades'}
                            </span>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedClass && !loading && students.length === 0 && (
          <div className="text-center py-12 lg:py-16">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg">
              <svg className="w-8 h-8 lg:w-10 lg:h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 lg:mb-3">No students found</h3>
            <p className="text-slate-600 text-base lg:text-lg">There are no students assigned to this class.</p>
          </div>
        )}

        {/* No Class Selected */}
        {!selectedClass && (
          <div className="text-center py-12 lg:py-16">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg">
              <svg className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 lg:mb-3">Select a class to get started</h3>
            <p className="text-slate-600 text-base lg:text-lg">Choose a class from the dropdown above to manage student grades.</p>
          </div>
        )}
      </div>

      {/* Grade Modal */}
      {showGradeModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl p-4 lg:p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold">Grade Entry</h2>
                  <p className="text-blue-100 text-sm lg:text-base">Enter grades for {selectedStudent.first_name} {selectedStudent.last_name} - {selectedTerm.charAt(0).toUpperCase() + selectedTerm.slice(1)} Term</p>
                </div>
                <button
                  onClick={() => {
                    setShowGradeModal(false);
                    setSelectedStudent(null);
                    setStudentGrades({});
                  }}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 lg:p-6">
              {/* Student Info */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 mb-4 lg:mb-6">
                <div className="flex items-center space-x-3 lg:space-x-4">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg lg:text-xl font-bold">
                    {selectedStudent.roll_no || selectedStudent.roll_number || selectedStudent.student_id}
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-slate-900">{selectedStudent.first_name} {selectedStudent.last_name}</h3>
                    <p className="text-slate-600 text-sm lg:text-base">Roll #{selectedStudent.roll_no || selectedStudent.roll_number || selectedStudent.student_id}</p>
                    <p className="text-xs lg:text-sm text-slate-500">Class: {classes.find(cls => cls.id === selectedClass)?.name || ''}</p>
                  </div>
                </div>
              </div>

              {/* Term Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-900 mb-3">Select Term</label>
                <select
                  value={selectedTerm}
                  onChange={e => setSelectedTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white font-medium"
                >
                  <option value="first">First Term</option>
                  <option value="second">Second Term</option>
                  <option value="third">Third Term</option>
                </select>
              </div>

              {/* Grade Inputs */}
              <div className="space-y-4 mb-4 lg:mb-6">
                <h4 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 lg:mb-4">Subject Grades</h4>
                {subjects.map(subject => {
                  const theoryGrade = parseInt(studentGrades[subject.id] || "0", 10);
                  const practicalGrade = parseInt(studentPracticalGrades[subject.id] || "0", 10);
                  const totalGrade = !isNaN(theoryGrade) && !isNaN(practicalGrade) 
                    ? theoryGrade + practicalGrade
                    : 0;
                  
                  return (
                    <div key={subject.id} className="space-y-3 p-3 lg:p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200">
                      {/* Theory Grade */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-slate-700">{subject.name} (Theory)</label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={studentGrades[subject.id] || ""}
                            onChange={e => handleStudentGradeChange(subject.id, e.target.value)}
                            className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-semibold text-sm"
                            placeholder="0-100"
                          />
                        </div>
                      </div>
                      
                      {/* Practical Grade */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-slate-700">{subject.name} (Practical)</label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={studentPracticalGrades[subject.id] || ""}
                            onChange={e => setStudentPracticalGrades(prev => ({
                              ...prev,
                              [subject.id]: e.target.value
                            }))}
                            className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-semibold text-sm"
                            placeholder="0-100"
                          />
                        </div>
                      </div>
                      
                      {/* Total Grade (Read-only) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50 rounded-lg p-3 border border-blue-200 space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <label className="text-sm font-semibold text-blue-700">Total</label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={totalGrade.toFixed(2)}
                            readOnly
                            className="w-20 px-3 py-2 border border-blue-300 rounded-lg bg-blue-100 text-center font-bold text-blue-800"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Results Summary */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 lg:p-6 border border-emerald-200 mb-4 lg:mb-6">
                <h4 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 lg:mb-4">Results Summary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                  {/* Row 1 */}
                  <div className="text-center p-3 lg:p-4 bg-white/50 rounded-lg border border-emerald-100">
                    <div className="text-base lg:text-lg font-bold text-slate-900">Total Sum</div>
                    <div className="text-xs lg:text-sm text-slate-600 mt-1">{calculateModalTotalAndGrade().totalSum}</div>
                  </div>
                  <div className="text-center p-3 lg:p-4 bg-white/50 rounded-lg border border-emerald-100">
                    <div className="text-base lg:text-lg font-bold text-slate-900">Percentage</div>
                    <div className="text-xs lg:text-sm text-slate-600 mt-1">{calculateModalTotalAndGrade().totalAverage}%</div>
                  </div>
                  <div className="text-center p-3 lg:p-4 bg-white/50 rounded-lg border border-emerald-100">
                    <div className="text-base lg:text-lg font-bold text-blue-600">Division</div>
                    <div className="text-xs lg:text-sm text-slate-600 mt-1">{calculateModalTotalAndGrade().grade}</div>
                  </div>
                  
                  {/* Row 2 - Placeholder for 3 more items */}
                  <div className="text-center p-3 lg:p-4 bg-white/50 rounded-lg border border-emerald-100">
                    <div className="text-base lg:text-lg font-bold text-slate-900">Result</div>
                    <div className="text-xs lg:text-sm text-slate-600 mt-1">Passed</div>
                  </div>
                  <div className="text-center p-3 lg:p-4 bg-white/50 rounded-lg border border-emerald-100">
                    <div className="text-base lg:text-lg font-bold text-slate-900">Position</div>
                    <div className="text-xs lg:text-sm text-slate-600 mt-1">Grade</div>
                  </div>
                  <div className="text-center p-3 lg:p-4 bg-white/50 rounded-lg border border-emerald-100">
                    <div className="text-base lg:text-lg font-bold text-slate-900">Attendance</div>
                    <div className="flex flex-col items-center space-y-2 mt-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={studentAttendance}
                        onChange={e => setStudentAttendance(e.target.value)}
                        className="w-16 px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-semibold text-xs"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hidden result sheet for printing/downloading */}
              <div
                ref={modalResultRef}
                style={{ position: "absolute", left: "-9999px", top: 0 }}
                aria-hidden="true"
              >
                <div style={{ 
                  width: '210mm', 
                  height: '297mm', 
                  padding: '20mm', 
                  fontFamily: 'Arial, sans-serif', 
                  background: '#fff', 
                  border: '1px solid #eee',
                  margin: '0 auto',
                  boxSizing: 'border-box',
                  fontSize: '12pt',
                  lineHeight: '1.4'
                }}>
                  <h2 style={{ fontWeight: 'bold', fontSize: '18pt', marginBottom: '15pt', textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10pt' }}>Student Result Sheet</h2>
                  <div style={{ marginBottom: '8pt' }}><strong>Name:</strong> {selectedStudent?.first_name} {selectedStudent?.last_name}</div>
                  <div style={{ marginBottom: '8pt' }}><strong>Roll Number:</strong> {selectedStudent?.roll_no || selectedStudent?.roll_number || selectedStudent?.student_id}</div>
                  <div style={{ marginBottom: '8pt' }}><strong>Admission Number:</strong> {selectedStudent?.student_id}</div>
                  <div style={{ marginBottom: '8pt' }}><strong>Class:</strong> {classes.find(cls => cls.id === selectedClass)?.name || ''}</div>
                  <div style={{ marginBottom: '15pt' }}><strong>Term:</strong> {selectedTerm.charAt(0).toUpperCase() + selectedTerm.slice(1)} Term</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15pt', fontSize: '10pt' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #000', padding: '8pt', textAlign: 'left', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Subject</th>
                        <th style={{ border: '1px solid #000', padding: '8pt', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Theory</th>
                        <th style={{ border: '1px solid #000', padding: '8pt', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Practical</th>
                        <th style={{ border: '1px solid #000', padding: '8pt', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map(subject => {
                        const theoryGrade = parseInt(studentGrades[subject.id] || "0", 10);
                        const practicalGrade = parseInt(studentPracticalGrades[subject.id] || "0", 10);
                        const totalGrade = !isNaN(theoryGrade) && !isNaN(practicalGrade) 
                          ? theoryGrade + practicalGrade
                          : 0;
                        return (
                          <tr key={subject.id}>
                            <td style={{ border: '1px solid #000', padding: '8pt' }}>{subject.name}</td>
                            <td style={{ border: '1px solid #000', padding: '8pt', textAlign: 'center' }}>{theoryGrade}</td>
                            <td style={{ border: '1px solid #000', padding: '8pt', textAlign: 'center' }}>{practicalGrade}</td>
                            <td style={{ border: '1px solid #000', padding: '8pt', textAlign: 'center', fontWeight: 'bold' }}>{totalGrade || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20pt', borderTop: '1px solid #333', paddingTop: '15pt' }}>
                    <div><strong>Overall Average:</strong> {calculateModalTotalAndGrade().totalAverage}%</div>
                    <div><strong>Division:</strong> {calculateModalTotalAndGrade().grade}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                <button
                  onClick={handlePreviewModalResult}
                  className="px-3 lg:px-4 py-2 lg:py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 text-sm lg:text-base"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Preview</span>
                </button>
                <button
                  onClick={handlePrintModalResult}
                  className="px-3 lg:px-4 py-2 lg:py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 text-sm lg:text-base"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print</span>
                </button>
                <button
                  onClick={handleDownloadModalPDF}
                  className="px-3 lg:px-4 py-2 lg:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 text-sm lg:text-base"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button
                  onClick={() => {
                    setShowGradeModal(false);
                    setSelectedStudent(null);
                    setStudentGrades({});
                    setStudentPracticalGrades({});
                  }}
                  className="px-4 lg:px-6 py-2 lg:py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200 font-medium text-sm lg:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitStudentGrades}
                  disabled={submitting}
                  className="px-6 lg:px-8 py-2 lg:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-sm lg:text-base"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Submit Grades</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden class result sheet for printing/downloading */}
      <div
        ref={classResultRef}
        style={{ position: "absolute", left: "-9999px", top: 0 }}
        aria-hidden="true"
      >
        <div style={{ 
          width: '297mm', 
          padding: '10mm', 
          fontFamily: 'Arial, sans-serif', 
          background: '#fff', 
          border: '1px solid #eee',
          margin: '0 auto',
          boxSizing: 'border-box',
          fontSize: '10pt',
          lineHeight: '1.3',
          pageBreakAfter: 'always',
          pageBreakInside: 'auto',
          overflow: 'visible'
        }}>
          {/* Header with Logo */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12pt', pageBreakAfter: 'avoid' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginRight: '15pt' }}>
              <img 
                src="/SMD_Logo.png" 
                alt="SMD Logo" 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  marginBottom: '8pt'
                }} 
              />
              <div style={{ fontSize: '10pt', fontWeight: 'bold', marginTop: '8pt' }}>
                <span>Class: {classes.find(cls => cls.id === selectedClass)?.name}</span>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '16pt', margin: '0', paddingBottom: '8pt' }}>
                Shree Mangal Deep Boarding School<br />
                <span style={{ fontSize: '12pt' }}>Ramhitti, Boudha, Kathmandu<br />
                Tel: 01-4915407</span>
              </h2>
              <div style={{ fontSize: '10pt', fontWeight: 'bold', marginTop: '8pt' }}>
                <span>Class Result Sheet - {selectedTerm.charAt(0).toUpperCase() + selectedTerm.slice(1)} Term</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '15pt' }}>
              <div style={{ width: '60px', height: '60px', marginBottom: '8pt' }}></div>
              <div style={{ fontSize: '10pt', fontWeight: 'bold', marginTop: '8pt' }}>
                <span>Section: {classes.find(cls => cls.id === selectedClass)?.section}</span>
              </div>
            </div>
          </div>
          
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            marginBottom: '10pt', 
            fontSize: '8pt', 
            tableLayout: 'fixed',
            pageBreakInside: 'auto',
            pageBreakAfter: 'auto',
            pageBreakBefore: 'auto'
          }}>
            <thead>
              <tr style={{ pageBreakAfter: 'avoid', pageBreakInside: 'avoid' }}>
                <th style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '8pt', width: '5%', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>Roll No</th>
                <th style={{ border: '1px solid #000', padding: '3pt', textAlign: 'left', backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '8pt', width: '12%', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>Student Name</th>
                <th style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '8pt', width: '10%', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>Admission Number</th>
                {subjects.map(subject => (
                  <th key={subject.id} style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '7pt', width: '6%', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>{subject.name}</th>
                ))}
                <th style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '8pt', width: '6%', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>Total</th>
                <th style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '8pt', width: '6%', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>Per-centage</th>
                <th style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '8pt', width: '8%', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>Division</th>
                <th style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '8pt', width: '6%', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>Result</th>
                <th style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '8pt', width: '6%', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>Position</th>
                <th style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', backgroundColor: '#f0f0f0', fontWeight: 'bold', fontSize: '8pt', width: '6%', wordWrap: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>Atten-dance</th>
              </tr>
            </thead>
            <tbody>
              {students
                .sort((a, b) => {
                  const aRoll = a.roll_no || a.roll_number || a.student_id;
                  const bRoll = b.roll_no || b.roll_number || b.student_id;
                  const aNum = parseInt(aRoll.replace(/\D/g, ""), 10);
                  const bNum = parseInt(bRoll.replace(/\D/g, ""), 10);
                  if (!isNaN(aNum) && !isNaN(bNum)) {
                    return aNum - bNum;
                  }
                  return aRoll.localeCompare(bRoll);
                })
                .map((student, index) => {
                // Calculate totals for each subject
                const subjectTotals = subjects.map(subject => {
                  const theoryGrade = parseInt(grades[student.student_id]?.[subject.id] || "0", 10);
                  const practicalGrade = parseInt(studentPracticalGrades?.[student.student_id]?.[subject.id] || "0", 10);
                  
                  return {
                    theory: theoryGrade,
                    practical: practicalGrade,
                    total: theoryGrade + practicalGrade
                  };
                });
                
                // Calculate student total (sum of all subject totals)
                const studentTotal = subjectTotals.reduce((total, subject) => total + subject.total, 0);
                
                // Calculate percentage based on total possible marks (assuming 100 per subject)
                const totalPossibleMarks = subjects.length * 100;
                const percentage = totalPossibleMarks > 0 ? ((studentTotal / totalPossibleMarks) * 100).toFixed(1) : "0";
                
                // Fix division logic
                let division = "Failed";
                if (parseFloat(percentage) >= 80) division = "Distinction";
                else if (parseFloat(percentage) >= 60) division = "First Division";
                else if (parseFloat(percentage) >= 50) division = "Second Division";
                else if (parseFloat(percentage) >= 40) division = "Third Division";
                
                return (
                  <React.Fragment key={student.student_id}>
                    {/* Student row */}
                    <tr style={{ pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.roll_no || student.roll_number || student.student_id}</td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'left', fontSize: '7pt' }}>{student.first_name} {student.last_name}</td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt' }}>{student.student_id}</td>
                      {subjects.map(subject => {
                        const theoryGrade = parseInt(grades[student.student_id]?.[subject.id] || "0", 10);
                        const practicalGrade = parseInt(studentPracticalGrades?.[student.student_id]?.[subject.id] || "0", 10);
                        const totalGrade = theoryGrade + practicalGrade;
                        
                        return (
                          <td key={subject.id} style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt' }}>
                            {totalGrade > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontWeight: 'bold' }}>{theoryGrade}</div>
                                <div>{practicalGrade}</div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontWeight: 'bold' }}>-</div>
                                <div>-</div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}>{studentTotal}</td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}>{percentage}%</td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}>{division}</td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}>{parseFloat(percentage) >= 40 ? 'Passed' : 'Failed'}</td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}>{index + 1}</td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}>-</td>
                    </tr>
                    
                    {/* Summary row for totals */}
                    <tr style={{ pageBreakInside: 'avoid', pageBreakAfter: 'avoid', backgroundColor: '#f8f8f8' }}>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}></td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'left', fontSize: '7pt', fontWeight: 'bold' }}></td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}></td>
                      {subjectTotals.map((total, subjectIndex) => (
                        <td key={subjectIndex} style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}>
                          {total.total}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontWeight: 'bold', fontSize: '7pt' }}>{studentTotal}</td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}>{percentage}%</td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}>{division}</td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}>{parseFloat(percentage) >= 40 ? 'Passed' : 'Failed'}</td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}>{index + 1}</td>
                      <td style={{ border: '1px solid #000', padding: '3pt', textAlign: 'center', fontSize: '7pt', fontWeight: 'bold' }}>-</td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          
          <div style={{ marginTop: '15pt', fontSize: '9pt', pageBreakBefore: 'avoid' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8pt' }}>
              <div><strong>Total Students:</strong> {students.length}</div>
              <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20pt' }}>
              <div><strong>Class Teacher:</strong> _________________</div>
              <div><strong>Principal:</strong> _________________</div>
            </div>
          </div>
        </div>
      </div>

      {/* Class Result Sheet Modal */}
      {showClassResultSheet && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 lg:p-8">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-slate-900">Class Result Sheet</h3>
                  <p className="text-xs lg:text-sm text-slate-500 mt-1">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={() => setShowClassResultSheet(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4 lg:p-6 mb-4 lg:mb-6">
                <h4 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 lg:mb-4">Class: {classes.find(cls => cls.id === selectedClass)?.name} - {selectedTerm.charAt(0).toUpperCase() + selectedTerm.slice(1)} Term</h4>
                <p className="text-slate-600 mb-3 lg:mb-4 text-sm lg:text-base">Generate a comprehensive result sheet for all students in this class.</p>
                
                {/* Term Selection */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <label className="text-sm font-medium text-slate-700">Select Term:</label>
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="first">First Term</option>
                    <option value="second">Second Term</option>
                    <option value="third">Third Term</option>
                    <option value="final">Final Term</option>
                  </select>
                </div>
              </div>

              {/* Class Statistics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
                <div className="bg-blue-50 rounded-xl p-3 lg:p-4 border border-blue-200">
                  <div className="text-xl lg:text-2xl font-bold text-blue-600">{students.length}</div>
                  <div className="text-xs lg:text-sm text-blue-700">Total Students</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 lg:p-4 border border-emerald-200">
                  <div className="text-xl lg:text-2xl font-bold text-emerald-600">
                    {students.length > 0 ? 
                      ((students.reduce((total, student) => {
                        return total + subjects.reduce((subjectTotal, subject) => {
                          const theoryGrade = parseInt(grades[student.student_id]?.[subject.id] || "0", 10);
                          const practicalGrade = parseInt(studentPracticalGrades?.[student.student_id]?.[subject.id] || "0", 10);
                          return subjectTotal + theoryGrade + practicalGrade;
                        }, 0);
                      }, 0) / (students.length * subjects.length * 100) * 100).toFixed(1)) : "0"}%
                  </div>
                  <div className="text-xs lg:text-sm text-emerald-700">Class Average</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 lg:p-4 border border-purple-200">
                  <div className="text-xl lg:text-2xl font-bold text-purple-600">
                    {students.length > 0 ? 
                      ((students.filter(student => {
                        const studentTotal = subjects.reduce((total, subject) => {
                          const theoryGrade = parseInt(grades[student.student_id]?.[subject.id] || "0", 10);
                          const practicalGrade = parseInt(studentPracticalGrades?.[student.student_id]?.[subject.id] || "0", 10);
                          return total + theoryGrade + practicalGrade;
                        }, 0);
                        const percentage = subjects.length * 100 > 0 ? ((studentTotal / (subjects.length * 100)) * 100) : 0;
                        return percentage >= 40;
                      }).length / students.length * 100).toFixed(1)) : "0"}%
                  </div>
                  <div className="text-xs lg:text-sm text-purple-700">Pass Rate</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 lg:p-4 border border-orange-200">
                  <div className="text-xl lg:text-2xl font-bold text-orange-600">{subjects.length}</div>
                  <div className="text-xs lg:text-sm text-orange-700">Total Subjects</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4">
                <button
                  onClick={handlePreviewClassResult}
                  className="px-3 lg:px-4 py-2 lg:py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 text-sm lg:text-base"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Preview</span>
                </button>
                <button
                  onClick={handlePrintClassResult}
                  className="px-3 lg:px-4 py-2 lg:py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 text-sm lg:text-base"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print</span>
                </button>
                <button
                  onClick={handleDownloadClassPDF}
                  className="px-3 lg:px-4 py-2 lg:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 text-sm lg:text-base"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button
                  onClick={() => setShowClassResultSheet(false)}
                  className="px-4 lg:px-6 py-2 lg:py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200 font-medium text-sm lg:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

