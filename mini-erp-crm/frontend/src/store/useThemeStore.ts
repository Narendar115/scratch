import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

const INITIAL_DARK = localStorage.getItem('erp_theme') === 'dark' ||
  (!('erp_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

if (INITIAL_DARK) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: INITIAL_DARK,
  toggleTheme: () => {
    set((state) => {
      const nextState = !state.isDark;
      if (nextState) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('erp_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('erp_theme', 'light');
      }
      return { isDark: nextState };
    });
  }
}));
