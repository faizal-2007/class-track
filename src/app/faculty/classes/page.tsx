'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { ClassSession, Section, Course } from '@/types';
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  MapPin, 
  Calendar, 
  Repeat, 
  BookOpen,
  QrCode
} from 'lucide-react';

export default function FacultyClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [sectionId, setSectionId] = useState('');
  const [room, setRoom] = useState('LH-302');
  const [classDate, setClassDate] = useState('2024-11-25');
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('10:30');
  const [isRecurring, setIsRecurring] = useState(true);
  const [topic, setTopic] = useState('');

  useEffect(() => {
    setClassDate(new Date().toISOString().split('T')[0]);
    if (user) {
      setClasses(db.getClasses(user.id));
      const allSections = db.getSections();
      setSections(allSections);
      if (allSections.length > 0) setSectionId(allSections[0].id);
    }
  }, [user]);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sectionId) return;

    db.addClass({
      section_id: sectionId,
      faculty_id: user.id,
      room,
      class_date: classDate,
      start_time: startTime,
      end_time: endTime,
      is_recurring: isRecurring,
      day_of_week: new Date(classDate).getDay(),
      topic,
    });

    setClasses(db.getClasses(user.id));
    setShowAddModal(false);
    setTopic('');
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
            Class &amp; Timetable Management
          </h1>
          <p className="text-xs text-gray-500">
            Configure weekly recurring class schedules, room allocations, and syllabus topics.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e3a8a] text-white text-xs font-bold hover:bg-blue-900 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Class</span>
        </button>
      </div>

      {/* Class list */}
      <div className="bg-white rounded-xl border border-[var(--border-grey)] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
            Assigned Teaching Schedule ({classes.length} Lectures)
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {classes.map((cls) => (
            <div key={cls.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {cls.course_code}
                  </span>
                  <span className="text-xs font-bold text-gray-900">{cls.course_name}</span>
                  {cls.is_recurring && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      <Repeat className="w-2.5 h-2.5" /> Weekly Recurring
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 font-medium">
                  {cls.section_name} • Topic: <em>{cls.topic || 'General Lecture Session'}</em>
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                  <span className="flex items-center gap-1 font-mono font-medium">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {cls.start_time} - {cls.end_time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {cls.room}
                  </span>
                  {cls.day_of_week !== undefined && (
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      Every {dayNames[cls.day_of_week]}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <Link
                  href={`/faculty/classes/${cls.id}/session`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#92d40e] text-black font-bold text-xs hover:bg-[#85c20c] transition-colors shadow-xs"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Start Attendance</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Schedule New Class Session
            </h3>

            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Section &amp; Course
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300 focus:outline-hidden focus:border-[#1e3a8a]"
                >
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.course_code} - {sec.course_name} ({sec.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lecture Topic / Unit
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus & Cloud Storage"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300 focus:outline-hidden focus:border-[#1e3a8a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Session Date
                  </label>
                  <input
                    type="date"
                    required
                    value={classDate}
                    onChange={(e) => setClassDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded text-[#1e3a8a]"
                />
                <label htmlFor="recurringCheck" className="text-xs text-gray-700 font-medium">
                  Repeat weekly on this day for the semester
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1e3a8a] hover:bg-blue-900 rounded-lg shadow-xs"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
