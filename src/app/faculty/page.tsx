'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { ClassSession, AttendanceSession } from '@/types';
import { 
  Clock, 
  Calendar, 
  Users, 
  Play, 
  QrCode, 
  CheckCircle, 
  ArrowRight,
  BookOpen,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [activeSessionsMap, setActiveSessionsMap] = useState<Record<string, AttendanceSession | null>>({});
  const [todayString, setTodayString] = useState('Today');

  useEffect(() => {
    setTodayString(new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }));
    if (user) {
      const facClasses = db.getClasses(user.id);
      setClasses(facClasses);

      // Check active sessions
      const map: Record<string, AttendanceSession | null> = {};
      facClasses.forEach(c => {
        map[c.id] = db.getActiveSessionForClass(c.id);
      });
      setActiveSessionsMap(map);
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Faculty Header Banner */}
      <div className="bg-gradient-to-r from-[#1e3a8a] via-[#204060] to-[#1b9aaa] text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-[#92d40e] text-black">
            Faculty Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            {user?.full_name}
          </h1>
          <p className="text-xs text-blue-100 mt-1 flex items-center gap-2">
            <span>Faculty ID: <strong className="font-mono">{user?.usn_faculty_id}</strong></span>
            <span>•</span>
            <span>Department: <strong>{user?.department_name || 'Engineering'}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/faculty/classes"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20"
          >
            Manage Timetable
          </Link>
          <Link
            href="/faculty/calendar"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20 flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Academic Calendar</span>
          </Link>
        </div>
      </div>

      {/* Quick Action Schedule Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1e3a8a] tracking-tight">
              Today&apos;s Assigned Classes &amp; Sessions
            </h2>
            <p className="text-xs text-gray-500">
              Start attendance or resume active live QR code for students.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {todayString}
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => {
            const activeSession = activeSessionsMap[cls.id];
            return (
              <div 
                key={cls.id} 
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
                  activeSession 
                    ? 'border-[#92d40e] ring-2 ring-[#92d40e]/20' 
                    : 'border-[var(--border-grey)] hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {cls.course_code}
                    </span>
                    {activeSession ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#92d40e]/20 text-[#4c7500] animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#92d40e]"></span> Live Session
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                        Ready
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mt-2.5 leading-snug">
                    {cls.course_name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    {cls.section_name}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-mono">{cls.start_time} - {cls.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{cls.room}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <Link
                    href={`/faculty/classes/${cls.id}/session`}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-xs ${
                      activeSession
                        ? 'bg-[#1e3a8a] text-white hover:bg-blue-900'
                        : 'bg-[#92d40e] text-black hover:bg-[#85c20c]'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{activeSession ? 'Open Live Session' : 'Start Attendance'}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
