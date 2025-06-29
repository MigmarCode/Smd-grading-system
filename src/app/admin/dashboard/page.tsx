"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

// SVG icons as functional components
function TeacherIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}
function StudentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m0 0H6m6 0h6" />
    </svg>
  );
}
function ClassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M3 20h18" />
    </svg>
  );
}
function SubjectIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z" />
    </svg>
  );
}
function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
    </svg>
  );
}
function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

// Student Type Icons
function MonkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
    </svg>
  );
}

function NunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

function BoardingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function DayBoardingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

const navigation = [
  { name: 'Dashboard', id: 'dashboard' as const, icon: DashboardIcon },
  { name: 'Classes', id: 'classes' as const, icon: ClassIcon },
  { name: 'Subjects', id: 'subjects' as const, icon: SubjectIcon },
  { name: 'Class Teachers', id: 'teachers' as const, icon: TeacherIcon },
  { name: 'Students', id: 'students' as const, icon: StudentIcon },
];

export default function AdminDashboard() {
  // Mock role selector
  const [role, setRole] = useState<'admin' | 'teacher'>("admin");
  const [fullName, setFullName] = useState("Demo User");
  const router = useRouter();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active section state
  const [activeSection, setActiveSection] = useState<'dashboard' | 'classes' | 'subjects' | 'teachers' | 'students'>('dashboard');

  // Classes: use API
  const [classes, setClasses] = useState<{ id: number; name: string; section: string }[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState<string | null>(null);

  // Subjects: use API
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);

  // Teachers: use API
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teachersError, setTeachersError] = useState<string | null>(null);

  // Students: use API
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  // Results: use API
  const [results, setResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState<string | null>(null);

  // Student Type Statistics: use API
  const [studentStats, setStudentStats] = useState({
    monkStudents: 0,
    nunStudents: 0,
    boardingStudents: 0,
    dayBoardingStudents: 0,
    totalStudents: 0
  });
  const [studentStatsLoading, setStudentStatsLoading] = useState(true);
  const [studentStatsError, setStudentStatsError] = useState<string | null>(null);

  // Modal and form states - simplified for add only
  const [showClassModal, setShowClassModal] = useState(false);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherFirstName, setTeacherFirstName] = useState("");
  const [teacherLastName, setTeacherLastName] = useState("");
  const [teacherClassId, setTeacherClassId] = useState("");
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  const [studentRollNo, setStudentRollNo] = useState("");
  const [studentAdmissionNo, setStudentAdmissionNo] = useState("");
  const [studentClassId, setStudentClassId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState("Admin User");

  // Edit states
  const [editingClass, setEditingClass] = useState<any>(null);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [classSubjects, setClassSubjects] = useState<any[]>([]);

  // Accordion state for student panel
  const [expandedClasses, setExpandedClasses] = useState<Set<string | number>>(new Set());

  // Toggle accordion for classes
  const toggleClass = (classId: string | number) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedClasses(newExpanded);
  };

  // Organize students by class
  const studentsByClass = classes.map(cls => ({
    ...cls,
    students: students.filter(student => String(student.class_id) === String(cls.id))
  }));

  // Students without class
  const studentsWithoutClass = students.filter(student => !student.class_id);

  // Debug logging
  console.log('=== DEBUG INFO ===');
  console.log('Classes:', classes);
  console.log('Students:', students);
  console.log('Students by class:', studentsByClass);

  // Fetch classes from API on mount
  useEffect(() => {
    setClassesLoading(true);
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        setClassesLoading(false);
      })
      .catch(err => {
        setClassesError("Failed to load classes");
        setClassesLoading(false);
      });
    // Fetch subjects from API on mount
    setSubjectsLoading(true);
    fetch("/api/subjects")
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        setSubjectsLoading(false);
      })
      .catch(err => {
        setSubjectsError("Failed to load subjects");
        setSubjectsLoading(false);
      });
    // Fetch teachers from API on mount
    setTeachersLoading(true);
    fetch("/api/teachers")
      .then(res => res.json())
      .then(data => {
        setTeachers(data);
        setTeachersLoading(false);
      })
      .catch(err => {
        setTeachersError("Failed to load teachers");
        setTeachersLoading(false);
      });
    // Fetch students from API on mount
    setStudentsLoading(true);
    fetch("/api/students")
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        setStudentsLoading(false);
      })
      .catch(err => {
        setStudentsError("Failed to load students");
        setStudentsLoading(false);
      });
    // Fetch results from API on mount
    setResultsLoading(true);
    fetch("/api/grades")
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setResultsLoading(false);
      })
      .catch(err => {
        setResultsError("Failed to load results");
        setResultsLoading(false);
      });
    // Fetch student type statistics from API on mount
    setStudentStatsLoading(true);
    fetch("/api/student-stats")
      .then(res => res.json())
      .then(data => {
        setStudentStats(data);
        setStudentStatsLoading(false);
      })
      .catch(err => {
        setStudentStatsError("Failed to load student statistics");
        setStudentStatsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    router.push('/');
  };

  // Form handlers for adding data
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      setError("Class name is required");
      return;
    }
    
    try {
      const url = editingClass ? `/api/classes?id=${editingClass.id}` : '/api/classes';
      const method = editingClass ? 'PUT' : 'POST';
      
      const requestBody = editingClass 
        ? { id: editingClass.id, name: className, section: section || "" }
        : { name: className, section: section || "" };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const classData = await response.json();
        const classId = editingClass ? editingClass.id : classData.id;
        
        // Save class-subject relationships
        if (selectedSubjects.length > 0) {
          const subjectResponse = await fetch('/api/class-subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              class_id: classId, 
              subject_ids: selectedSubjects 
            })
          });
          
          if (!subjectResponse.ok) {
            console.warn('Failed to save class-subject relationships');
          }
        }
        
        setShowClassModal(false);
        setClassName("");
        setSection("");
        setSelectedSubjects([]);
        setEditingClass(null);
        setError(null);
        // Refresh classes data
        const updatedClasses = await fetch('/api/classes').then(res => res.json());
        setClasses(updatedClasses);
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to ${editingClass ? 'update' : 'add'} class`);
      }
    } catch (err) {
      setError(`Failed to ${editingClass ? 'update' : 'add'} class`);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      setError("Subject name is required");
      return;
    }
    
    try {
      const url = editingSubject ? `/api/subjects?id=${editingSubject.id}` : '/api/subjects';
      const method = editingSubject ? 'PUT' : 'POST';
      
      const requestBody = editingSubject 
        ? { id: editingSubject.id, name: subjectName }
        : { name: subjectName };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        setShowSubjectModal(false);
        setSubjectName("");
        setEditingSubject(null);
        setError(null);
        // Refresh subjects data
        const updatedSubjects = await fetch('/api/subjects').then(res => res.json());
        setSubjects(updatedSubjects);
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to ${editingSubject ? 'update' : 'add'} subject`);
      }
    } catch (err) {
      setError(`Failed to ${editingSubject ? 'update' : 'add'} subject`);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherFirstName.trim() || !teacherLastName.trim()) {
      setError("First name and last name are required");
      return;
    }
    
    try {
      const url = editingTeacher ? `/api/teachers?id=${editingTeacher.id}` : '/api/teachers';
      const method = editingTeacher ? 'PUT' : 'POST';
      
      const requestBody = editingTeacher 
        ? { id: editingTeacher.id, first_name: teacherFirstName, last_name: teacherLastName, class_id: teacherClassId || null }
        : { first_name: teacherFirstName, last_name: teacherLastName, class_id: teacherClassId || null };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        setShowTeacherModal(false);
        setTeacherFirstName("");
        setTeacherLastName("");
        setTeacherClassId("");
        setEditingTeacher(null);
        setError(null);
        // Refresh teachers data
        const updatedTeachers = await fetch('/api/teachers').then(res => res.json());
        setTeachers(updatedTeachers);
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to ${editingTeacher ? 'update' : 'add'} teacher`);
      }
    } catch (err) {
      setError(`Failed to ${editingTeacher ? 'update' : 'add'} teacher`);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFirstName.trim() || !studentLastName.trim() || !studentRollNo.trim() || !studentAdmissionNo.trim()) {
      setError("All fields are required");
      return;
    }
    
    // Validate roll number is numeric
    if (!/^[0-9]+$/.test(studentRollNo)) {
      setError("Please input number for roll number");
      return;
    }
    
    try {
      const url = editingStudent ? `/api/students?id=${editingStudent.student_id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          first_name: studentFirstName, 
          last_name: studentLastName, 
          student_id: studentAdmissionNo,
          roll_no: studentRollNo,
          class_id: studentClassId || null
        })
      });
      
      if (response.ok) {
        setShowStudentModal(false);
        setStudentFirstName("");
        setStudentLastName("");
        setStudentRollNo("");
        setStudentAdmissionNo("");
        setStudentClassId("");
        setEditingStudent(null);
        setError(null);
        // Refresh students data
        const updatedStudents = await fetch('/api/students').then(res => res.json());
        setStudents(updatedStudents);
        // Refresh student statistics
        const updatedStats = await fetch('/api/student-stats').then(res => res.json());
        setStudentStats(updatedStats);
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to ${editingStudent ? 'update' : 'add'} student`);
      }
    } catch (err) {
      setError(`Failed to ${editingStudent ? 'update' : 'add'} student`);
    }
  };

  // Edit and Delete handlers
  const handleEditClass = async (classItem: any) => {
    setEditingClass(classItem);
    setClassName(classItem.name);
    setSection(classItem.section || "");
    
    // Fetch currently assigned subjects for this class
    try {
      const response = await fetch(`/api/class-subjects?class_id=${classItem.id}`);
      if (response.ok) {
        const assignedSubjects = await response.json();
        const assignedSubjectIds = assignedSubjects.map((subject: any) => subject.id);
        setSelectedSubjects(assignedSubjectIds);
      } else {
        setSelectedSubjects([]);
      }
    } catch (error) {
      console.error('Failed to fetch assigned subjects:', error);
      setSelectedSubjects([]);
    }
    
    setShowClassModal(true);
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    try {
      const response = await fetch(`/api/classes?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh classes data
        const updatedClasses = await fetch('/api/classes').then(res => res.json());
        setClasses(updatedClasses);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete class");
      }
    } catch (err) {
      alert("Failed to delete class");
    }
  };

  const handleEditSubject = (subject: any) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setShowSubjectModal(true);
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      const response = await fetch(`/api/subjects?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh subjects data
        const updatedSubjects = await fetch('/api/subjects').then(res => res.json());
        setSubjects(updatedSubjects);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete subject");
      }
    } catch (err) {
      alert("Failed to delete subject");
    }
  };

  const handleEditTeacher = (teacher: any) => {
    setEditingTeacher(teacher);
    setTeacherFirstName(teacher.first_name);
    setTeacherLastName(teacher.last_name);
    setTeacherClassId(teacher.class_id || "");
    setShowTeacherModal(true);
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      const response = await fetch(`/api/teachers?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh teachers data
        const updatedTeachers = await fetch('/api/teachers').then(res => res.json());
        setTeachers(updatedTeachers);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete teacher");
      }
    } catch (err) {
      alert("Failed to delete teacher");
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setStudentFirstName(student.first_name);
    setStudentLastName(student.last_name);
    setStudentRollNo(student.roll_no || "");
    setStudentAdmissionNo(student.student_id);
    setStudentClassId(student.class_id || "");
    setShowStudentModal(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const response = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh students data
        const updatedStudents = await fetch('/api/students').then(res => res.json());
        setStudents(updatedStudents);
        // Refresh student statistics
        const updatedStats = await fetch('/api/student-stats').then(res => res.json());
        setStudentStats(updatedStats);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete student");
      }
    } catch (err) {
      alert("Failed to delete student");
    }
  };

  const statCards = [
    {
      name: 'Total Classes',
      value: classes.length,
      icon: ClassIcon,
      color: 'bg-blue-500',
      bgGradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      loading: classesLoading,
    },
    {
      name: 'Total Subjects',
      value: subjects.length,
      icon: SubjectIcon,
      color: 'bg-purple-500',
      bgGradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      loading: subjectsLoading,
    },
    {
      name: 'Total Class Teachers',
      value: teachers.length,
      icon: TeacherIcon,
      color: 'bg-green-500',
      bgGradient: 'bg-gradient-to-br from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      loading: teachersLoading,
    },
    {
      name: 'Total Students',
      value: students.length,
      icon: StudentIcon,
      color: 'bg-orange-500',
      bgGradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      loading: studentsLoading,
    },
    {
      name: 'Monk Students',
      value: studentStats.monkStudents,
      icon: MonkIcon,
      color: 'bg-indigo-500',
      bgGradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      loading: studentStatsLoading,
      style: { backgroundColor: '#9b2037' }
    },
    {
      name: 'Nun Students',
      value: studentStats.nunStudents,
      icon: NunIcon,
      color: 'bg-pink-500',
      bgGradient: 'bg-gradient-to-br from-pink-500 to-pink-600',
      iconBg: 'bg-black/20',
      iconColor: 'text-black',
      loading: studentStatsLoading,
      style: { backgroundColor: '#fff884' },
      textColor: 'text-black'
    },
    {
      name: 'Boarders Students',
      value: studentStats.boardingStudents,
      icon: BoardingIcon,
      color: 'bg-teal-500',
      bgGradient: 'bg-gradient-to-br from-teal-500 to-teal-600',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      loading: studentStatsLoading,
    },
    {
      name: 'Days Scholar',
      value: studentStats.dayBoardingStudents,
      icon: DayBoardingIcon,
      color: 'bg-amber-500',
      bgGradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      loading: studentStatsLoading,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffef2' }}>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ backgroundColor: '#fcf7f8' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center px-6 py-8 border-b border-neutral-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/SMD_Logo.png" alt="SMD Logo" className="w-full h-full object-cover" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-neutral-900">Himalayan Children</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false); // Close mobile menu when item is clicked
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <span className="mr-3">{item.icon({ className: 'w-6 h-6' })}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex-1 lg:flex-none">
                <h1 className="text-xl lg:text-2xl font-bold text-neutral-900">
                  {activeSection === 'dashboard' && 'Admin Dashboard'}
                  {activeSection === 'classes' && 'Classes Management'}
                  {activeSection === 'subjects' && 'Subjects Management'}
                  {activeSection === 'teachers' && 'Class Teacher Management'}
                  {activeSection === 'students' && 'Students Management'}
                </h1>
                <p className="text-sm lg:text-base text-neutral-600 hidden sm:block">
                  {activeSection === 'dashboard' && 'Welcome!'}
                  {activeSection === 'classes' && 'Manage and organize your school classes.'}
                  {activeSection === 'subjects' && 'Manage and organize your school subjects.'}
                  {activeSection === 'teachers' && 'Manage and organize your class teachers.'}
                  {activeSection === 'students' && 'Manage and organize your school students.'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 lg:space-x-4">
                <div className="text-black font-medium text-sm lg:text-base hidden sm:block">
                  Admin User
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 lg:px-4 py-2 text-white rounded-lg hover:bg-red-800 transition-colors duration-200 font-medium flex items-center space-x-1 lg:space-x-2 text-sm lg:text-base"
                  style={{ backgroundColor: '#9b2037' }}
                >
                  <LogoutIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-6">
          {activeSection === 'dashboard' && (
            <>
              {/* Stats Section */}
              <div className="w-full mb-6 lg:mb-8">
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900">School Statistics</h3>
                    <p className="text-sm text-neutral-600">Overview of your school's data and student categories</p>
                  </div>
                  <div className="card-body p-0 pt-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      {statCards.map((stat) => (
                        <div
                          key={stat.name}
                          className={`${stat.style ? '' : stat.bgGradient} text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-default group overflow-hidden relative`}
                          style={stat.style}
                        >
                          {/* Background Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
                              <div className="w-full h-full rounded-full bg-white opacity-20"></div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 transform -translate-x-6 translate-y-6">
                              <div className="w-full h-full rounded-full bg-white opacity-20"></div>
                            </div>
                          </div>
                          
                          <div className="relative p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className={`text-sm font-medium mb-1 ${stat.textColor || 'text-white/80'}`}>{stat.name}</p>
                                <div className={`text-2xl lg:text-3xl font-bold ${stat.textColor || 'text-white'}`}>
                                  {stat.loading ? (
                                    <div className="w-6 h-6 lg:w-8 lg:h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  ) : (
                                    stat.value
                                  )}
                                </div>
                              </div>
                              <div className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                                <span className={stat.iconColor}>{stat.icon({ className: 'w-5 h-5 lg:w-6 lg:h-6' })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="w-full">
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900">Quick Actions</h3>
                    <p className="text-sm text-neutral-600">Add new entries to the system</p>
                  </div>
                  <div className="card-body p-0 pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      <button
                        onClick={() => {
                          setSelectedSubjects([]);
                          setEditingClass(null);
                          setClassName("");
                          setSection("");
                          setError(null);
                          setShowClassModal(true);
                        }}
                        className="group relative bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 lg:p-6 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex flex-col items-center text-center space-y-3 lg:space-y-4">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <ClassIcon className="text-white w-6 h-6 lg:w-8 lg:h-8" />
                          </div>
                          <div>
                            <h4 className="text-base lg:text-lg font-semibold text-blue-900 group-hover:text-blue-800 transition-colors">Add Class</h4>
                            <p className="text-xs lg:text-sm text-blue-700 group-hover:text-blue-600 transition-colors">Create new class</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowSubjectModal(true)}
                        className="group relative bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 lg:p-6 hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex flex-col items-center text-center space-y-3 lg:space-y-4">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <SubjectIcon className="text-white w-6 h-6 lg:w-8 lg:h-8" />
                          </div>
                          <div>
                            <h4 className="text-base lg:text-lg font-semibold text-purple-900 group-hover:text-purple-800 transition-colors">Add Subject</h4>
                            <p className="text-xs lg:text-sm text-purple-700 group-hover:text-purple-600 transition-colors">Create new subject</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowTeacherModal(true)}
                        className="group relative bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 lg:p-6 hover:from-green-100 hover:to-green-200 hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex flex-col items-center text-center space-y-3 lg:space-y-4">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <TeacherIcon className="text-white w-6 h-6 lg:w-8 lg:h-8" />
                          </div>
                          <div>
                            <h4 className="text-base lg:text-lg font-semibold text-green-900 group-hover:text-green-800 transition-colors">Add Teacher</h4>
                            <p className="text-xs lg:text-sm text-green-700 group-hover:text-green-600 transition-colors">Create new teacher</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setShowStudentModal(true)}
                        className="group relative bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 lg:p-6 hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex flex-col items-center text-center space-y-3 lg:space-y-4">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <StudentIcon className="text-white w-6 h-6 lg:w-8 lg:h-8" />
                          </div>
                          <div>
                            <h4 className="text-base lg:text-lg font-semibold text-orange-900 group-hover:text-orange-800 transition-colors">Add Student</h4>
                            <p className="text-xs lg:text-sm text-orange-700 group-hover:text-orange-600 transition-colors">Create new student</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === 'classes' && (
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Classes Management</h1>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Section</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Full Name</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classes.map((classItem) => (
                        <tr key={classItem.id} className="hover:bg-gray-50">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <ClassIcon className="w-5 h-5 text-blue-500 mr-3" />
                              <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-900">{classItem.section || '-'}</div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                            <div className="text-sm text-gray-900">
                              {classItem.name}{classItem.section ? ` - ${classItem.section}` : ''}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditClass(classItem)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteClass(String(classItem.id))}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {classes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No classes found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'subjects' && (
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Subjects Management</h1>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Created</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {subjects
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((subject) => (
                        <tr key={subject.id} className="hover:bg-gray-50">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <SubjectIcon className="w-5 h-5 text-purple-500 mr-3" />
                              <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                            {new Date(subject.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditSubject(subject)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(String(subject.id))}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {subjects.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No subjects found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'teachers' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Class Teacher Management</h1>
              </div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <TeacherIcon className="w-5 h-5 text-green-500 mr-3" />
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.first_name} {teacher.last_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {teacher.class_name ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {teacher.class_name}{teacher.class_section ? ` - ${teacher.class_section}` : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Not Assigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(teacher.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditTeacher(teacher)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {teachers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No class teachers found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'students' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
              </div>
              
              {/* Student Accordion Panel */}
              <div className="w-full">
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-neutral-900">Students by Class</h3>
                    <p className="text-sm text-neutral-600">View all students organized by their assigned classes</p>
                  </div>
                  <div className="card-body p-0">
                    {studentsLoading ? (
                      <div className="flex items-center justify-center py-8 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-neutral-600 font-medium">Loading students...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-6 pr-6 pb-6 pl-0">
                        {/* Classes with students */}
                        {studentsByClass.map((classData) => (
                          <div key={classData.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleClass(classData.id)}
                              className="w-full px-4 py-3 transition-colors duration-200 flex items-center justify-between"
                              style={{ backgroundColor: '#fcf7f8' }}
                            >
                              <div className="flex items-center space-x-3">
                                <Building2 size={20} className="text-blue-600" />
                                <div>
                                  <h4 className="font-semibold text-blue-900">
                                    {classData.name}{classData.section ? ` - ${classData.section}` : ""}
                                  </h4>
                                  <p className="text-sm text-blue-700">
                                    {classData.students.length} student{classData.students.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-blue-600 font-medium">
                                  {expandedClasses.has(classData.id) ? 'Collapse' : 'Expand'}
                                </span>
                                <svg
                                  className={`w-5 h-5 text-blue-600 transition-transform duration-200 ${
                                    expandedClasses.has(classData.id) ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </button>
                            
                            {expandedClasses.has(classData.id) && (
                              <div className="bg-white border-t border-neutral-200">
                                {classData.students.length > 0 ? (
                                  <div className="p-4 space-y-2">
                                    {classData.students
                                      .sort((a, b) => {
                                        const aRoll = parseInt(a.roll_no || '0', 10);
                                        const bRoll = parseInt(b.roll_no || '0', 10);
                                        return aRoll - bRoll;
                                      })
                                      .map((student) => (
                                        <div
                                          key={student.id}
                                          className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                                        >
                                          <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                              <StudentIcon className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <div>
                                              <p className="font-medium text-neutral-900">
                                                {student.first_name} {student.last_name}
                                              </p>
                                              <p className="text-sm text-neutral-600">
                                                Roll #{student.roll_no || student.roll_number || 'N/A'} | 
                                                Admission: {student.student_id}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <button
                                              onClick={() => handleEditStudent(student)}
                                              className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                                              title="Edit"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={() => handleDeleteStudent(student.student_id)}
                                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                              title="Delete"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <div className="p-4 text-center text-neutral-500">
                                    No students assigned to this class
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Students without class */}
                        {studentsWithoutClass.length > 0 && (
                          <div className="border border-neutral-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => toggleClass(-1)}
                              className="w-full px-4 py-3 transition-colors duration-200 flex items-center justify-between"
                              style={{ backgroundColor: '#fcf7f8' }}
                            >
                              <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                  <h4 className="font-semibold text-gray-900">Unassigned Students</h4>
                                  <p className="text-sm text-gray-700">
                                    {studentsWithoutClass.length} student{studentsWithoutClass.length !== 1 ? 's' : ''} without class
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 font-medium">
                                  {expandedClasses.has(-1) ? 'Collapse' : 'Expand'}
                                </span>
                                <svg
                                  className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                                    expandedClasses.has(-1) ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </button>
                            
                            {expandedClasses.has(-1) && (
                              <div className="bg-white border-t border-neutral-200">
                                <div className="p-4 space-y-2">
                                  {studentsWithoutClass
                                    .sort((a, b) => {
                                      const aRoll = parseInt(a.roll_no || '0', 10);
                                      const bRoll = parseInt(b.roll_no || '0', 10);
                                      return aRoll - bRoll;
                                    })
                                    .map((student) => (
                                      <div
                                        key={student.id}
                                        className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <StudentIcon className="w-4 h-4 text-orange-600" />
                                          </div>
                                          <div>
                                            <p className="font-medium text-neutral-900">
                                              {student.first_name} {student.last_name}
                                            </p>
                                            <p className="text-sm text-neutral-600">
                                              Roll #{student.roll_no || student.roll_number || 'N/A'} | 
                                              Admission: {student.student_id}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={() => handleEditStudent(student)}
                                            className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                                            title="Edit"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={() => handleDeleteStudent(student.student_id)}
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                            title="Delete"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* No students message */}
                        {studentsByClass.length === 0 && studentsWithoutClass.length === 0 && (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <StudentIcon className="w-8 h-8 text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No students found</h3>
                            <p className="text-neutral-600">Add some students to see them organized by class.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 w-full max-w-md relative">
            <button
              onClick={() => {
                setShowClassModal(false);
                setClassName("");
                setSection("");
                setEditingClass(null);
                setError(null);
              }}
              className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-700 text-xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4 text-neutral-800">
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h2>
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <form onSubmit={handleAddClass} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input
                  type="text"
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  placeholder="e.g., Class 1, Class 2"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section (Optional)</label>
                <input
                  type="text"
                  value={section}
                  onChange={e => setSection(e.target.value)}
                  placeholder="e.g., A, B, C"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors"
              >
                {editingClass ? 'Update Class' : 'Add Class'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 w-full max-w-md relative">
            <button
              onClick={() => {
                setShowSubjectModal(false);
                setSubjectName("");
                setEditingSubject(null);
                setError(null);
              }}
              className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-700 text-xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4 text-neutral-800">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <form onSubmit={handleAddSubject} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  placeholder="e.g., Mathematics, English"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition-colors"
              >
                {editingSubject ? 'Update Subject' : 'Add Subject'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 w-full max-w-md relative">
            <button
              onClick={() => {
                setShowTeacherModal(false);
                setTeacherFirstName("");
                setTeacherLastName("");
                setTeacherClassId("");
                setEditingTeacher(null);
                setError(null);
              }}
              className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-700 text-xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4 text-neutral-800">
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </h2>
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <form onSubmit={handleAddTeacher} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={teacherFirstName}
                  onChange={e => setTeacherFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={teacherLastName}
                  onChange={e => setTeacherLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class (Optional)</label>
                <select
                  value={teacherClassId}
                  onChange={e => setTeacherClassId(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}{cls.section ? ` - ${cls.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-colors"
              >
                {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 w-full max-w-md relative">
            <button
              onClick={() => {
                setShowStudentModal(false);
                setStudentFirstName("");
                setStudentLastName("");
                setStudentRollNo("");
                setStudentAdmissionNo("");
                setStudentClassId("");
                setEditingStudent(null);
                setError(null);
              }}
              className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-700 text-xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4 text-neutral-800">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={studentFirstName}
                  onChange={e => setStudentFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={studentLastName}
                  onChange={e => setStudentLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input
                  type="number"
                  value={studentRollNo}
                  onChange={e => setStudentRollNo(e.target.value)}
                  placeholder="Roll number (numbers only)"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                <input
                  type="text"
                  value={studentAdmissionNo}
                  onChange={e => setStudentAdmissionNo(e.target.value)}
                  placeholder="Admission number"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class (Optional)</label>
                <select
                  value={studentClassId}
                  onChange={e => setStudentClassId(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}{cls.section ? ` - ${cls.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold shadow hover:bg-orange-700 transition-colors"
              >
                Add Student
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 