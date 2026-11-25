'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '@/types';
import { db } from '@/lib/db';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  switchRoleQuick: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'classtrack_current_user_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check saved session
    const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUserId) {
      const found = db.getProfileById(savedUserId);
      if (found) {
        setUser(found);
      } else {
        const defaultStudent = db.getProfiles().find(p => p.role === 'student');
        if (defaultStudent) setUser(defaultStudent);
      }
    } else {
      const defaultStudent = db.getProfiles().find(p => p.role === 'student');
      if (defaultStudent) {
        setUser(defaultStudent);
        localStorage.setItem(CURRENT_USER_KEY, defaultStudent.id);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string) => {
    const profile = db.getProfileByEmail(email);
    if (profile) {
      setUser(profile);
      localStorage.setItem(CURRENT_USER_KEY, profile.id);
      if (profile.role === 'admin') router.push('/admin');
      else if (profile.role === 'faculty') router.push('/faculty');
      else router.push('/student');
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    router.push('/login');
  };

  const switchRoleQuick = (targetRole: UserRole) => {
    const sample = db.getProfiles().find(p => p.role === targetRole);
    if (sample) {
      setUser(sample);
      localStorage.setItem(CURRENT_USER_KEY, sample.id);
      if (targetRole === 'admin') router.push('/admin');
      else if (targetRole === 'faculty') router.push('/faculty');
      else router.push('/student');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        login,
        logout,
        switchRoleQuick,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
