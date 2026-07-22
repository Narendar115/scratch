import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const useAuth = () => {
  const { user, token, setAuth, logout, isAuthenticated } = useAuthStore();
  return { user, token, setAuth, logout, isAuthenticated: isAuthenticated() };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
