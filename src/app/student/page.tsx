'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { AttendanceStats, ClassSession } from '@/types';
import LowAttendanceAlert from '@/components/LowAttendanceAlert';
import { 
  QrCode, 
  Clock, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [dateDisplay, setDateDisplay] = useState('Today');

  useEffect(() => {
    setDateDisplay(new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }));
    if (user && user.role === 'student') {
      const studentStats = db.getStudentStats(user.id);
      setStats(studentStats);
      const studentClasses = db.getClasses(undefined, user.id);
      setClasses(studentClasses);
    }
  }, [user]);

  if (!user || !stats) {
    return <div className="p-8 text-center text-xs text-gray-500">Loading student dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner & Fast QR Scan Button */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2b6ca3] text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-[#92d40e] text-black">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Welcome, {user.full_name}
          </h1>
          <p className="text-xs text-blue-100 mt-1 flex items-center gap-2">
            <span>USN: <strong className="font-mono">{user.usn_faculty_id}</strong></span>
            <span>•</span>
            <span>Department: <strong>{user.department_name || 'CSE'}</strong></span>
          </p>
        </div>

        <Link
          href="/student/scan"
          className="shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[#92d40e] text-black font-extrabold text-sm hover:bg-[#85c20c] hover:scale-102 transition-all shadow-md"
        >
          <QrCode className="w-5 h-5" />
          <span>Scan Attendance QR</span>
        </Link>
      </div>

      {/* Mandatory <75% University Warning */}
      <LowAttendanceAlert percentage={stats.percentage} threshold={75} />

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[var(--border-grey)] shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Overall Attendance</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-black tracking-tight ${
              stats.percentage >= 75 ? 'text-[#1e3a8a]' : 'text-amber-600'
            }`}>
              {stats.percentage}%
            </span>
            <span className="text-xs text-gray-400">Target &ge; 75%</span>
          </div>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                stats.percentage >= 75 ? 'bg-[#92d40e]' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, stats.percentage)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[var(--border-grey)] shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Classes Attended</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">
              {stats.attended}
            </span>
            <span className="text-xs text-gray-500">/ {stats.totalClasses} total</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Active semester count</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[var(--border-grey)] shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Today&apos;s Lectures</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">
              {classes.length}
            </span>
            <span className="text-xs text-gray-500">Scheduled</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-2">Timetable synced</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[var(--border-grey)] shadow-xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Exam Eligibility</p>
          <div className="mt-2 flex items-center gap-2">
            {stats.percentage >= 75 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle className="w-3.5 h-3.5" /> Eligible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                <AlertCircle className="w-3.5 h-3.5" /> At Risk (&lt;75%)
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Per University Ordinance</p>
        </div>
      </div>

      {/* Two Column Layout: Subject-wise Breakdown & Today's Schedule */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Subject-wise breakdown */}
        <div className="bg-white rounded-xl border border-[var(--border-grey)] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-sm font-extrabold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Subject-wise Attendance
            </h2>
            <Link href="/student/history" className="text-xs font-bold text-[#1e3a8a] hover:underline flex items-center gap-1">
              <span>View Logs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.courseBreakdown.map((item) => (
              <div key={item.courseId} className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/50">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-blue-100 text-[#1e3a8a]">
                      {item.courseCode}
                    </span>
                    <h3 className="text-xs font-bold text-gray-900 mt-1">{item.courseName}</h3>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${item.percentage >= 75 ? 'text-[#1e3a8a]' : 'text-red-600'}`}>
                      {item.percentage}%
                    </span>
                    <p className="text-[10px] text-gray-500">{item.attended}/{item.total} classes</p>
                  </div>
                </div>

                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.percentage >= 75 ? 'bg-[#92d40e]' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>

                {item.isLow && (
                  <p className="text-[10px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Needs immediate attendance to clear shortage.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Timetable */}
        <div className="bg-white rounded-xl border border-[var(--border-grey)] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-sm font-extrabold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Today&apos;s Classes
            </h2>
            <span className="text-xs font-semibold text-gray-500">
              {dateDisplay}
            </span>
          </div>

          <div className="space-y-3">
            {classes.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No scheduled lectures for today.</p>
            ) : (
              classes.map((cls) => (
                <div key={cls.id} className="p-3.5 rounded-lg border border-gray-100 bg-white hover:border-[#1e3a8a]/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold font-mono text-[#1e3a8a]">
                        {cls.course_code}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900">{cls.course_name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                      {cls.start_time} - {cls.end_time}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {cls.room}
                    </span>
                    <span>Faculty: <strong>{cls.faculty_name}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
