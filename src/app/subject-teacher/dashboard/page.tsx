"use client";
import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SubjectTeacherDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role;
      if (role !== "subject_teacher") {
        router.replace("/not-authorized");
      }
    };
    checkRole();
  }, [router]);

  useEffect(() => {
    // Placeholder: fetch all classes (update logic later as needed)
    fetch("/api/classes").then(res => res.json()).then(setClasses);
  }, []);

  // You can copy the logic from the class teacher dashboard here if needed
  // For now, just show a similar heading and placeholder
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffef2' }}>
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Subject Teacher Dashboard</h1>
                <p className="text-xs lg:text-sm text-slate-600 font-medium hidden sm:block">Manage grades and student progress for your subjects</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
          {/* Class Selection */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 lg:p-8 mb-6 lg:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-base lg:text-lg font-medium"
                >
                  <option value="">Choose a class to manage grades...</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}{cls.section ? ` - ${cls.section}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* End Class Selection */}
          <div className="text-center py-12 lg:py-16">
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 lg:mb-3">Welcome to the Subject Teacher Dashboard</h3>
            <p className="text-slate-600 text-base lg:text-lg">This is a placeholder. You can add subject-specific grading and management features here.</p>
          </div>
        </div>
      </main>
    </div>
  );
} 