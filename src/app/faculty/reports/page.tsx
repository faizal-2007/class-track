'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { ClassSession, AttendanceRecord, Profile } from '@/types';
import { 
  ArrowLeft, 
  BarChart3, 
  Download, 
  Search, 
  AlertCircle, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function FacultyReportsPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);

  useEffect(() => {
    if (user) {
      const facClasses = db.getClasses(user.id);
      setClasses(facClasses);
      const allStudents = db.getProfiles().filter(p => p.role === 'student');
      setStudents(allStudents);
      setRecords(db.getAllRecords());
    }
  }, [user]);

  const handleDownloadCSV = () => {
    const url = `/api/reports/export?format=csv${selectedClassId !== 'all' ? `&classId=${selectedClassId}` : ''}`;
    window.open(url, '_blank');
  };

  const filteredRecords = selectedClassId === 'all' 
    ? records 
    : records.filter(r => r.class_id === selectedClassId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/faculty"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1e3a8a] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Faculty Home</span>
          </Link>
          <h1 className="text-2xl font-black text-[#1e3a8a] tracking-tight">
            Class &amp; Attendance Analytics
          </h1>
          <p className="text-xs text-gray-500">
            Subject-wise and student-wise compliance summaries with 75% threshold flags.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-xs font-bold hover:bg-blue-900 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter header */}
      <div className="bg-white p-4 rounded-xl border border-[var(--border-grey)] flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-600">Select Lecture:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-hidden focus:border-[#1e3a8a]"
          >
            <option value="all">All Assigned Lectures</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code} - {c.course_name} ({c.room})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-gray-500">
          Showing <strong>{filteredRecords.length}</strong> logged attendance events
        </div>
      </div>

      {/* Student Attendance Summary Table */}
      <div className="bg-white rounded-xl border border-[var(--border-grey)] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#1e3a8a]" />
            Student Eligibility Matrix
          </h3>
          <span className="text-[11px] text-gray-500 font-medium">
            Threshold: &ge; 75%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">USN</th>
                <th className="py-3 px-4 text-center">Classes Attended</th>
                <th className="py-3 px-4 text-center">Attendance %</th>
                <th className="py-3 px-4">Eligibility Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((stu) => {
                const stats = db.getStudentStats(stu.id);
                return (
                  <tr key={stu.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {stu.full_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">
                      {stu.usn_faculty_id}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {stats.attended} / {stats.totalClasses}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-bold ${stats.percentage >= 75 ? 'text-[#1e3a8a]' : 'text-red-600'}`}>
                        {stats.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {stats.percentage >= 75 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3 h-3" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded">
                          <AlertCircle className="w-3 h-3" /> Shortage (&lt;75%)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
