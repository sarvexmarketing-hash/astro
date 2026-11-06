'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/types';
import { authService } from '../services/auth';
import { getToken, clearToken } from '../lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAstrologer: boolean;
  isVerifiedAstrologer: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'resubmit';
  login: (data: { email?: string; phone?: string; password: string }) => Promise<void>;
  register: (data: { email?: string; phone?: string; password: string; fullName: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const currentUser = await authService.me();
      if (currentUser && !['astrologer', 'admin', 'super_admin'].includes(currentUser.role)) {
        // Not an astrologer account
        clearToken();
        setUser(null);
        setIsLoading(false);
        return;
      }
      setUser(currentUser);
    } catch {
      setUser(null);
      clearToken();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: { email?: string; phone?: string; password: string }) => {
    await authService.login(data);
    await refreshUser();
  };

  const register = async (data: { email?: string; phone?: string; password: string; fullName: string }) => {
    await authService.register(data);
    await refreshUser();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const rawStatus = (user?.astrologerProfile?.verification_status || user?.verification_status || '').toLowerCase();
  const isApproved =
    user?.role === 'admin' ||
    user?.role === 'super_admin' ||
    rawStatus === 'approved' ||
    rawStatus === 'verified' ||
    Boolean(user?.is_verified) ||
    Boolean(user?.isVerified) ||
    Boolean(user?.astrologerProfile?.is_verified);

  const verificationStatus: 'pending' | 'approved' | 'rejected' | 'resubmit' =
    isApproved
      ? 'approved'
      : rawStatus === 'rejected'
      ? 'rejected'
      : rawStatus === 'resubmit'
      ? 'resubmit'
      : 'pending';

  const isAstrologer = Boolean(user && ['astrologer', 'admin', 'super_admin'].includes(user.role));
  const isVerifiedAstrologer = Boolean(user && isAstrologer && isApproved);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        isAstrologer,
        isVerifiedAstrologer,
        verificationStatus,
        login,
        register,
        logout,
        refreshUser,
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
