import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  loginAsDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const stored = getStoredToken();
        if (stored) {
          const res = await api.getMe();
          setUser(res.user);
        } else {
          // Auto-load demo user on first visit to provide immediate working experience
          const res = await api.login({ email: 'manuelumbavumbi2@gmail.com', password: 'password123' });
          setStoredToken(res.token);
          setToken(res.token);
          setUser(res.user);
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
        // Fallback demo user
        setUser({
          id: 'usr_manuel_01',
          name: 'Manuel Umbavumbi',
          email: 'manuelumbavumbi2@gmail.com',
          phone: '+244 923 456 789',
          currency: 'Kz',
          createdAt: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.register({ name, email, password });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async () => {
    return login('manuelumbavumbi2@gmail.com', 'password123');
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
