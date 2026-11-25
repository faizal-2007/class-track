'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, CameraOff, AlertCircle, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const qrRegionId = 'html5qr-code-full-region';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setErrorMessage(null);
      const scanner = new Html5Qrcode(qrRegionId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      html5QrCodeRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scanner.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          onScanSuccess(decodedText);
          // Auto pause on detection
          scanner.stop().then(() => {
            setIsScanning(false);
          }).catch(console.error);
        },
        (error) => {
          if (onScanError) onScanError(error);
        }
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err: unknown) {
      console.error('Camera start error:', err);
      setHasPermission(false);
      setErrorMessage(
        'Unable to access camera. Please allow camera permissions or enter the 6-digit session code below.'
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop camera:', err);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        id={qrRegionId} 
        className="w-full max-w-sm aspect-square bg-slate-900 rounded-2xl overflow-hidden relative border-2 border-dashed border-gray-300 flex items-center justify-center"
      >
        {!isScanning && (
          <div className="text-center p-6 text-white flex flex-col items-center">
            <Camera className="w-12 h-12 text-[#92d40e] mb-3 opacity-90 animate-pulse" />
            <p className="text-sm font-semibold">Camera Scanner</p>
            <p className="text-xs text-gray-300 mt-1 max-w-[220px]">
              Point your camera at the attendance QR code displayed by faculty.
            </p>
            <button
              onClick={startScanner}
              className="mt-4 px-5 py-2.5 rounded-lg bg-[#92d40e] text-black font-bold text-xs hover:bg-[#82c00c] transition-all shadow-md flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Start Camera Scanner</span>
            </button>
          </div>
        )}
      </div>

      {isScanning && (
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={stopScanner}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold transition-colors"
          >
            <CameraOff className="w-4 h-4" />
            <span>Stop Camera</span>
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 max-w-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
