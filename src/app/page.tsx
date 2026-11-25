'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function HomePage() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else {
        router.push(`/${role}`);
      }
    }
  }, [user, role, isLoading, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="relative w-48 h-20 mb-6">
        <Image
          src="/logo.png"
          alt="Yenepoya School of Engineering & Technology"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="w-8 h-8 border-3 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">
        Loading Class Track Portal...
      </p>
    </div>
  );
}
