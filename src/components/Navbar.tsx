'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { 
  LogOut, 
  User, 
  Calendar, 
  Clock, 
  QrCode, 
  BarChart3, 
  ShieldCheck, 
  BookOpen, 
  Users,
  RefreshCw
} from 'lucide-react';

export default function Navbar() {
  const { user, role, logout, switchRoleQuick } = useAuth();
  const pathname = usePathname();

  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        { label: 'Overview', href: '/admin', icon: ShieldCheck },
        { label: 'Faculty', href: '/admin/faculty', icon: Users },
        { label: 'Students', href: '/admin/students', icon: BookOpen },
        { label: 'Departments', href: '/admin/departments', icon: Calendar },
        { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
      ];
    }
    if (role === 'faculty') {
      return [
        { label: 'Classes', href: '/faculty', icon: Clock },
        { label: 'Calendar', href: '/faculty/calendar', icon: Calendar },
        { label: 'Reports', href: '/faculty/reports', icon: BarChart3 },
      ];
    }
    if (role === 'student') {
      return [
        { label: 'Dashboard', href: '/student', icon: Clock },
        { label: 'Scan QR', href: '/student/scan', icon: QrCode },
        { label: 'History', href: '/student/history', icon: BarChart3 },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-white)] border-b border-[var(--border-grey)] shadow-xs">
      {/* Top institutional strip */}
      <div className="bg-[#1e3a8a] text-white text-[11px] px-4 py-1.5 flex justify-between items-center tracking-wide font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#92d40e] animate-pulse"></span>
          <span>Yenepoya School of Engineering & Technology — Academic Attendance Portal</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="opacity-90">Demo Role Switcher:</span>
          <button 
            onClick={() => switchRoleQuick('admin')}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${role === 'admin' ? 'bg-[#92d40e] text-black font-bold' : 'bg-white/10 hover:bg-white/20'}`}
          >
            Admin
          </button>
          <button 
            onClick={() => switchRoleQuick('faculty')}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${role === 'faculty' ? 'bg-[#92d40e] text-black font-bold' : 'bg-white/10 hover:bg-white/20'}`}
          >
            Faculty
          </button>
          <button 
            onClick={() => switchRoleQuick('student')}
            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${role === 'student' ? 'bg-[#92d40e] text-black font-bold' : 'bg-white/10 hover:bg-white/20'}`}
          >
            Student
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & App Name */}
          <Link href={role ? `/${role}` : '/login'} className="flex items-center gap-3 group">
            <div className="relative h-12 w-32 sm:w-44 flex items-center">
              <Image
                src="/logo.png"
                alt="Yenepoya School of Engineering & Technology"
                fill
                sizes="(max-width: 640px) 120px, 176px"
                className="object-contain object-left"
                priority
              />
            </div>
            <div className="hidden md:block pl-3 border-l border-[var(--border-grey)]">
              <span className="font-extrabold text-base tracking-tight text-[var(--brand-navy)] flex items-center gap-1.5">
                Class Track
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-[#92d40e]/20 text-[#558000] border border-[#92d40e]/40">
                  Live
                </span>
              </span>
              <p className="text-[10px] text-gray-500 font-medium">Smart QR Attendance System</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#1e3a8a] text-white shadow-xs'
                        : 'text-gray-700 hover:text-[#1e3a8a] hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User profile & logout */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[var(--text-dark)] leading-tight">{user.full_name}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-gray-500 uppercase">{user.usn_faculty_id}</span>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : user.role === 'faculty' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-md border border-[var(--border-grey)] text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-md bg-[var(--brand-navy)] text-white text-xs font-semibold hover:bg-blue-900 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile navigation bottom bar for responsive student/faculty use */}
      {user && (
        <div className="md:hidden border-t border-[var(--border-grey)] bg-white px-2 py-1.5 flex justify-around">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 px-2 rounded-md text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#1e3a8a] font-bold' : 'text-gray-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#1e3a8a]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
