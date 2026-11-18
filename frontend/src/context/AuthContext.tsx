'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/lib/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  quickLoginAs: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on load
  useEffect(() => {
    const storedToken = localStorage.getItem('ev_token');
    const storedUser = localStorage.getItem('ev_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('ev_token');
        localStorage.removeItem('ev_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await authApi.login({ email, password });
    setLoading(false);

    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('ev_token', res.token);
      localStorage.setItem('ev_user', JSON.stringify(res.user));
      return { success: true };
    }

    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  }) => {
    setLoading(true);
    const res = await authApi.register(data);
    setLoading(false);

    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('ev_token', res.token);
      localStorage.setItem('ev_user', JSON.stringify(res.user));
      return { success: true };
    }

    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ev_token');
    localStorage.removeItem('ev_user');
  };

  // Quick switch for demo testing (Admin, Operator, Driver)
  const quickLoginAs = async (role: UserRole) => {
    if (role === 'admin') {
      await login('admin@evcharge.com', 'AdminPassword123!');
    } else if (role === 'operator') {
      await login('operator@chargenet.com', 'OperatorPassword123!');
    } else {
      await login('driver@evcharge.com', 'DriverPassword123!');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
