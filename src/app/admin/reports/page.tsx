'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { AttendanceRecord, Profile } from '@/types';
import jsPDF from 'jspdf';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  Building2,
  Calendar
} from 'lucide-react';

export default function AdminReportsPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);

  useEffect(() => {
    setRecords(db.getAllRecords());
    setStudents(db.getProfiles().filter(p => p.role === 'student'));
  }, []);

  const handleExportCSV = () => {
    window.open('/api/reports/export?format=csv', '_blank');
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    // Institutional Header
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138); // brand navy
    doc.text('Yenepoya School of Engineering & Technology', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Official Class Attendance & Compliance Audit Report', 14, 27);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 33);

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 38, 196, 38);

    // Summary statistics
    doc.setFontSize(12);
    doc.setTextColor(31, 31, 31);
    doc.text('Institutional Student Attendance Roster', 14, 48);

    let yPos = 58;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Name', 14, yPos);
    doc.text('USN', 80, yPos);
    doc.text('Attended', 130, yPos);
    doc.text('Attendance %', 155, yPos);
    doc.text('Status', 180, yPos);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos + 2, 196, yPos + 2);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    students.forEach((stu) => {
      const stats = db.getStudentStats(stu.id);
      doc.text(stu.full_name, 14, yPos);
      doc.text(stu.usn_faculty_id || 'N/A', 80, yPos);
      doc.text(`${stats.attended} / ${stats.totalClasses}`, 130, yPos);
      doc.text(`${stats.percentage}%`, 155, yPos);
      doc.text(stats.percentage >= 75 ? 'ELIGIBLE' : 'SHORTAGE', 180, yPos);

      yPos += 7;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    // Save PDF
    doc.save(`yenepoya-attendance-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const eligibleCount = students.filter(s => db.getStudentStats(s.id).percentage >= 75).length;
  const shortageCount = students.length - eligibleCount;

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
            Institution-Wide Attendance Reports
          </h1>
          <p className="text-xs text-gray-500">
            Comprehensive audit reports, university eligibility compliance, and export tools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleGeneratePDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-xs font-bold hover:bg-blue-900 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Compliance Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-[var(--border-grey)] shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Exam Eligibility Ratio</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">
              {students.length > 0 ? Math.round((eligibleCount / students.length) * 100) : 100}%
            </span>
            <span className="text-xs text-gray-500">({eligibleCount} / {students.length} students)</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">&ge; 75% attendance threshold</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[var(--border-grey)] shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Attendance Shortage Flags</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-600">
              {shortageCount}
            </span>
            <span className="text-xs text-gray-500">at risk of detainment</span>
          </div>
          <p className="text-[11px] text-red-500 mt-2 font-medium">Notifications queued for parents/mentors</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[var(--border-grey)] shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Recorded Logs</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#1e3a8a]">
              {records.length}
            </span>
            <span className="text-xs text-gray-500">verified entries</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">QR scans, codes, and overrides</p>
        </div>
      </div>

      {/* Institution Roster Table */}
      <div className="bg-white rounded-xl border border-[var(--border-grey)] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#1e3a8a]" />
            Master Student Attendance Register
          </h3>
          <span className="text-[11px] font-medium text-gray-500">
            Yenepoya School of Engineering &amp; Technology
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">USN</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Classes Attended</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4">Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((stu) => {
                const stats = db.getStudentStats(stu.id);
                return (
                  <tr key={stu.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#1e3a8a]">
                      {stu.usn_faculty_id}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {stu.full_name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {stu.department_name || 'CSE'}
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
                          <AlertCircle className="w-3 h-3" /> Shortage
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
