'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Profile, Department } from '@/types';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  CheckCircle, 
  Search, 
  Mail, 
  Phone, 
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [deptId, setDeptId] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const profiles = db.getProfiles().filter(p => p.role === 'faculty');
    setFaculty(profiles);
    const depts = db.getDepartments();
    setDepartments(depts);
    if (depts.length > 0) setDeptId(depts[0].id);
  }, []);

  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !facultyId) return;

    const dept = departments.find(d => d.id === deptId);
    db.addProfile({
      full_name: fullName,
      email,
      role: 'faculty',
      usn_faculty_id: facultyId,
      department_id: deptId,
      department_name: dept?.name,
      phone,
    });

    setFaculty(db.getProfiles().filter(p => p.role === 'faculty'));
    setShowAddModal(false);
    setFullName('');
    setEmail('');
    setFacultyId('');
    setPhone('');
  };

  const filteredFaculty = faculty.filter(f => 
    f.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.usn_faculty_id && f.usn_faculty_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            Faculty Directory &amp; Access Control
          </h1>
          <p className="text-xs text-gray-500">
            Create, approve, and oversee teaching faculty across engineering disciplines.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e3a8a] text-white text-xs font-bold hover:bg-blue-900 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[var(--border-grey)] flex items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or faculty ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-[#1e3a8a]"
          />
        </div>
        <span className="text-xs text-gray-400 hidden sm:block">
          {filteredFaculty.length} faculty members listed
        </span>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFaculty.map((f) => (
          <div key={f.id} className="bg-white rounded-xl border border-[var(--border-grey)] p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-all">
            <div>
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {f.usn_faculty_id}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Approved
                </span>
              </div>

              <h3 className="text-sm font-bold text-gray-900 mt-2.5">
                {f.full_name}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {f.department_name || 'Engineering'}
              </p>

              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{f.email}</span>
                </div>
                {f.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{f.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>Added: {new Date(f.created_at).toLocaleDateString()}</span>
              <span className="text-emerald-600 font-bold">Active Role</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Faculty Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Add Faculty Member
            </h3>

            <form onSubmit={handleAddFaculty} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name (with Title)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kavitha Mahesh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300 focus:outline-hidden focus:border-[#1e3a8a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. dr.kavitha@yenepoya.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300 focus:outline-hidden focus:border-[#1e3a8a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Faculty Staff ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="YSET-FAC-042"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+91 98450 23456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-lg border-gray-300"
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
