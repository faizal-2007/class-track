'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  BarChart3, 
  ShieldCheck, 
  UserPlus, 
  Upload, 
  FileSpreadsheet,
  ArrowRight,
  School
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [facultyCount, setFacultyCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [deptCount, setDeptCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const profiles = db.getProfiles();
    setFacultyCount(profiles.filter(p => p.role === 'faculty').length);
    setStudentCount(profiles.filter(p => p.role === 'student').length);
    setDeptCount(db.getDepartments().length);
    setTotalRecords(db.getAllRecords().length);
  }, []);

  return (
    <div className="space-y-6">
      {/* Admin institutional banner */}
      <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1b9aaa] to-[#1e3a8a] text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-[#92d40e] text-black">
            Administrator Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Yenepoya School of Engineering &amp; Technology
          </h1>
          <p className="text-xs text-blue-100 mt-1 flex items-center gap-2">
            <span>Signed in as: <strong>{user?.full_name}</strong></span>
            <span>•</span>
            <span>Admin Designation: <strong>Principal / Academic Controller</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/students"
            className="px-4 py-2.5 rounded-xl bg-[#92d40e] text-black font-extrabold text-xs hover:bg-[#85c20c] transition-all shadow-md flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk CSV Import</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[var(--border-grey)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Students</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 mt-2">{studentCount}</p>
          <p className="text-[11px] text-gray-400 mt-1">Enrolled across branches</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[var(--border-grey)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Faculty Members</span>
            <div className="p-2 bg-blue-50 text-[#1e3a8a] rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 mt-2">{facultyCount}</p>
          <p className="text-[11px] text-gray-400 mt-1">Approved teaching staff</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[var(--border-grey)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Departments</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 mt-2">{deptCount}</p>
          <p className="text-[11px] text-gray-400 mt-1">CSE, ISE, ECE, AIML</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[var(--border-grey)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Logs</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 mt-2">{totalRecords}</p>
          <p className="text-[11px] text-gray-400 mt-1">Verified attendance records</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/admin/faculty"
          className="bg-white p-6 rounded-2xl border border-[var(--border-grey)] hover:border-[#1e3a8a] transition-all shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#1e3a8a] flex items-center justify-between">
            <span>Faculty Management</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Create and onboard faculty profiles, allocate departments, and configure teaching credentials.
          </p>
        </Link>

        <Link
          href="/admin/students"
          className="bg-white p-6 rounded-2xl border border-[var(--border-grey)] hover:border-[#1e3a8a] transition-all shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#1e3a8a] flex items-center justify-between">
            <span>Student Roster &amp; CSV Import</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Bulk-import entire class cohorts via CSV spreadsheets and manage section enrollments.
          </p>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-white p-6 rounded-2xl border border-[var(--border-grey)] hover:border-[#1e3a8a] transition-all shadow-xs group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#1e3a8a] flex items-center justify-between">
            <span>Institutional Reports &amp; PDF</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Generate college-wide compliance reviews, export CSV logs, and create printable PDF documents.
          </p>
        </Link>
      </div>
    </div>
  );
}
