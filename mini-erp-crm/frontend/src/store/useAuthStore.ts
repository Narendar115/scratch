import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const SAVED_TOKEN = localStorage.getItem('erp_token');
const SAVED_USER = localStorage.getItem('erp_user');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: SAVED_USER ? JSON.parse(SAVED_USER) : null,
  token: SAVED_TOKEN || null,
  setAuth: (user, token) => {
    localStorage.setItem('erp_token', token);
    localStorage.setItem('erp_user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    set({ user: null, token: null });
  },
  isAuthenticated: () => !!get().token
}));
