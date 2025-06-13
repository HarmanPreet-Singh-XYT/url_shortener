'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/auth-service';
import { UserInfoReq } from '@/lib/types';

interface AuthContextType {
  user: UserInfoReq | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (type: 'name' | 'email' | 'password', value: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfoReq | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeAuth = async () => {
    if (authService.isAuthenticated()) {
      try {
        const userProfile = await authService.getProfile();
        setUser(userProfile);
      } catch (error) {
        console.error('Failed to get user profile:', error);
        await authService.logout();
      }
    }
    setIsLoading(false);
  };
  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authService.register(name, email, password);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (type: 'name' | 'email' | 'password', value: string) => {
    await authService.updateProfile(type, value);
    if (type !== 'password') {
      // Refresh profile to get updated data
      await refreshProfile();
    }
  };

  const refreshProfile = async () => {
    if (authService.isAuthenticated()) {
      try {
        const userProfile = await authService.getProfile();
        setUser(userProfile);
      } catch (error) {
        console.error('Failed to refresh profile:', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}