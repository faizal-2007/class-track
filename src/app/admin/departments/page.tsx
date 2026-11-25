'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Department, Course, Section } from '@/types';
import { 
  ArrowLeft, 
  Building2, 
  BookOpen, 
  Layers, 
  Plus, 
  Trash2,
  Calendar
} from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  // Department modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');

  // Course modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDeptId, setCourseDeptId] = useState('');
  const [courseCredits, setCourseCredits] = useState(4);

  // Section modal
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [secCourseId, setSecCourseId] = useState('');
  const [secName, setSecName] = useState('5th Sem - Section A');
  const [secSem, setSecSem] = useState(5);
  const [secYear, setSecYear] = useState('2024-2025');

  useEffect(() => {
    const d = db.getDepartments();
    const c = db.getCourses();
    const s = db.getSections();
    setDepartments(d);
    setCourses(c);
    setSections(s);
    if (d.length > 0) setCourseDeptId(d[0].id);
    if (c.length > 0) setSecCourseId(c[0].id);
  }, []);

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptCode || !deptName) return;
    db.addDepartment(deptCode, deptName);
    setDepartments(db.getDepartments());
    setShowDeptModal(false);
    setDeptCode('');
    setDeptName('');
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseName || !courseDeptId) return;
    db.addCourse(courseCode, courseName, courseDeptId, courseCredits);
    setCourses(db.getCourses());
    setShowCourseModal(false);
    setCourseCode('');
    setCourseName('');
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secCourseId || !secName) return;
    db.addSection(secCourseId, secName, secSem, secYear);
    setSections(db.getSections());
    setShowSectionModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1e3a8a] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Home</span>
          </Link>
          <h1 className="text-2xl font-black text-[#1e3a8a] tracking-tight">
            Academic Hierarchy Management
          </h1>
          <p className="text-xs text-gray-500">
            Departments, syllabus courses, semester cohorts, and section allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeptModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold border border-purple-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Dept</span>
          </button>
          <button
            onClick={() => setShowCourseModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-[#1e3a8a] hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Course</span>
          </button>
          <button
            onClick={() => setShowSectionModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#92d40e] text-black font-extrabold text-xs hover:bg-[#85c20c] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Section</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 1. Departments */}
        <div className="bg-white rounded-xl border border-[var(--border-grey)] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-xs font-extrabold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Departments ({departments.length})
            </h2>
          </div>
          <div className="mt-4 space-y-3">
            {departments.map((d) => (
              <div key={d.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                  {d.code}
                </span>
                <p className="text-xs font-bold text-gray-900 mt-1">{d.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Courses */}
        <div className="bg-white rounded-xl border border-[var(--border-grey)] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-xs font-extrabold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Active Courses ({courses.length})
            </h2>
          </div>
          <div className="mt-4 space-y-3">
            {courses.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#1e3a8a]">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">{c.credits} Credits</span>
                </div>
                <p className="text-xs font-bold text-gray-900 mt-1">{c.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Sections */}
        <div className="bg-white rounded-xl border border-[var(--border-grey)] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-xs font-extrabold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Sections / Cohorts ({sections.length})
            </h2>
          </div>
          <div className="mt-4 space-y-3">
            {sections.map((s) => (
              <div key={s.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">{s.name}</span>
                  <span className="text-[10px] font-mono text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                    Sem {s.semester}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Course: {s.course_code} - {s.course_name}</p>
                <p className="text-[10px] text-gray-400">Academic Year: {s.academic_year}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dept Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-3">Add Department</h3>
            <form onSubmit={handleAddDept} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ME"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Engineering"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDeptModal(false)} className="px-3 py-1.5 text-xs text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-[#1e3a8a] text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-3">Add Course</h3>
            <form onSubmit={handleAddCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 21CS54"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Computing & DevOps"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                <select
                  value={courseDeptId}
                  onChange={(e) => setCourseDeptId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCourseModal(false)} className="px-3 py-1.5 text-xs text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-[#1e3a8a] text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-3">Add Section / Cohort</h3>
            <form onSubmit={handleAddSection} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Course</label>
                <select
                  value={secCourseId}
                  onChange={(e) => setSecCourseId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Section Name</label>
                <input
                  type="text"
                  required
                  value={secName}
                  onChange={(e) => setSecName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={secSem}
                    onChange={(e) => setSecSem(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={secYear}
                    onChange={(e) => setSecYear(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSectionModal(false)} className="px-3 py-1.5 text-xs text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-[#1e3a8a] text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
