'use client';

import React, { useState } from 'react';
import StudentGradesTable from './StudentGradesTable';

export default function StudentGradesTableDemo() {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student' | 'parent'>('teacher');
  const [selectedClass, setSelectedClass] = useState('class-1');
  const [selectedTerm, setSelectedTerm] = useState('first');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Student Grades Table - Usage Examples</h1>
      
      {/* Role Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Role to See Different Configurations:</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedRole('admin')}
            className={`px-4 py-2 rounded-lg ${
              selectedRole === 'admin' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Admin View
          </button>
          <button
            onClick={() => setSelectedRole('teacher')}
            className={`px-4 py-2 rounded-lg ${
              selectedRole === 'teacher' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Teacher View
          </button>
          <button
            onClick={() => setSelectedRole('student')}
            className={`px-4 py-2 rounded-lg ${
              selectedRole === 'student' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Student View
          </button>
          <button
            onClick={() => setSelectedRole('parent')}
            className={`px-4 py-2 rounded-lg ${
              selectedRole === 'parent' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Parent View
          </button>
        </div>
      </div>

      {/* Configuration Display */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Current Configuration:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Role:</strong> {selectedRole}
          </div>
          <div>
            <strong>Editable:</strong> {selectedRole === 'admin' || selectedRole === 'teacher' ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Show Actions:</strong> {selectedRole === 'admin' || selectedRole === 'teacher' ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Show Calculations:</strong> Yes
          </div>
        </div>
      </div>

      {/* Class and Term Selection */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="class-1">Class 1</option>
            <option value="class-2">Class 2</option>
            <option value="class-3">Class 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Term:</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="first">First Term</option>
            <option value="second">Second Term</option>
            <option value="third">Third Term</option>
          </select>
        </div>
      </div>

      {/* Student Grades Table */}
      <StudentGradesTable
        isEditable={selectedRole === 'admin' || selectedRole === 'teacher'}
        userRole={selectedRole}
        selectedClass={selectedClass}
        selectedTerm={selectedTerm}
        showActions={selectedRole === 'admin' || selectedRole === 'teacher'}
        showCalculations={true}
      />

      {/* Usage Instructions */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">How to Use This Component:</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">1. Import the Component:</h4>
            <code className="block bg-gray-800 text-green-400 p-2 rounded mt-1">
              import StudentGradesTable from '@/components/StudentGradesTable';
            </code>
          </div>
          
          <div>
            <h4 className="font-medium">2. Use in Your Dashboard:</h4>
            <code className="block bg-gray-800 text-green-400 p-2 rounded mt-1">
              {`<StudentGradesTable
  isEditable={true}
  userRole="teacher"
  selectedClass="class-1"
  selectedTerm="first"
  showActions={true}
  showCalculations={true}
/>`}
            </code>
          </div>
          
          <div>
            <h4 className="font-medium">3. Available Props:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>isEditable:</strong> Enable/disable grade editing</li>
              <li><strong>userRole:</strong> 'admin' | 'teacher' | 'student' | 'parent'</li>
              <li><strong>selectedClass:</strong> Class ID to display</li>
              <li><strong>selectedTerm:</strong> Term to display</li>
              <li><strong>showActions:</strong> Show print/PDF buttons</li>
              <li><strong>showCalculations:</strong> Show total/percentage/division columns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 