// Class operations
export const classService = {
  async getAll(): Promise<any[]> {
    const response = await fetch('/api/classes');
    if (!response.ok) throw new Error('Failed to fetch classes');
    return response.json();
  },

  async create(classData: any): Promise<any> {
    const response = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData)
    });
    if (!response.ok) throw new Error('Failed to create class');
    return response.json();
  },

  async update(id: string, updates: any): Promise<any> {
    const response = await fetch('/api/classes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    });
    if (!response.ok) throw new Error('Failed to update class');
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/classes?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete class');
  }
}

// Subject operations
export const subjectService = {
  async getAll(): Promise<any[]> {
    const response = await fetch('/api/subjects');
    if (!response.ok) throw new Error('Failed to fetch subjects');
    return response.json();
  },

  async create(subjectData: any): Promise<any> {
    const response = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData)
    });
    if (!response.ok) throw new Error('Failed to create subject');
    return response.json();
  },

  async update(id: string, updates: any): Promise<any> {
    const response = await fetch('/api/subjects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    });
    if (!response.ok) throw new Error('Failed to update subject');
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/subjects?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete subject');
  }
}

// Teacher operations
export const teacherService = {
  async getAll(): Promise<any[]> {
    const response = await fetch('/api/teachers');
    if (!response.ok) throw new Error('Failed to fetch teachers');
    return response.json();
  },

  async create(teacherData: any): Promise<any> {
    const response = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData)
    });
    if (!response.ok) throw new Error('Failed to create teacher');
    return response.json();
  },

  async update(id: string, updates: any): Promise<any> {
    const response = await fetch('/api/teachers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    });
    if (!response.ok) throw new Error('Failed to update teacher');
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/teachers?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete teacher');
  }
}

// Student operations
export const studentService = {
  async getAll(): Promise<any[]> {
    const response = await fetch('/api/students');
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },

  async create(studentData: any): Promise<any> {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    if (!response.ok) throw new Error('Failed to create student');
    return response.json();
  },

  async update(id: string, updates: any): Promise<any> {
    const response = await fetch('/api/students', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    });
    if (!response.ok) throw new Error('Failed to update student');
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/students?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete student');
  }
}

// Dashboard statistics
export const dashboardService = {
  async getStats() {
    const [classes, subjects, teachers, students] = await Promise.all([
      classService.getAll(),
      subjectService.getAll(),
      teacherService.getAll(),
      studentService.getAll()
    ])

    return {
      classesCount: classes.length,
      subjectsCount: subjects.length,
      teachersCount: teachers.length,
      studentsCount: students.length
    }
  }
} 