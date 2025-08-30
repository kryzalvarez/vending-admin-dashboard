'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  userRole: string | null;
  userName: string | null;
  isLoading: boolean;
  login: (token: string, role: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedRole = localStorage.getItem('userRole');
      const storedName = localStorage.getItem('userName');
      
      if (storedToken) {
        setToken(storedToken);
        setUserRole(storedRole);
        setUserName(storedName);
      }
    } catch (error) {
      console.error("No se pudo acceder a localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, role: string, name: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
    setToken(newToken);
    setUserRole(role);
    setUserName(name);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setToken(null);
    setUserRole(null);
    setUserName(null);
    router.push('/login');
  };

  const value = { token, userRole, userName, isLoading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}