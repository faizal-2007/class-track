'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { RefreshCw, Download, Copy, Check } from 'lucide-react';

interface QRGeneratorProps {
  value: string;
  size?: number;
  numericCode?: string;
  onRefresh?: () => void;
  isAutoRefreshActive?: boolean;
}

export default function QRGenerator({
  value,
  size = 280,
  numericCode,
  onRefresh,
  isAutoRefreshActive = false,
}: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#1e3a8a', // Brand navy for the QR modules
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (error) => {
        if (error) console.error('Error generating QR Code:', error);
      }
    );
  }, [value, size]);

  const copyCode = () => {
    if (numericCode) {
      navigator.clipboard.writeText(numericCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-qr-${numericCode || 'code'}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border-2 border-[var(--border-grey)] shadow-sm">
      <div className="relative p-3 bg-white rounded-xl shadow-xs border border-gray-100">
        <canvas ref={canvasRef} className="rounded-lg max-w-full" />
        {isAutoRefreshActive && (
          <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        )}
      </div>

      {numericCode && (
        <div className="mt-5 text-center w-full max-w-xs">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Student Fallback 6-Digit Code
          </p>
          <div className="mt-1 flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-lg py-2 px-4">
            <span className="font-mono text-3xl font-extrabold tracking-widest text-[#1e3a8a]">
              {numericCode}
            </span>
            <button
              onClick={copyCode}
              title="Copy 6-digit code"
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate QR</span>
          </button>
        )}
        <button
          onClick={downloadQR}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save PNG</span>
        </button>
      </div>
    </div>
  );
}
