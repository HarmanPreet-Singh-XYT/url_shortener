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

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Initializing auth...');
      
      if (authService.isAuthenticated()) {
        console.log('🔑 Token found, fetching profile...');
        try {
          const userProfile = await authService.getProfile();
          console.log('✅ Profile fetched successfully:', userProfile);
          setUser(userProfile);
        } catch (error) {
          console.error('❌ Failed to get user profile:', error);
          console.log('🧹 Clearing invalid tokens...');
          await authService.logout();
          setUser(null);
        }
      } else {
        console.log('🚫 No token found');
        setUser(null);
      }
      
      console.log('✅ Auth initialization complete');
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔐 Attempting login...');
    try {
      const response = await authService.login(email, password);
      console.log('✅ Login successful:', response.user);
      setUser(response.user);
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log('📝 Attempting registration...');
    try {
      const response = await authService.register(name, email, password);
      console.log('✅ Registration successful:', response.user);
      setUser(response.user);
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out...');
    try {
      await authService.logout();
      console.log('✅ Logout successful');
      setUser(null);
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear user state even if server logout fails
      setUser(null);
    }
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

  console.log('🔄 Auth state:', { user: !!user, isLoading });

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