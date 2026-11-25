'use client';

import React from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';

interface LowAttendanceAlertProps {
  percentage: number;
  threshold?: number;
  subjectName?: string;
}

export default function LowAttendanceAlert({
  percentage,
  threshold = 75,
  subjectName,
}: LowAttendanceAlertProps) {
  if (percentage >= threshold) return null;

  return (
    <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
      <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-amber-900">
            Attendance Warning: Below {threshold}% Mandate
          </h4>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200">
            {percentage}% Current
          </span>
        </div>
        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
          {subjectName ? (
            <>Your attendance in <strong>{subjectName}</strong> is {percentage}%, which is below the Yenepoya 75% university eligibility requirement.</>
          ) : (
            <>Your cumulative attendance across enrolled subjects is currently {percentage}%. University regulations require a minimum of 75% attendance to be eligible for Semester End Theory & Practical Examinations.</>
          )}
        </p>
      </div>
    </div>
  );
}
