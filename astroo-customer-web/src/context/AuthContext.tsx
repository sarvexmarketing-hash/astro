'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/types';
import { authService } from '../services/auth';
import { getToken, clearToken } from '../lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: { email?: string; phone?: string; password: string }) => Promise<void>;
  register: (data: { email?: string; phone?: string; password: string; fullName: string }) => Promise<void>;
  googleAuth: (idToken: string) => Promise<void>;
  firebaseAuth: (idToken: string) => Promise<void>;
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

  const googleAuth = async (idToken: string) => {
    await authService.googleAuth(idToken);
    await refreshUser();
  };

  const firebaseAuth = async (idToken: string) => {
    await authService.firebaseAuth(idToken);
    await refreshUser();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        googleAuth,
        firebaseAuth,
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
