'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { ClassSession, AttendanceSession, AttendanceRecord, Enrollment } from '@/types';
import QRGenerator from '@/components/QRGenerator';
import CountdownTimer from '@/components/CountdownTimer';
import { 
  ArrowLeft, 
  Play, 
  StopCircle, 
  RefreshCw, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  UserCheck, 
  Maximize2,
  Minimize2,
  ShieldAlert,
  Sparkles,
  Edit3
} from 'lucide-react';

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default function FacultySessionPage({ params }: SessionPageProps) {
  const resolvedParams = use(params);
  const classId = resolvedParams.id;
  const { user } = useAuth();

  const [classItem, setClassItem] = useState<ClassSession | null>(null);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<Enrollment[]>([]);
  
  // Controls
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [allowLate, setAllowLate] = useState<boolean>(true);
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState<number>(3);
  const [autoRefreshQR, setAutoRefreshQR] = useState<boolean>(true);
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Manual override modal state
  const [overrideStudentId, setOverrideStudentId] = useState<string | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<'present' | 'late' | 'absent' | 'excused'>('present');
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);

  const fetchStatus = useCallback(() => {
    if (!classId) return;
    const session = db.getActiveSessionForClass(classId);
    setActiveSession(session);
    if (session) {
      const recs = db.getRecordsForSession(session.id);
      setRecords(recs);
    } else {
      const classRecs = db.getRecordsForClass(classId);
      setRecords(classRecs);
    }
  }, [classId]);

  useEffect(() => {
    const cls = db.getClassById(classId);
    setClassItem(cls);
    if (cls) {
      const enr = db.getEnrollments(cls.section_id);
      setEnrolledStudents(enr);
    }
    fetchStatus();

    // Poll live attendance records every 2 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [classId, fetchStatus]);

  // Optional dynamic QR rotation every 15s to prevent screenshot sharing
  useEffect(() => {
    if (!activeSession || !autoRefreshQR) return;

    const refreshTimer = setInterval(async () => {
      try {
        const res = await fetch('/api/session/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: activeSession.id, classId }),
        });
        const data = await res.json();
        if (data.success && data.session) {
          setActiveSession(data.session);
        }
      } catch (e) {
        console.error('Auto QR refresh error:', e);
      }
    }, 15000);

    return () => clearInterval(refreshTimer);
  }, [activeSession, autoRefreshQR, classId]);

  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          durationMinutes,
          allowLate,
          lateThresholdMinutes,
          refreshInterval: 15,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setActiveSession(data.session);
        fetchStatus();
      }
    } catch (err) {
      console.error('Failed to start attendance session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    if (!confirm('Are you sure you want to end this attendance session early? Students will no longer be able to mark.')) return;

    try {
      await fetch('/api/session/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.id }),
      });
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideStudentId || !user) return;

    const sessionId = activeSession?.id || `manual-session-${classId}`;

    await fetch('/api/attendance/override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        studentId: overrideStudentId,
        status: overrideStatus,
        facultyId: user.id,
      }),
    });

    fetchStatus();
    setShowOverrideModal(false);
    setOverrideStudentId(null);
  };

  if (!classItem) {
    return <div className="p-8 text-center text-xs text-gray-500">Class session not found.</div>;
  }

  const attendanceCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
  const totalEnrolled = enrolledStudents.length || 10;
  const attendanceRate = Math.round((attendanceCount / totalEnrolled) * 100);

  return (
    <div className={`space-y-6 ${isProjectorMode ? 'max-w-5xl mx-auto' : ''}`}>
      {/* Top navigation & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/faculty"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1e3a8a] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Faculty Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {classItem.course_code}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {classItem.course_name}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {classItem.section_name} • Room: <strong>{classItem.room}</strong> • Time: <strong>{classItem.start_time} - {classItem.end_time}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProjectorMode(!isProjectorMode)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {isProjectorMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isProjectorMode ? 'Exit Projection' : 'Projector View'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left QR & Code / Right Live Student Attendance */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Session Engine (QR + 6-digit pin + Countdown) */}
        <div className="lg:col-span-5 space-y-4">
          {activeSession ? (
            <div className="bg-white rounded-2xl border-2 border-[#1e3a8a]/20 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#92d40e]/20 text-[#497000] border border-[#92d40e]/40">
                  <span className="w-2 h-2 rounded-full bg-[#92d40e] animate-ping" />
                  Live Attendance Window
                </span>
                
                <button
                  onClick={handleCloseSession}
                  className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Close Early</span>
                </button>
              </div>

              {/* Countdown Timer Component */}
              <CountdownTimer
                expiresAt={activeSession.expires_at}
                onExpire={() => {
                  fetchStatus();
                }}
              />

              {/* QR Code + 6-Digit Display */}
              <QRGenerator
                value={activeSession.session_token}
                numericCode={activeSession.numeric_code}
                size={isProjectorMode ? 320 : 250}
                isAutoRefreshActive={autoRefreshQR}
                onRefresh={async () => {
                  const res = await fetch('/api/session/refresh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: activeSession.id, classId }),
                  });
                  const data = await res.json();
                  if (data.success) setActiveSession(data.session);
                }}
              />

              {/* Anti-screenshot auto refresh toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-gray-700">Anti-Screenshot Dynamic QR</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoRefreshQR}
                  onChange={(e) => setAutoRefreshQR(e.target.checked)}
                  className="rounded text-[#1e3a8a] focus:ring-0"
                />
              </div>
            </div>
          ) : (
            /* Configure & Start Attendance Card */
            <div className="bg-white rounded-2xl border border-[var(--border-grey)] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-50 text-[#1e3a8a]">
                  <Play className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Start Attendance</h3>
                  <p className="text-xs text-gray-500">Generate time-bound QR code and 6-digit PIN</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Validity Window (Countdown Duration)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 5, 10, 15].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDurationMinutes(mins)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          durationMinutes === mins
                            ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Allow Late Submissions
                    </label>
                    <select
                      value={allowLate ? 'yes' : 'no'}
                      onChange={(e) => setAllowLate(e.target.value === 'yes')}
                      className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                    >
                      <option value="yes">Yes (Mark Late)</option>
                      <option value="no">Strict (No Late)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Late Threshold (mins)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={lateThresholdMinutes}
                      onChange={(e) => setLateThresholdMinutes(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                    />
                  </div>
                </div>

                <button
                  onClick={handleStartSession}
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#92d40e] text-black font-extrabold text-sm hover:bg-[#85c20c] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-black" />
                  <span>Generate QR &amp; Start Session</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Live Attendee Roster & Manual Override */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-[var(--border-grey)] overflow-hidden shadow-xs">
            {/* Header with stats */}
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Live Attendance Feed
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time synchronization of enrolled students marking in.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700">
                  Present: <strong className="text-[#1e3a8a]">{attendanceCount}</strong> / {totalEnrolled} ({attendanceRate}%)
                </div>
                <button
                  onClick={() => setShowOverrideModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#1e3a8a] hover:bg-blue-100 text-xs font-bold transition-colors flex items-center gap-1.5 border border-blue-200"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Manual Override</span>
                </button>
              </div>
            </div>

            {/* Attendance List */}
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {enrolledStudents.map((enr) => {
                const record = records.find(r => r.student_id === enr.student_id);
                return (
                  <div key={enr.student_id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        record?.status === 'present' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : record?.status === 'late'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {enr.student_name ? enr.student_name[0] : 'S'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">
                          {enr.student_name}
                        </p>
                        <p className="text-[10px] font-mono text-gray-500">
                          {enr.student_usn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {record ? (
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            record.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : record.status === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}>
                            <CheckCircle className="w-3 h-3" />
                            {record.status}
                          </span>
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                            {new Date(record.marked_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                          Not Marked
                        </span>
                      )}

                      <button
                        onClick={() => {
                          setOverrideStudentId(enr.student_id);
                          setOverrideStatus(record?.status || 'present');
                          setShowOverrideModal(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-[#1e3a8a] rounded hover:bg-gray-100 transition-colors"
                        title="Override individual status"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Manual Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Manual Attendance Override
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Faculty administrative bypass for students with device or network issues.
            </p>

            <form onSubmit={handleManualOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Student
                </label>
                <select
                  value={overrideStudentId || ''}
                  onChange={(e) => setOverrideStudentId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                  required
                >
                  <option value="">-- Choose student --</option>
                  {enrolledStudents.map((enr) => (
                    <option key={enr.student_id} value={enr.student_id}>
                      {enr.student_name} ({enr.student_usn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Attendance Status
                </label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value as 'present' | 'late' | 'absent' | 'excused')}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                >
                  <option value="present">Present (Full Credit)</option>
                  <option value="late">Late Submission</option>
                  <option value="excused">Excused (Medical / Official Duty)</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!overrideStudentId}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1e3a8a] hover:bg-blue-900 rounded-lg shadow-xs disabled:opacity-50"
                >
                  Confirm Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
