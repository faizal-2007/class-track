'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { AcademicCalendarItem, CalendarEventType } from '@/types';
import { 
  ArrowLeft, 
  Plus, 
  Calendar as CalendarIcon, 
  Trash2, 
  AlertCircle,
  Tag
} from 'lucide-react';

export default function AcademicCalendarPage() {
  const [calendarItems, setCalendarItems] = useState<AcademicCalendarItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarEventType>('event');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    setCalendarItems(db.getCalendar());
  }, []);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newStartDate) return;

    const added = db.addCalendarEvent({
      title: newTitle,
      type: newType,
      start_date: newStartDate,
      end_date: newEndDate || newStartDate,
      description: newDesc,
    });

    setCalendarItems(db.getCalendar());
    setShowAddModal(false);
    setNewTitle('');
    setNewStartDate('');
    setNewEndDate('');
    setNewDesc('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this academic calendar entry?')) {
      db.deleteCalendarEvent(id);
      setCalendarItems(db.getCalendar());
    }
  };

  const getTypeStyle = (type: CalendarEventType) => {
    switch (type) {
      case 'holiday':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'exam':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'semester_boundary':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'event':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

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
            Academic Calendar &amp; Schedule
          </h1>
          <p className="text-xs text-gray-500">
            Institutional term schedule, examinations, holidays, and symposium dates.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e3a8a] text-white text-xs font-bold hover:bg-blue-900 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Calendar Entry</span>
        </button>
      </div>

      {/* Calendar List View */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calendarItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-[var(--border-grey)] p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${getTypeStyle(item.type)}`}>
                  {item.type.replace('_', ' ')}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Remove event"
                  className="text-gray-300 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-gray-900 mt-2.5">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1.5 font-medium">
                <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                {item.start_date === item.end_date ? (
                  item.start_date
                ) : (
                  `${item.start_date} to ${item.end_date}`
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Add Academic Calendar Entry
            </h3>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Lab Exams"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300 focus:outline-hidden focus:border-[#1e3a8a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as CalendarEventType)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300 focus:outline-hidden focus:border-[#1e3a8a]"
                >
                  <option value="holiday">Holiday</option>
                  <option value="exam">Examination</option>
                  <option value="event">Institutional Event / Symposium</option>
                  <option value="semester_boundary">Semester Boundary (Start/End)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional guidelines or notification..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300 focus:outline-hidden focus:border-[#1e3a8a]"
                />
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
