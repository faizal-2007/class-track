'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Shield, GraduationCap, School, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email);
    if (!success) {
      setError('Email not found in Yenepoya database. Use one of the demo quick logins below.');
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    login(demoEmail);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 bg-white border border-[var(--border-grey)] rounded-2xl shadow-sm p-6 sm:p-10">
        
        {/* Left column: Branding & Institutional context */}
        <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
          <div>
            <div className="relative h-16 w-52 mb-6">
              <Image
                src="/logo.png"
                alt="Yenepoya School of Engineering & Technology"
                fill
                sizes="208px"
                className="object-contain object-left"
                priority
              />
            </div>
            
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#92d40e]/15 text-[#4e7900] border border-[#92d40e]/30 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Official Attendance Portal
            </span>

            <h1 className="text-2xl font-black text-[#1e3a8a] tracking-tight">
              Class Track
            </h1>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Secure QR-code and time-bound dynamic token attendance management system for students and faculty of Yenepoya School of Engineering & Technology.
            </p>

            <div className="mt-6 space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#92d40e]"></span>
                <span>Anti-screenshot dynamic QR code rotation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1b9aaa]"></span>
                <span>Server-enforced validity countdown window</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a8a]"></span>
                <span>Automated 75% university eligibility warning</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
            Yenepoya (Deemed to be University) • Mangaluru, Karnataka
          </div>
        </div>

        {/* Right column: Login form & Quick Demo logins */}
        <div className="flex flex-col justify-center">
          <h2 className="text-base font-bold text-gray-900">Sign in to your account</h2>
          <p className="text-xs text-gray-500 mb-5">Enter your institutional email ID to continue.</p>

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. mohammed.faizan@yenepoya.edu.in"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[var(--border-grey)] focus:outline-hidden focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-md border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-[#1e3a8a] text-white text-xs font-bold hover:bg-blue-900 transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>Sign In with Email</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-8">
            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-gray-200"></div>
              <span className="shrink mx-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                1-Click Demo Login
              </span>
              <div className="grow border-t border-gray-200"></div>
            </div>

            <div className="grid grid-cols-1 gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@yenepoya.edu.in')}
                className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-left transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-purple-100 text-purple-700">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Administrator</p>
                    <p className="text-[10px] text-gray-500">Dr. Gangadhara Rao (Principal)</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-purple-700 group-hover:translate-x-0.5 transition-transform">
                  Enter &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('dr.kavitha@yenepoya.edu.in')}
                className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-left transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-blue-100 text-blue-700">
                    <School className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Faculty (CSE)</p>
                    <p className="text-[10px] text-gray-500">Dr. Kavitha Mahesh</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-blue-700 group-hover:translate-x-0.5 transition-transform">
                  Enter &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('mohammed.faizan@yenepoya.edu.in')}
                className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Student</p>
                    <p className="text-[10px] text-gray-500">Mohammed Faizan (4YE21CS045)</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                  Enter &rarr;
                </span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
