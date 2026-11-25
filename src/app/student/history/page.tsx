'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { AttendanceRecord } from '@/types';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  QrCode, 
  KeyRound, 
  UserCheck,
  Search,
  Filter
} from 'lucide-react';

export default function StudentHistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      const studentRecords = db.getRecordsForStudent(user.id);
      setRecords(studentRecords);
    }
  }, [user]);

  const filteredRecords = records.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch = !searchQuery || 
      (r.verification_method && r.verification_method.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.status && r.status.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getMethodBadge = (method: string) => {
    if (method === 'qr_scan') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
          <QrCode className="w-3 h-3" /> QR Scan
        </span>
      );
    }
    if (method === 'numeric_code') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
          <KeyRound className="w-3 h-3" /> 6-Digit Code
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
        <UserCheck className="w-3 h-3" /> Faculty Override
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'present') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
          <CheckCircle className="w-3.5 h-3.5" /> Present
        </span>
      );
    }
    if (status === 'late') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800">
          <Clock className="w-3.5 h-3.5" /> Late
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-800">
        <AlertCircle className="w-3.5 h-3.5" /> Absent
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/student"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1e3a8a] transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <h1 className="text-2xl font-black text-[#1e3a8a] tracking-tight">
            Personal Attendance Log
          </h1>
          <p className="text-xs text-gray-500">
            Chronological record of verified class attendance entries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="text-gray-400">Total Entries:</span>
            <strong className="text-gray-900 font-mono">{records.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-xl border border-[var(--border-grey)] flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search method or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-[#1e3a8a]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-hidden focus:border-[#1e3a8a]"
          >
            <option value="all">All Records</option>
            <option value="present">Present Only</option>
            <option value="late">Late Only</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Records table */}
      <div className="bg-white rounded-xl border border-[var(--border-grey)] overflow-hidden shadow-xs">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No attendance entries matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verification Method</th>
                  <th className="py-3 px-4">Session Ref</th>
                  <th className="py-3 px-4">Network IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(r.marked_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {new Date(r.marked_at).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="py-3 px-4">
                      {getMethodBadge(r.verification_method)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                      {r.session_id.substring(0, 12)}...
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                      {r.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
