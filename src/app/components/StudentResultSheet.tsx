import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface StudentResultSheetProps {
  student: any;
  subjects: any[];
  grades: any[];
  teachers: any[];
  classInfo: any;
  term?: string;
  onClose?: () => void;
}

const StudentResultSheet: React.FC<StudentResultSheetProps> = ({ student, subjects, grades, teachers, classInfo, term, onClose }) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  const getStudentGrade = (studentId: string, subjectId: string) => {
    const grade = grades.find(g => g.student_id === studentId && g.subject_id === subjectId && (!term || g.term === term));
    return grade ? grade.marks : null;
  };

  const getStudentRemark = (studentId: string, subjectId: string) => {
    const grade = grades.find(g => g.student_id === studentId && g.subject_id === subjectId && (!term || g.term === term));
    return grade ? grade.remark : null;
  };

  const getTeacherName = (subjectId: string) => {
    const grade = grades.find(g => g.student_id === student.id && g.subject_id === subjectId && (!term || g.term === term));
    if (!grade) return "-";
    const teacher = teachers.find(t => t.id === grade.teacher_id);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "-";
  };

  const calculateStudentTotalAndGrade = () => {
    const marks = subjects.map(subject => {
      const grade = getStudentGrade(student.id, subject.id);
      return grade ? parseInt(grade, 10) : 0;
    });
    const total = marks.reduce((sum, mark) => sum + (isNaN(mark) ? 0 : mark), 0);
    const maxMarks = subjects.length * 100; // Assuming 100 per subject
    const percentage = maxMarks > 0 ? (total / maxMarks) * 100 : 0;
    let grade = "Failed";
    if (percentage >= 80) grade = "Distinction";
    else if (percentage >= 60) grade = "First Division";
    else if (percentage >= 50) grade = "Third Division";
    return { total, grade, percentage: percentage.toFixed(1), maxMarks };
  };

  const handlePrint = () => {
    if (!sheetRef.current) return;
    const printContents = sheetRef.current.innerHTML;
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

  const handleDownloadPDF = async () => {
    if (!sheetRef.current) return;
    const element = sheetRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`student_result_${student.student_id}${term ? `_${term}` : ''}.pdf`);
  };

  const studentResult = calculateStudentTotalAndGrade();

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Print</button>
        <button onClick={handleDownloadPDF} className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700">Download PDF</button>
        {onClose && (
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Close</button>
        )}
      </div>
      <div ref={sheetRef} className="bg-white p-6 rounded-xl shadow max-w-lg mx-auto border border-slate-200">
        <h2 className="text-xl font-bold text-center mb-4">Student Result Sheet</h2>
        <div className="mb-2">
          <span className="font-semibold">Name:</span> {student.first_name} {student.last_name}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Student ID:</span> {student.student_id}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Roll No:</span> {student.roll_no}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Class:</span> {classInfo ? `${classInfo.name}${classInfo.section ? ` - ${classInfo.section}` : ''}` : '-'}
        </div>
        {term && (
          <div className="mb-2">
            <span className="font-semibold">Term:</span> {term.charAt(0).toUpperCase() + term.slice(1)}
          </div>
        )}
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr>
              <th className="border px-3 py-2 text-left">Subject</th>
              <th className="border px-3 py-2 text-left">Marks</th>
              <th className="border px-3 py-2 text-left">Teacher</th>
              <th className="border px-3 py-2 text-left">Remark</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(subject => {
              const grade = grades.find(g => g.student_id === student.id && g.subject_id === subject.id && (!term || g.term === term));
              const teacher = grade && teachers.find(t => t.id === grade.teacher_id);
              return (
                <tr key={subject.id}>
                  <td className="border px-3 py-2">{subject.name}</td>
                  <td className="border px-3 py-2">{grade ? grade.marks : '-'}</td>
                  <td className="border px-3 py-2">{teacher ? `${teacher.first_name} ${teacher.last_name}` : '-'}</td>
                  <td className="border px-3 py-2">
                    {grade && grade.remark
                      ? grade.remark.includes(' | ')
                        ? grade.remark.split(' | ').map((r: string, i: number) => (
                            <span key={i} className="block">{r}</span>
                          ))
                        : grade.remark
                      : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-4">
          <span className="font-semibold">Total:</span> {studentResult.total}<br />
          <span className="font-semibold">Percentage:</span> {studentResult.percentage}%<br />
          <span className="font-semibold">Division:</span> {studentResult.grade}
        </div>
      </div>
    </div>
  );
};

export default StudentResultSheet; 