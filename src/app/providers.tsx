'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export function Providers({ children }: { children: React.ReactNode }) {
  const [year, setYear] = useState<number>(2025);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AuthProvider>
        <Suspense fallback={<div className="h-16 bg-[#1e3a8a]" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Loading...</div>}>
            {children}
          </Suspense>
        </main>
        <footer className="border-t border-[var(--border-grey)] bg-white py-6 text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p>© {year} Yenepoya School of Engineering & Technology. All rights reserved.</p>
            <p className="text-[11px] text-gray-400">Class Track v2.0 • Smart Attendance Platform</p>
          </div>
        </footer>
      </AuthProvider>
    </Suspense>
  );
}
