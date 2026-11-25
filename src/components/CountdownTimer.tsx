'use client';

import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string; // ISO string
  onExpire?: () => void;
}

export default function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const [totalDurationMs, setTotalDurationMs] = useState<number>(300000); // 5 min default

  useEffect(() => {
    const expiryTime = new Date(expiresAt).getTime();
    const initialRemaining = Math.max(0, expiryTime - Date.now());
    setTimeLeftMs(initialRemaining);
    setTotalDurationMs(initialRemaining > 0 ? initialRemaining : 300000);

    const interval = setInterval(() => {
      const remaining = Math.max(0, expiryTime - Date.now());
      setTimeLeftMs(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const totalSeconds = Math.floor(timeLeftMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isUrgent = totalSeconds <= 60;
  const isExpired = totalSeconds <= 0;

  // Percentage for ring
  const progressPct = totalDurationMs > 0 ? Math.min(100, Math.max(0, (timeLeftMs / totalDurationMs) * 100)) : 0;

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
      isExpired 
        ? 'bg-red-50 border-red-200 text-red-700' 
        : isUrgent 
        ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse' 
        : 'bg-blue-50 border-blue-200 text-[#1e3a8a]'
    }`}>
      {isExpired ? (
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
      ) : (
        <Clock className={`w-5 h-5 shrink-0 ${isUrgent ? 'text-amber-600' : 'text-[#1e3a8a]'}`} />
      )}

      <div>
        <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">
          {isExpired ? 'Session Expired' : 'Validity Countdown'}
        </p>
        <p className="text-xl font-mono font-black tracking-widest leading-none">
          {isExpired ? (
            '00:00'
          ) : (
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          )}
        </p>
      </div>

      <div className="ml-auto pl-2">
        <div className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">
          {isExpired ? '0%' : `${Math.round(progressPct)}%`}
        </div>
      </div>
    </div>
  );
}
