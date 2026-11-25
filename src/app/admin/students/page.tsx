'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Profile, Department, Section } from '@/types';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  Search, 
  GraduationCap, 
  Filter, 
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importSummary, setImportSummary] = useState<string | null>(null);

  useEffect(() => {
    setStudents(db.getProfiles().filter(p => p.role === 'student'));
    setDepartments(db.getDepartments());
    setSections(db.getSections());
  }, []);

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    const parsedStudents: Array<{
      full_name: string;
      email: string;
      usn_faculty_id: string;
      department_id: string;
      phone?: string;
      section_id?: string;
    }> = [];

    const defaultDept = departments[0]?.id || 'dept-cse';
    const defaultSection = sections[0]?.id;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || (i === 0 && line.toLowerCase().includes('usn'))) continue; // skip header
      const parts = line.split(',').map(p => p.replace(/"/g, '').trim());
      if (parts.length >= 3) {
        parsedStudents.push({
          full_name: parts[0],
          usn_faculty_id: parts[1],
          email: parts[2],
          phone: parts[3] || '',
          department_id: defaultDept,
          section_id: defaultSection,
        });
      }
    }

    const added = db.bulkAddStudents(parsedStudents);
    setStudents(db.getProfiles().filter(p => p.role === 'student'));
    setImportSummary(`Successfully imported and enrolled ${added.length} students into database.`);
    setCsvText('');
  };

  const sampleCsvTemplate = `Full Name,USN,Email,Phone
Zaid Ahmed,4YE21CS099,zaid.ahmed@yenepoya.edu.in,+91 9845011111
Mariam Khan,4YE21CS100,mariam.khan@yenepoya.edu.in,+91 9845022222
Tanvi Shetty,4YE21CS101,tanvi.shetty@yenepoya.edu.in,+91 9845033333`;

  const downloadSampleTemplate = () => {
    const blob = new Blob([sampleCsvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students-import-sample.csv';
    a.click();
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.usn_faculty_id && s.usn_faculty_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || s.department_id === selectedDept;
    return matchesSearch && matchesDept;
  });

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
            Student Roster &amp; Cohort Enrollment
          </h1>
          <p className="text-xs text-gray-500">
            Manage student registrations, USN mappings, and bulk import cohorts via CSV.
          </p>
        </div>

        <button
          onClick={() => {
            setShowImportModal(true);
            setImportSummary(null);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#92d40e] text-black font-extrabold text-xs hover:bg-[#85c20c] transition-all shadow-md"
        >
          <Upload className="w-4 h-4" />
          <span>Bulk Import via CSV</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-xl border border-[var(--border-grey)] flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student by USN, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-[#1e3a8a]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-gray-500">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-hidden"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-[var(--border-grey)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">USN</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Institutional Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Enrolled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#1e3a8a]">
                    {s.usn_faculty_id}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {s.full_name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {s.email}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1e3a8a] text-[10px] font-bold">
                      {s.department_name || 'CSE'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                    {s.phone || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-[11px]">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-gray-900">
                Bulk Import Students via CSV
              </h3>
              <button
                onClick={downloadSampleTemplate}
                className="text-xs font-semibold text-[#1e3a8a] hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample Template</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Paste comma-separated student rows (Full Name, USN, Email, Phone) or upload a CSV file.
            </p>

            {importSummary && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{importSummary}</span>
              </div>
            )}

            <form onSubmit={handleBulkImport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  CSV Data Rows
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={`Zaid Ahmed, 4YE21CS099, zaid.ahmed@yenepoya.edu.in, +91 9845011111\nMariam Khan, 4YE21CS100, mariam.khan@yenepoya.edu.in, +91 9845022222`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full text-xs font-mono p-3 border rounded-lg border-gray-300 focus:outline-hidden focus:border-[#1e3a8a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1e3a8a] hover:bg-blue-900 rounded-lg shadow-xs"
                >
                  Process &amp; Enroll Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
