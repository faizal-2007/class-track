'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import QRScanner from '@/components/QRScanner';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  KeyRound, 
  Clock, 
  Smartphone,
  ShieldCheck
} from 'lucide-react';

export default function StudentScanPage() {
  const { user } = useAuth();
  const [manualCode, setManualCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    title: string;
    description: string;
    details?: {
      time: string;
      status: string;
      method: string;
    };
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#92d40e', '#1e3a8a', '#1b9aaa', '#ffd700'],
      });
    } catch (e) {
      // ignore
    }
  };

  const submitAttendanceTokenOrCode = async (tokenOrCode: string) => {
    if (!user) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenOrCode: tokenOrCode.trim(),
          studentId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatusMessage({
          type: 'error',
          title: 'Attendance Failed',
          description: data.error || 'Invalid attendance token or expired session.',
        });
      } else {
        triggerCelebration();
        setStatusMessage({
          type: 'success',
          title: 'Attendance Recorded!',
          description: data.message || 'Successfully marked attendance.',
          details: {
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: data.record?.status?.toUpperCase() || 'PRESENT',
            method: data.record?.verification_method === 'qr_scan' ? 'Dynamic QR Scan' : '6-Digit Fallback Code',
          },
        });
        setManualCode('');
      }
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        title: 'Connection Error',
        description: 'Failed to communicate with attendance server. Please retry.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim().length < 6) return;
    submitAttendanceTokenOrCode(manualCode.trim());
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/student"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#1e3a8a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Dashboard</span>
        </Link>
        <span className="text-[11px] font-mono text-gray-400">
          Student ID: {user?.usn_faculty_id}
        </span>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-[var(--border-grey)] p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-[#1e3a8a] mb-2">
            <Smartphone className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            Mark Class Attendance
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Scan the live faculty QR code or enter the 6-digit session pin below.
          </p>
        </div>

        {/* Success or Error Alert */}
        {statusMessage && (
          <div className={`p-4 rounded-xl mb-6 border ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-start gap-3">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="text-xs font-bold">{statusMessage.title}</h4>
                <p className="text-xs mt-0.5 opacity-90">{statusMessage.description}</p>
                {statusMessage.details && (
                  <div className="mt-2 pt-2 border-t border-emerald-200/60 grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <span className="text-gray-500 block">Status:</span>
                      <strong className="text-emerald-800">{statusMessage.details.status}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Timestamp:</span>
                      <strong className="font-mono">{statusMessage.details.time}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Method:</span>
                      <strong>{statusMessage.details.method}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 1. Camera QR Scanner */}
        <div className="mb-6">
          <QRScanner
            onScanSuccess={(decodedText) => {
              submitAttendanceTokenOrCode(decodedText);
            }}
          />
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center my-4">
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink mx-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            OR Fallback Code
          </span>
          <div className="grow border-t border-gray-200"></div>
        </div>

        {/* 2. Fallback 6-digit code entry */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Enter 6-Digit Faculty Code
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 849201"
                className="w-full text-center tracking-widest font-mono text-2xl font-black py-2.5 px-4 rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
              />
              <KeyRound className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={manualCode.length !== 6 || isSubmitting}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              manualCode.length === 6 && !isSubmitting
                ? 'bg-[#1e3a8a] text-white hover:bg-blue-900 shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Mark Present</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-[10px] text-gray-400 leading-normal">
          <p>
            Attendance is cryptographically timestamped and bound to section enrollments. Proxy attendance attempts are flagged to course faculty.
          </p>
        </div>
      </div>
    </div>
  );
}
